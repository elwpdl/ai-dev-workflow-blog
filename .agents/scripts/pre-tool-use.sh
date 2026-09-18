#!/usr/bin/env bash
set -e

# ==============================================================================
# Google Gemini / Antigravity PreToolUse Hook
# Contract:
# - Input (stdin): JSON with toolCall.name and toolCall.args
# - Output (stdout): JSON with {"decision": "allow"} or {"decision": "deny", "reason": "..."}
# ==============================================================================

INPUT=$(cat)

# 경로 추출 (TargetFile, file_path, path 등)
TARGET_PATH=$(echo "$INPUT" | grep -oE '"(TargetFile|file_path|path)":\s*"[^"]+"' | head -n 1 | cut -d'"' -f4 || true)

if [ -n "$TARGET_PATH" ]; then
  case "$TARGET_PATH" in
    *.env* | */.env*)
      echo '{"decision": "deny", "reason": "환경 변수(.env*)는 프로젝트 헌법(GEMINI.md)에 의해 보호됩니다."}'
      exit 0
      ;;
    .github/workflows/* | */.github/workflows/*)
      echo '{"decision": "deny", "reason": "CI/CD 워크플로우(.github/workflows/)는 평가 보호 경로입니다."}'
      exit 0
      ;;
    package-lock.json | */package-lock.json)
      echo '{"decision": "deny", "reason": "package-lock.json 수동 수정은 금지되어 있습니다."}'
      exit 0
      ;;
    .git/* | */.git/*)
      echo '{"decision": "deny", "reason": "Git 내부 메타데이터는 직접 수정할 수 없습니다."}'
      exit 0
      ;;
  esac
fi

# 기본 허용
echo '{"decision": "allow"}'
exit 0
