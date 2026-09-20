import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { handleHook } from "./agent-hooks.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const providers = ["claude", "codex", "antigravity", "copilot"];

function payload(provider, tool, args, cwd = root) {
  if (provider === "antigravity") return { toolCall: { name: tool, args }, workspacePaths: [cwd] };
  if (provider === "copilot") return { toolName: tool, toolArgs: JSON.stringify(args), cwd };
  return { tool_name: tool, tool_input: args, cwd };
}

function denied(result) {
  return result.output.decision === "deny" || result.output.permissionDecision === "deny" ||
    result.output.hookSpecificOutput?.permissionDecision === "deny";
}

for (const provider of providers) {
  const editor = provider === "antigravity" ? "write_to_file" : provider === "copilot" ? "edit" : "Write";
  const fileArgs = (target) => provider === "antigravity" ? { TargetFile: target } : { file_path: target };

  test(`${provider}: block every protected path, including absolute and normalized paths`, () => {
    for (const target of [".env", ".env.local", ".github/workflows/ci.yml", "package-lock.json", ".git/config",
      "app/../.github/workflows/ci.yml", path.join(root, "package-lock.json")]) {
      assert.ok(denied(handleHook(provider, "pre", payload(provider, editor, fileArgs(target)))), target);
    }
  });

  test(`${provider}: permit source edits and reads without approving host permissions`, () => {
    const result = handleHook(provider, "pre", payload(provider, editor, fileArgs("app/page.tsx")));
    assert.equal(denied(result), false);
    assert.deepEqual(result.output, provider === "antigravity" ? { decision: "allow" } : {});
    const reader = provider === "antigravity" ? "view_file" : "Read";
    assert.equal(denied(handleHook(provider, "pre", payload(provider, reader, fileArgs("package-lock.json")))), false);
  });

  test(`${provider}: reject invalid inputs without leaking payload content`, () => {
    for (const value of [null, [], {}, payload(provider, editor, {}), payload(provider, editor, fileArgs(123))]) {
      assert.ok(denied(handleHook(provider, "pre", value)));
    }
    const value = payload(provider, editor, { content: "fixture-secret-do-not-echo" });
    assert.ok(!JSON.stringify(handleHook(provider, "pre", value)).includes("fixture-secret"));
  });

  test(`${provider}: inspect the actual shell command field`, () => {
    const tool = provider === "antigravity" ? "run_command" : "Bash";
    const commandArgs = (command) => provider === "antigravity" ? { CommandLine: command, Cwd: root } : { command };
    for (const command of ["touch package-lock.json", "echo value > .env.local", "rm -rf .git", "touch .github/workflows/ci.yml", "touch 'package-'\"lock.json\""]) {
      assert.ok(denied(handleHook(provider, "pre", payload(provider, tool, commandArgs(command)))));
    }
    for (const command of ["npm run lint", "npm install", "git status --short"]) {
      assert.equal(denied(handleHook(provider, "pre", payload(provider, tool, commandArgs(command)))), false);
    }
  });

  test(`${provider}: lint only file mutations and surface lint failure`, () => {
    let runs = 0;
    const runLint = () => { runs += 1; return { ok: false, diagnostic: "fixture lint failure" }; };
    const result = handleHook(provider, "post", payload(provider, editor, fileArgs("app/page.tsx")), runLint);
    assert.equal(runs, 1);
    assert.match(result.diagnostic, /fixture lint failure/);
    assert.equal(result.status, provider === "antigravity" ? 1 : 0);
    if (provider !== "antigravity") assert.match(JSON.stringify(result.output), /lint failed/);
    handleHook(provider, "post", payload(provider, "Read", fileArgs("app/page.tsx")), runLint);
    handleHook(provider, "post", payload(provider, editor, fileArgs("content/posts/example.md")), runLint);
    assert.equal(runs, 1);
  });
}

test("Codex: inspect all patch headers, including move destinations", () => {
  for (const command of [
    "*** Begin Patch\n*** Update File: app/page.tsx\n@@\n-old\n+new\n*** Update File: package-lock.json\n@@\n-old\n+new\n*** End Patch",
    "*** Begin Patch\n*** Update File: app/page.tsx\n*** Move to: .env.local\n@@\n-old\n+new\n*** End Patch",
    "*** Begin Patch\n*** Delete File: .github/workflows/ci.yml\n*** End Patch",
  ]) {
    assert.ok(denied(handleHook("codex", "pre", payload("codex", "apply_patch", { command }))));
  }
  let runs = 0;
  const command = "*** Begin Patch\n*** Update File: app/page.tsx\n@@\n-old\n+new\n*** End Patch";
  const input = payload("codex", "apply_patch", { command });
  assert.equal(denied(handleHook("codex", "pre", input)), false);
  handleHook("codex", "post", input, () => { runs += 1; return { ok: true }; });
  assert.equal(runs, 1);
  assert.ok(denied(handleHook("codex", "pre", payload("codex", "apply_patch", { command: "bad patch" }))));
});

