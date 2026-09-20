# W2 서브에이전트 정의와 worktree 격리 증거

확인일: 2026-09-20.

## 과제 충족 범위

TASK.md의 선택 과제는 서브에이전트 정의 **또는** worktree 병렬 작업이다.
reviewer·qa-tester를 각 제품의 네이티브 형식으로 정의했고 공통 역할은
`docs/agent-roles/`에서 관리한다. 제품별 실제 agent 호출은 이 기록의 범위가 아니다.
qa-tester의 tests/·docs/evidence/ 수정 범위는 작업 지침이며 OS 쓰기 권한 제한이 아니다.

## 실제 worktree 실행

- 메인 작업 공간: `f0c9c96` 기반 현재 구현과 보완한 E2E를 검증한다.
- 격리 작업 공간: `git worktree add --detach <임시경로>/baseline 07e9f23`으로 생성했다.
- `07e9f23`은 태그 필터 구현 전 W1 병합 커밋이다.
- 현재 `tests/tag-filter.spec.ts`를 격리 작업 공간에 복사해 동일한 테스트를 실행했다.
- 설치된 의존성은 node_modules 심볼릭 링크로 읽기 공유했다. 의존성 설치나 lockfile 변경은 하지 않았다.
- baseline은 별도 Playwright 설정에서 포트 3102, reuseExistingServer=false를 사용했다.
- 첫 병렬 실행에서 baseline Turbopack이 외부 node_modules 심볼릭 링크를 거부했다. 서버 시작 실패는 Red 증거로 사용하지 않고 `npm run dev -- --webpack --port 3102`로 재실행했다.
- 현재 구현은 CI=1로 기존 서버 재사용 없이 포트 3000에서 실행했다.
- 첫 실행은 두 프로세스를 병렬로 실행했고, baseline 재실행은 현재 구현 테스트 완료 후 수행했다. .next와 테스트 결과는 각 작업 공간에 분리된다.
- Red/Green 결과는 `playwright-before.txt`, `playwright-after.txt`에 저장했다.

이는 과거 실행을 추정한 기록이 아니라 현재 수행한 과거 커밋 재검증이다.
서브에이전트가 테스트를 작성했다고 주장하지 않는다. 임시 worktree는 증거 재현을 위해
남겨 두었으며 경로는 `git worktree list`로 확인한다. 정리는 사용자 요청 시 수행한다.

## 충돌 방지 경계

제품 코드와 테스트 수정의 책임을 분리하고, 병렬 수정 시 별도 worktree를 사용한다.
Claude의 isolation: worktree, Antigravity 호출 시 branch workspace와
Codex·Copilot 호출자의 작업 공간 준비 방식은 동일하지 않다.
구체적인 제품별 지원 차이는 `docs/agent-configuration.md`를 참고한다.
