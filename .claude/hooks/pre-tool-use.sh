#!/usr/bin/env bash
set -euo pipefail

# Resolve from this script so hooks work from repository subdirectories.
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
exec node "$REPO_ROOT/scripts/agent-hooks.mjs" claude pre
