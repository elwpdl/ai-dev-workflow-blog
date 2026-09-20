---
name: review-changes
description: Review repository changes for correctness, regressions, and missing tests.
---

# review-changes

1. `AGENTS.md`와 `docs/agent-roles/reviewer.md`를 읽습니다.
2. 메인 에이전트가 변경 diff와 검증 결과를 준비합니다. reviewer에게 전달할 때 관련 파일과 변경 목적을 함께 제공합니다.
3. reviewer는 읽기·검색만 사용하고 코드를 수정하거나 셸 명령을 실행하지 않습니다.
4. 재현 조건·영향·파일과 행이 있는 문제를 우선순위별로 보고합니다. 검증하지 못한 부분은 명시합니다.
