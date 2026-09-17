#!/usr/bin/env bash
set -e

# ==============================================================================
# PostToolUse Hook: Automated Formatting & Lint Inspection
# ==============================================================================
# 파일 수정 직후 정적 분석(ESLint)을 실행하여 코드 품질을 보장합니다.
# ==============================================================================

INPUT=""
TARGET_PATH=""

if [ ! -t 0 ]; then
  INPUT=$(cat)
fi

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

echo "--------------------------------------------------------"
echo "[PostToolUse Hook] 파일 수정 후 자동 검사 시작"
if [ -n "$TARGET_PATH" ]; then
  echo "수정 대상: $TARGET_PATH"
fi

# TypeScript / JavaScript 파일이 수정된 경우 lint 실행
case "$TARGET_PATH" in
  *.ts | *.tsx | *.js | *.mjs | "")
    echo "TypeScript/JavaScript 파일 수정 감지 -> npm run lint 실행 중..."
    if npm run lint; then
      echo "[PostToolUse Hook 성공] 린트 검사를 통과했습니다 (exit code 0)."
    else
      echo "[PostToolUse Hook 경고] 린트 검사에서 오류가 발견되었습니다." >&2
      exit 1
    fi
    ;;
  *)
    echo "정적 분석 대상 외 파일 ($TARGET_PATH) -> 린트 생략"
    ;;
esac

echo "--------------------------------------------------------"
exit 0
