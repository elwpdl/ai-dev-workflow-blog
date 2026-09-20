---
name: e2e-testing
description: Write and run Playwright E2E tests for changed user flows and regressions.
---

# e2e-testing

1. `AGENTS.md`, `docs/agent-roles/qa-tester.md`, 기존 tests와 `playwright.config.ts`를 읽습니다.
2. 사용자 흐름과 실패 조건을 검증하는 테스트를 tests/에 작성합니다. 기존 assertion을 약화하거나 테스트를 건너뛰지 않습니다.
3. `npm test`를 실행합니다. 현재 Playwright webServer는 `npm run dev`를 사용하며 로컬에서는 기존 localhost:3000 서버를 재사용할 수 있으므로 대상 저장소의 서버인지 확인합니다.
4. 화면 동작을 바꾸었다면 관련 화면 크기에서 레이아웃과 접근성을 확인합니다.
5. `npm run build`, `npm run lint`도 확인하고 명령·통과/실패 수·재현 절차·미검증 항목을 보고합니다. 제품 코드는 직접 고치지 않고 메인 에이전트에 결함을 전달합니다.
