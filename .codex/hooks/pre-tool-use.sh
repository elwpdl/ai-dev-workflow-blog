#!/usr/bin/env bash
set -e

# ==============================================================================
# OpenAI Codex PreToolUse Hook: Protected Path Enforcement
# ==============================================================================
# 규약:
# - 정상 허용: exit code 0
# - 차단 및 거부: exit code 2 (stderr에 거부 사유 출력)
# ==============================================================================

INPUT=""
TARGET_PATH=""

# 1. stdin에서 JSON 또는 파일 경로 읽기
if [ ! -t 0 ]; then
  INPUT=$(cat)
fi

# 2. 인자($1) 또는 stdin에서 target path 추출
if [ -n "$1" ]; then
  TARGET_PATH="$1"
elif [ -n "$INPUT" ]; then
  TARGET_PATH=$(echo "$INPUT" | grep -oE '"(file_path|TargetFile|path)":\s*"[^"]+"' | head -n 1 | cut -d'"' -f4 || true)
  if [ -z "$TARGET_PATH" ]; then
    TARGET_PATH="$INPUT"
  fi
fi

if [ -z "$TARGET_PATH" ]; then
  TARGET_PATH="${TOOL_FILE_PATH:-${FILE_PATH:-}}"
fi

CLEAN_PATH=$(echo "$TARGET_PATH" | sed -e 's|^./||')

block_access() {
  local reason="$1"
  echo "========================================================" >&2
  echo "[Codex PreToolUse Hook 차단 발생] 변경이 거부되었습니다." >&2
  echo "대상 경로: $CLEAN_PATH" >&2
  echo "차단 사유: $reason" >&2
  echo "프로젝트 헌법(AGENTS.md)의 '6. 절대 변경 금지 경로'를 확인하세요." >&2
  echo "========================================================" >&2
  exit 2
}

case "$CLEAN_PATH" in
  *.env* | */.env*)
    block_access "환경 변수 및 보안 시크릿 파일(.env*)은 수정/생성이 금지되어 있습니다."
    ;;
  .github/workflows/* | */.github/workflows/*)
    block_access "CI/CD 워크플로우(.github/workflows/)는 채점 및 자동화 보호 경로입니다."
    ;;
  package-lock.json | */package-lock.json)
    block_access "package-lock.json 수동 수정은 금지되어 있습니다. npm CLI를 사용하세요."
    ;;
  .git/* | */.git/*)
    block_access "Git 내부 메타데이터 디렉터리는 직접 수정할 수 없습니다."
    ;;
  *)
    echo "[Codex PreToolUse Hook 통과] $CLEAN_PATH 변경 승인 (exit 0)"
    exit 0
    ;;
esac
