import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import matter from 'gray-matter';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
for (const name of ['new-post', 'review-changes', 'e2e-testing']) {
  test(`shared skill ${name} has matching provider copies`, () => {
    const canonical = read(`.agents/skills/${name}/SKILL.md`);
    assert.equal(matter(canonical).data.name, name);
    assert.ok(matter(canonical).data.description);
    for (const provider of ['.claude', '.github']) {
      assert.equal(read(`${provider}/skills/${name}/SKILL.md`), canonical);
    }
  });
}
for (const role of ['reviewer', 'qa-tester']) {
  test(`${role} references an existing common role on every provider`, () => {
    const shared = `docs/agent-roles/${role}.md`;
    assert.ok(read(shared).length);
    const paths = role === 'reviewer'
      ? ['.claude/agents/reviewer.agent.md', '.agents/agents/reviewer.agent.md', '.github/agents/reviewer.agent.md']
      : ['.claude/agents/qa-tester.md', '.agents/agents/qa-tester.md', '.github/agents/qa-tester.agent.md'];
    for (const path of paths) {
      const content = read(path);
      assert.equal(matter(content).data.name, role);
      assert.ok(content.includes(shared));
    }
    assert.ok(read(`.codex/agents/${role}.toml`).includes(shared));
  });
}
test('MCP registrations share one launcher', () => {
  const canonical = JSON.parse(read('.mcp.json'));
  assert.deepEqual(JSON.parse(read('.agents/mcp_config.json')), canonical);
  const server = canonical.mcpServers['repo-github'];
  assert.equal(server.command, 'bash');
  assert.ok(read('.codex/config.toml').includes(server.args[1]));
  assert.ok(existsSync(new URL('../scripts/github-mcp.sh', import.meta.url)));
});
test('MCP launcher rejects missing credentials and forwards token precedence without printing tokens', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'agent-mcp-'));
  try {
    writeFileSync(join(temporary, 'npx'), '#!/bin/bash\n[[ "$GITHUB_PERSONAL_ACCESS_TOKEN" == "$EXPECTED_TOKEN" ]] || exit 9\n[[ "$*" == "-y @modelcontextprotocol/server-github" ]] || exit 8\n', { mode: 0o755 });
    const env = { PATH: `${temporary}:/usr/bin:/bin` };
    const script = new URL('../scripts/github-mcp.sh', import.meta.url).pathname;
    const missing = spawnSync('/bin/bash', [script], { env, encoding: 'utf8' });
    assert.equal(missing.status, 1);
    for (const credentials of [
      { GITHUB_TOKEN: 'dummy-fallback', EXPECTED_TOKEN: 'dummy-fallback' },
      { GITHUB_TOKEN: 'dummy-fallback', GITHUB_PERSONAL_ACCESS_TOKEN: 'dummy-primary', EXPECTED_TOKEN: 'dummy-primary' },
    ]) {
      const result = spawnSync('/bin/bash', [script], { env: { ...env, ...credentials }, encoding: 'utf8' });
      assert.equal(result.status, 0);
      assert.equal(result.stdout + result.stderr, '');
    }
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});

test('completion command runs lint, build and E2E in order while pre-commit keeps lint', () => {
  assert.equal(JSON.parse(read('package.json')).scripts.verify, 'npm run lint && npm run build && npm test');
  assert.ok(read('AGENTS.md').includes('npm run verify'));
  assert.ok(read('.githooks/pre-commit').includes('npm run lint'));
});
