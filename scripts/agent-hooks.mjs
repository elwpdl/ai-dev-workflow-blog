import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const editors = new Set([
  "str_replace", "str_replace_editor", "write", "edit", "multiedit", "notebookedit", "create", "create_file",
  "write_to_file", "replace_file_content", "multi_replace_file_content",
  "replace_string_in_file", "multi_replace_string_in_file", "insert_edit_into_file",
]);
const shells = new Set(["bash", "powershell", "run_command", "exec_command"]);

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
  if (["str_replace_editor", "str_replace"].includes(name) && args.command === "view") return [];
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

// Deliberately limited grammar: never execute a command to classify it.
// Compound commands, expansions and unknown options must use a native read tool.
function isReadOnlyShell(command) {
  if (/[\n\r;&|<>`$(){}\\]/.test(command)) return false;
  const tokens = [];
  const word = /(?:[^\s"']+|"[^"']*"|'[^']*')+/y;
  let offset = 0;
  while (offset < command.length) {
    if (/\s/.test(command[offset])) { offset += 1; continue; }
    word.lastIndex = offset;
    const match = word.exec(command);
    if (!match) return false;
    tokens.push(match[0].replace(/["']/g, ""));
    offset = word.lastIndex;
  }
  if (!tokens.length) return false;
  const executable = tokens.shift();
  if (executable.includes("/") && !/^\/(?:usr\/)?bin\/[^/]+$/.test(executable)) return false;
  const name = path.basename(executable);
  const options = {
    cat: /^(?:-[AbEnstTuv]+|--(?:number|number-nonblank|show-all))$/,
    head: /^(?:-[nqc]+|-[0-9]+|--(?:lines|bytes)(?:=\d+)?)$/,
    tail: /^(?:-[nqc]+|-[0-9]+|--(?:lines|bytes)(?:=\d+)?)$/,
    wc: /^-[clmwL]+$/,
    ls: /^-[aAdFhlnprRt1]+$/,
    stat: /^-[fLtx]+$/,
    grep: /^(?:-[EinvclHhFwoxq]+|--(?:line-number|ignore-case|fixed-strings))$/,
    rg: /^(?:-[nliIcHFwovq]+|--(?:files|hidden|no-ignore|line-number|ignore-case|fixed-strings))$/,
  };
  if (!options[name]) return false;
  let positionalOnly = false;
  return tokens.every((token) => {
    if (token === "--") { positionalOnly = true; return true; }
    return positionalOnly || !token.startsWith("-") || options[name].test(token);
  });
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
    const literal = command.replace(/["'`\\]/g, "");
    if (!isReadOnlyShell(command) && /(?:^|[\s/;=<>({])(?:\.env[^\s/;]*|\.git(?:[\s/;)]|$)|\.github\/workflows(?:[\s/;)]|$)|package-lock\.json(?:[\s/;)]|$))/i.test(literal)) {
      return "Protected path write or unclassified shell command. Use a simple read-only command or a native read tool; use npm for lockfile updates.";
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

export function handleHook(provider, phase, payload) {
  if (!["claude", "codex", "antigravity", "copilot"].includes(provider) || !["pre", "post"].includes(phase)) {
    throw new Error("Unknown hook provider or phase.");
  }
  // Backward compatibility for previously loaded sessions: no subprocess or lint.
  if (phase === "post") return { output: {}, status: 0 };
  try {
    const call = decode(provider, payload);
    return { output: preResult(provider, denyReason(call, editedPaths(call.name, call.args))), status: 0 };
  } catch {
    const message = "Hook input could not be validated. Check the tool payload and hook configuration.";
    return { output: preResult(provider, message), status: 0, diagnostic: message };
  }
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
