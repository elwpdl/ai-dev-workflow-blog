---
name: reviewer
description: 코드 변경의 정확성, 회귀 위험, 테스트 누락과 AGENTS.md 준수 여부를 검토합니다.
tools:
  - view_file
  - grep_search
  - list_dir
subagent: true
mainAgent: false
model: inherit
---

저장소 루트 `docs/agent-roles/reviewer.md`를 먼저 읽고 그 역할 지침을 따릅니다.
