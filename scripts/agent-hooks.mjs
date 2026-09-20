import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const editors = new Set([
  "str_replace", "str_replace_editor", "write", "edit", "multiedit", "notebookedit", "create", "create_file",
  "write_to_file", "replace_file_content", "multi_replace_file_content",
  "replace_string_in_file", "multi_replace_string_in_file", "insert_edit_into_file",
]);
const shells = new Set(["bash", "powershell", "run_command", "exec_command"]);
const sourceFile = /\.(?:[cm]?[jt]sx?)$/i;

function object(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Expected a JSON object.");
  }
  return value;
}

function requiredString(value) {
  if (typeof value !== "string" || !value.trim() || value.includes("\0")) {
    throw new Error("Expected a non-empty string.");
  }
  return value;
}

function decode(provider, payload) {
  object(payload);
  const call = provider === "antigravity" ? object(payload.toolCall) : payload;
  const name = requiredString(call.name ?? call.tool_name ?? call.toolName).toLowerCase();
  const raw = call.args ?? call.tool_input ?? call.toolArgs;
  const args = object(typeof raw === "string" ? JSON.parse(raw) : raw);
  return { name, args, cwd: args.Cwd ?? payload.cwd ?? projectRoot };
}

function editedPaths(name, args) {
  if (name === "apply_patch") {
    // Codex sends the patch as tool_input.command, not file_path.
    const patch = requiredString(args.command ?? args.input ?? args.patch);
    const paths = [...patch.matchAll(/^\*\*\* (?:Add File|Update File|Delete File|Move to): (.+)\r?$/gm)]
      .map((match) => match[1].trim());
    if (paths.length === 0) throw new Error("Patch has no file headers.");
    return paths;
  }
  if (!editors.has(name)) return [];
  if (Array.isArray(args.replacements)) {
    if (args.replacements.length === 0) throw new Error("Empty edit list.");
    return args.replacements.flatMap((edit) => editedPaths("edit", object(edit)));
  }
  return [requiredString(args.file_path ?? args.TargetFile ?? args.path ?? args.filePath ?? args.notebook_path)];
}

function canonicalPath(target) {
  // Resolve existing symlink ancestors even when the new file does not exist yet.
  try {
    return realpathSync(target);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const parent = path.dirname(target);
    if (parent === target) return target;
    return path.join(canonicalPath(parent), path.basename(target));
  }
}

function protectedPath(target) {
  const parts = target.replaceAll("\\", "/").toLowerCase().split("/");
  return parts.some((part, index) =>
    part.startsWith(".env") || part === ".git" || part === "package-lock.json" ||
    (part === ".github" && parts[index + 1] === "workflows"));
}

function denyReason(call, paths) {
  for (const target of paths) {
    const absolute = path.resolve(requiredString(call.cwd), target);
    if (protectedPath(absolute) || protectedPath(canonicalPath(absolute))) {
      return "Protected path: use npm for lockfile changes; do not edit environment, Git metadata, or CI files.";
    }
  }
  if (shells.has(call.name)) {
    const command = requiredString(call.args.command ?? call.args.CommandLine);
    // Conservative literal-path check, not a shell interpreter or sandbox.
    // Strip shell quoting to also detect adjacent quoted fragments.
    const literal = command.replace(/["'\\]/g, "");
    if (/(?:^|[\s/;=<>({])(?:\.env[^\s/;]*|\.git(?:[\s/;)]|$)|\.github\/workflows(?:[\s/;)]|$)|package-lock\.json(?:[\s/;)]|$))/i.test(literal)) {
      return "Shell command references a protected path. Use a read tool for inspection and npm for lockfile updates.";
    }
  }
  return null;
}

function preResult(provider, reason) {
  if (provider === "antigravity") {
    return { decision: reason ? "deny" : "allow", ...(reason ? { reason } : {}) };
  }
  // Abstain on allowed calls so the host's existing permission flow still applies.
  if (!reason) return {};
  if (provider === "copilot") {
    return { permissionDecision: "deny", permissionDecisionReason: reason };
  }
  return { hookSpecificOutput: {
    hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: reason,
  } };
}

function postResult(provider, message) {
  if (!message || provider === "antigravity") return {};
  if (provider === "copilot") return { additionalContext: message };
  return { hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: message } };
}

export function handleHook(provider, phase, payload, runLint = lint) {
  if (!["claude", "codex", "antigravity", "copilot"].includes(provider) || !["pre", "post"].includes(phase)) {
    throw new Error("Unknown hook provider or phase.");
  }
  try {
    const call = decode(provider, payload);
    const paths = editedPaths(call.name, call.args);
    if (phase === "pre") return { output: preResult(provider, denyReason(call, paths)), status: 0 };
    if (!paths.some((target) => sourceFile.test(target))) return { output: {}, status: 0 };
    const result = runLint();
    const message = result.ok ? null : "PostToolUse lint failed. Run npm run lint and fix the reported errors before completing the task.";
    return {
      output: postResult(provider, message),
      status: message && provider === "antigravity" ? 1 : 0,
      diagnostic: message ? `${message}\n${result.diagnostic ?? ""}` : undefined,
    };
  } catch {
    // Never echo raw tool input: commands and edited content can contain secrets.
    const message = "Hook input could not be validated. Check the tool payload and hook configuration.";
    return {
      output: phase === "pre" ? preResult(provider, message) : postResult(provider, message),
      status: phase === "post" && provider === "antigravity" ? 1 : 0,
      diagnostic: message,
    };
  }
}

function lint() {
  const result = spawnSync("npm", ["run", "lint"], {
    cwd: projectRoot, encoding: "utf8", timeout: 90_000, maxBuffer: 1024 * 1024,
  });
  return {
    ok: result.status === 0,
    diagnostic: result.error ? "Lint could not start or exceeded its timeout." : `${result.stdout ?? ""}${result.stderr ?? ""}`,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [provider, phase] = process.argv.slice(2);
  let payload;
  try {
    payload = JSON.parse(readFileSync(0, "utf8"));
  } catch {
    payload = null;
  }
  const result = handleHook(provider, phase, payload);
  if (result.diagnostic) process.stderr.write(`${result.diagnostic}\n`);
  process.stdout.write(`${JSON.stringify(result.output)}\n`);
  process.exitCode = result.status;
}
