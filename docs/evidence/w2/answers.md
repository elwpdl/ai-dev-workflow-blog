# 2주차(W2) 질문 1~3 답변

[docs/w2-reflection.md](../../w2-reflection.md) 원본 참조.

---

### 1. 연결한 MCP에서 읽기 전용으로 충분한 지점과 쓰기 권한이 필요한 지점을 어떻게 나눴나요?
- **읽기 전용 (자율 실행 허용)**: `search_code`, `search_issues`, `get_issue`, `get_pull_request`, `list_pull_requests` 등 상태를 변경하지 않고 정보만 수집하는 조회 도구. 부작용이 없으므로 에이전트 자율 호출 허용.
- **쓰기 / 변경 (사람 승인 필수)**: `merge_pull_request`, `update_pull_request_branch`, `create_pull_request_review` 등 main 브랜치와 CI 파이프라인에 직접적 영향을 주는 도구. 자동화 테스트 전체 통과 및 인간 리뷰어 승인이 있을 때만 실행.

### 2. claude.md(및 AGENTS.md)에 브랜치·커밋·PR 규칙을 넣기 전과 후에 AI의 결과물이 어떻게 달라졌나요?
- **규칙 전**: `main` 직접 수정, `update` 같은 모호한 커밋 메시지, PR 템플릿 미준수로 인한 맥락 누락.
- **규칙 후**: 이슈 번호 기반 브랜치(`feature/1-tag-filter`), Conventional Commits(`feat: ... (#1)`), PR 템플릿 표준 항목(What, Why, DoD, E2E 증거)을 갖춘 완전한 PR 자동 작성.

### 3. Playwright 시나리오가 이 기능의 무엇을 보장하고, 무엇은 여전히 보장하지 못하나요?
- **보장하는 것**: 실제 브라우저 환경에서의 사용자 인터랙션(태그 클릭 필터링, 전체 복원), Red-Green TDD 사이클 검증, 추후 리팩토링 시 기능 회귀 방지.
- **보장하지 못하는 것**: 시각적 디자인 심미성(Visual Regression), 대규모 게시물 렌더링 성능 지연, 스크린 리더 친화성 등의 웹 접근성(a11y).
