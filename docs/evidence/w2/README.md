# W2 완료 증거

확인일: 2026-09-20. 기준: 저장소 `TASK.md`의 W2 필수 과제 3개와 선택 확장 1개.
필수 과제와 선택 확장을 모두 충족한다. 제품별 실제 agent 호출 검증은 W2 기준에 포함되지 않는다.

| 과제 | 확인 결과 | 증거 |
| --- | --- | --- |
| MCP 실제 응답·권한 경계 | 공통 launcher로 initialize, tools/list(26개), get_issue(#1) 성공. 읽기·쓰기와 사용자 승인 정책 기록 | [응답 원본](mcp-live-response.json), [연결·권한 설명](mcp-response.txt) |
| 이슈 기반 기능·PR | 이슈 #1 → feature/1-tag-filter → PR #2, 2026-09-17 병합. PR 본문에 이슈·구현·테스트·완료 체크리스트 존재 | [원격 PR 조회](github-pr.json), [이슈](https://github.com/elwpdl/ai-dev-workflow-blog/issues/1), [PR](https://github.com/elwpdl/ai-dev-workflow-blog/pull/2) |
| E2E Red/Green | 구현 전 07e9f23에서 필터 부재로 2개 실패(exit 1), 현재 코드에서 태그 2개와 기존 2개 모두 통과(exit 0) | [Red](playwright-before.txt), [Green](playwright-after.txt), [테스트](../../../tests/tag-filter.spec.ts) |
| 선택: agent 정의 또는 worktree | reviewer·qa-tester 정의 및 실제 baseline worktree 생성·테스트 실행, 충돌 방지 경계 기록 | [격리 기록](worktree-and-agents.md), [공통 역할](../../agent-roles/qa-tester.md) |
| 근거형 답변 | 과장된 권한 강제·전후 비교 표현을 실제 근거와 한계로 교정 | [회고](../../w2-reflection.md) |

## 추가 완료 검증

[검증 로그](validation.txt): 설정 테스트 7개, hook 테스트 27개, 빌드·린트 모두 종료 코드 0.
E2E 4개 통과 기록은 Green 로그에 있다.

## 재현 조건과 증거 해석

- 현재 검증 기준 코드는 f0c9c96 + 이번 테스트 보완이다. 파일 해시는 [manifest.json](manifest.json)에 기록한다.
- Red는 당시 작성한 원본 로그가 아니라 현재 테스트를 과거 커밋에서 실행한 재검증이다.
- Red의 서버는 Webpack/3102, Green은 프로젝트 기본 Turbopack/3000이다. 두 실행 모두 개발 서버다.
- 기존 로그는 출처가 불분명한 수기 증거 대신 이번에 수집한 실제 출력으로 갱신했다.
- MCP는 기존 gh 인증을 실행 프로세스에만 전달했다. 새 CLI 세션은 토큰 환경을 별도 제공해야 한다.
- 제품별 모델 세션·agent 호출·UI 로드 확인은 [설정 문서](../../agent-configuration.md)의 미검증 범위로 유지한다.
- 기존 PR 본문은 당시 설정 이름을 포함하는 이력이다. 현재 설정은 설정 문서를 따른다.
- 이번 보완은 원격 이슈·PR·승인 상태를 변경하지 않았다. 이슈/PR을 새로 만들거나 다시 병합할 필요가 없다.
