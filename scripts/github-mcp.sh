#!/usr/bin/env bash
set -euo pipefail
export GITHUB_PERSONAL_ACCESS_TOKEN="${GITHUB_PERSONAL_ACCESS_TOKEN:-${GITHUB_TOKEN:-}}"
if [[ -z "$GITHUB_PERSONAL_ACCESS_TOKEN" ]]; then
  echo "GitHub MCP requires GITHUB_PERSONAL_ACCESS_TOKEN or GITHUB_TOKEN." >&2
  exit 1
fi
exec npx -y @modelcontextprotocol/server-github
