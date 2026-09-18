#!/usr/bin/env bash
set -e

# ==============================================================================
# Google Gemini / Antigravity PostToolUse Hook
# Contract:
# - Input (stdin): JSON with stepIdx, tool error info, etc.
# - Output (stdout): Expects an empty JSON object {}
# ==============================================================================

INPUT=$(cat)
TARGET_PATH=$(echo "$INPUT" | grep -oE '"(TargetFile|file_path|path)":\s*"[^"]+"' | head -n 1 | cut -d'"' -f4 || true)

case "$TARGET_PATH" in
  *.ts | *.tsx | *.js | *.mjs)
    npm run lint >/dev/null 2>&1 || true
    ;;
esac

echo '{}'
exit 0