test("resolve symlink ancestors and cwd before checking file writes", () => {
  const directory = mkdtempSync(path.join(tmpdir(), "agent-hook-paths-"));
  try {
    mkdirSync(path.join(directory, ".github/workflows"), { recursive: true });
    symlinkSync(path.join(directory, ".github/workflows"), path.join(directory, "alias"));
    const input = payload("claude", "Write", { file_path: "alias/new.yml" }, directory);
    assert.ok(denied(handleHook("claude", "pre", input)));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("Copilot: accept object arguments and VS Code-compatible payloads", () => {
  for (const input of [
    { toolName: "edit", toolArgs: { path: "package-lock.json" }, cwd: root },
    { tool_name: "edit", tool_input: { path: "package-lock.json" }, cwd: root },
  ]) assert.ok(denied(handleHook("copilot", "pre", input)));
});

function configurations() {
  const json = (file) => JSON.parse(readFileSync(path.join(root, file), "utf8"));
  return [
    ["claude", json(".claude/settings.json").hooks],
    ["codex", json(".codex/hooks.json").hooks],
    ["antigravity", Object.assign({}, ...Object.values(json(".agents/hooks.json")))],
    ["copilot", Object.assign({}, ...["validation", "formatting"].map((name) => {
      const config = json(`.github/hooks/${name}.json`);
      assert.equal(config.version, 1);
      return config.hooks;
    }))],
  ];
}

test("registered pre hooks run from a subdirectory and emit native denial JSON", () => {
  for (const [provider, hooks] of configurations()) {
    const entries = hooks.PreToolUse ?? hooks.preToolUse;
    assert.ok(Array.isArray(entries));
    for (const group of entries) {
      const handlers = provider === "copilot" ? [group] : group.hooks;
      assert.ok(Array.isArray(handlers));
      for (const handler of handlers) {
        assert.equal(handler.type, "command");
        const input = provider === "antigravity"
          ? payload(provider, "write_to_file", { TargetFile: path.join(root, "package-lock.json") })
          : payload(provider, "edit", { path: "package-lock.json" });
        const result = spawnSync("bash", ["-c", handler.command ?? handler.bash], {
          cwd: path.join(root, "app"), input: JSON.stringify(input), encoding: "utf8",
        });
        assert.equal(result.status, 0, result.stderr);
        assert.ok(denied({ output: JSON.parse(result.stdout) }), provider);
      }
    }
  }
});

test("registered post hooks preserve JSON stdout and report a real lint process failure", () => {
  const directory = mkdtempSync(path.join(tmpdir(), "agent-hook-lint-"));
  try {
    writeFileSync(path.join(directory, "npm"), '#!/bin/sh\necho "fixture lint process failed" >&2\nexit 1\n', { mode: 0o755 });
    for (const [provider, hooks] of configurations()) {
      const entries = hooks.PostToolUse ?? hooks.postToolUse;
      assert.ok(Array.isArray(entries));
      for (const group of entries) {
        for (const handler of provider === "copilot" ? [group] : group.hooks) {
          const input = provider === "antigravity"
            ? payload(provider, "write_to_file", { TargetFile: path.join(root, "app/page.tsx") })
            : payload(provider, "edit", { path: "app/page.tsx" });
          const result = spawnSync("bash", ["-c", handler.command ?? handler.bash], {
            cwd: path.join(root, "app"), input: JSON.stringify(input), encoding: "utf8",
            env: { ...process.env, PATH: `${directory}${path.delimiter}${process.env.PATH}` },
          });
          assert.equal(result.status, provider === "antigravity" ? 1 : 0);
          const output = JSON.parse(result.stdout);
          assert.match(result.stderr, /fixture lint process failed/);
          if (provider === "antigravity") assert.deepEqual(output, {});
          else assert.match(JSON.stringify(output), /lint failed/);
        }
      }
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("Markdown agents include discovery metadata and a substantive prompt", () => {
  for (const file of [".claude/agents/reviewer.agent.md", ".claude/agents/qa-tester.md",
    ".agents/agents/reviewer.agent.md", ".agents/agents/qa-tester.md",
    ".github/agents/reviewer.agent.md", ".github/agents/qa-tester.agent.md"]) {
    const parsed = matter(readFileSync(path.join(root, file), "utf8"));
    assert.equal(typeof parsed.data.name, "string", file);
    assert.equal(typeof parsed.data.description, "string", file);
    assert.ok(parsed.content.trim().length > 40, file);
  }
});

test("Copilot edit aliases deny protected paths", () => {
  for (const tool of ["str_replace", "str_replace_editor"]) {
    assert.ok(denied(handleHook("copilot", "pre", payload("copilot", tool, { path: ".env.local" }))));
    assert.equal(denied(handleHook("copilot", "pre", payload("copilot", tool, { path: "app/page.tsx" }))), false);
  }
});
