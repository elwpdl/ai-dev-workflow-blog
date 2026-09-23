# Hook 호스트 실호출 검증 (2026-09-23)

이 문서는 `npm run test:hooks`의 어댑터 단위 테스트와 별도로, 실제 제품이
프로젝트 Hook을 로드하고 도구 호출을 차단하는지 확인한 결과다. 시크릿과 토큰은
출력하거나 문서에 저장하지 않았다.

| 제품 | 상태 | 확인 결과 |
| --- | --- | --- |
| Codex CLI 0.154.0 | 일회성 실호출 차단 확인 | `gpt-5.5`, read-only 샌드박스에서 `cat package-lock.json | wc -c` 호출. 일반 실행은 파일 크기만 출력하여 Hook이 실행되지 않았다. 검토한 Hook을 이번 실행에서만 신뢰하도록 한 뒤 같은 명령은 `Command blocked by PreToolUse hook`로 차단됐다. |
| Claude Code | 미검증 | 현재 셸 PATH에 CLI 실행 파일이 없다. |
| Antigravity CLI·2.0 | 미검증 | 현재 셸 PATH에 CLI 실행 파일이 없다. 2.0 UI 로드도 확인하지 못했다. |
| Copilot CLI | 미검증 | 현재 셸 PATH에 CLI 실행 파일이 없다. |

Codex의 두 실행 모두 프로젝트 설정과 동일한 `PreToolUse` matcher를 사용했다.
후자는 `--dangerously-bypass-hook-trust`를 **신뢰 정의를 사전 검토한 단일
검증 실행에만** 사용했다. 이 옵션은 샌드박스나 도구 승인 우회 옵션이 아니다.
전자는 Hook이 적용되지 않은 실제 결과이며, 원인은 지속 신뢰 상태로 추정된다.
현재 프로젝트 Hook이 모든 새 Codex 세션에서 자동 활성화된다는 증거는 없다.
사용자는 Codex CLI의 `/hooks`에서 프로젝트 정의를 검토하고 신뢰해야 한다.

처음 시도한 기본 설정 모델 `gpt-6-sol`은 이 CLI의 ChatGPT 계정에서
`invalid_request_error`로 거부돼 도구 호출이 없었다. `gpt-5.5`로 실제 호출을
재실행했다. 이 모델 변경은 검증 실행에만 적용했으며 설정 파일은 바꾸지 않았다.
검증 명령은 읽기 전용 파이프이고 파일 내용을 출력하지 않았다. 보호 경로·Git
이력·CI 파일은 수정하지 않았다.

- [Codex Hooks 공식 문서: 위치·신뢰·지원 도구](https://learn.chatgpt.com/docs/hooks)
- 후속 실호출: 다른 CLI 설치·로그인 후 실제 제품에서 단순 읽기 허용과 안전한
  복합 읽기 거부를 확인하고, Codex는 `/hooks` 신뢰 후 우회 옵션 없이 재검증한다.
