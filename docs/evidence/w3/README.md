# W3 검증 증거

확인일: 2026-09-21 (Asia/Seoul). 작업 이슈: [#3](https://github.com/elwpdl/ai-dev-workflow-blog/issues/3).

| 항목 | 결과 | 증거 |
| --- | --- | --- |
| Docker 빌드 | Next.js standalone production 이미지 빌드 성공 | [빌드 출력](docker-build.txt) |
| 컨테이너 실행 | UID 1000, healthy, 홈·게시글·정적 CSS 200, 없는 글 404 | [HTTP/런타임 결과](docker-runtime.json) |
| 컨테이너 E2E | 실제 localhost:3100 production 서버에서 4개 통과 | [Playwright 출력](container-e2e.txt) |
| Sentry SDK 전송 | 비활성/토큰/DSN/인증 경계와 matching envelope 수신 검증 | [로컬 검증](validation.txt) |
| Sentry Cloud 수집 | 앱에서 발생시킨 event ID를 로그인한 대시보드에서 대조 완료 | [수집 기록](sentry-event.json), [실제 오류](https://djhobby.sentry.io/issues/7744130498/events/fb01fae9128c4e96a32e73f95f11b929/) |
| AI 리뷰 | CodeRabbit CLI 2회와 실제 PR 리뷰 완료. CLI major 2건 및 PR breadcrumb 지적 1건 수정 | [PR 리뷰](https://github.com/elwpdl/ai-dev-workflow-blog/pull/4#pullrequestreview-5262581424), [리뷰 처리 내역](review-resolution.json), [실행 명세](../../w3-review-workflow.md) |

## 검증 범위

로컬 빌드·린트, SDK transport 검증, 설정 검사 7개, hook 검사 27개와 E2E 4개 통과.
컨테이너에서 동일 E2E 4개도 통과했다. transport 수신기만 통과한 결과와 실제 Sentry
대시보드 수집을 구분하며, 이번에는 서버 측 오류의 실제 수집도 확인했다.
브라우저 SDK 코드도 포함하지만 현재 실행 이미지의 NEXT_PUBLIC_SENTRY_DSN은 비어 있어
브라우저 실전송은 별도 검증하지 않았다. SDK가 사용자 코드를 전부 자동으로 검증하는 것은 아니다.

Sentry 테스트 엔드포인트는 전송 후 비활성화하고 404 응답을 확인했다.
DSN·관리 API 토큰·검증용 비밀값은 저장소에 기록하지 않았다.
Docker 컨테이너는 127.0.0.1:3100에서 실행 중이며 현재 서버 DSN은 컨테이너 환경으로만 제공했다.
쉘 환경에 DSN을 다시 제공하지 않고 compose up을 실행하면 빈 기본값으로 재생성될 수 있다.

GitHub Actions YAML은 보호 경로 규칙에 따라 docs/workflows/에만 저장했다.
이 YAML을 현재 저장소에서 실행한 Actions URL은 없으며, AI 리뷰 봇/CLI 실행과 혼동하지 않는다.
클라우드 인프라 배포와 Langfuse는 선택 확장이므로 이번 필수 범위에 포함하지 않았다.

리뷰 JSONL의 workingDirectory와 검증 로그의 로컬 절대 경로는 공개 증거에서 비식별화했다.

## 완료 상태

TASK.md의 W3 필수 과제 3개를 충족했다. [PR #4](https://github.com/elwpdl/ai-dev-workflow-blog/pull/4)는
열린 상태이며 병합과 w3-complete 태그는 이 작업에서 수행하지 않는다.
PR 리뷰의 마지막 breadcrumb 수정은 빌드·린트·sanitizer 회귀 테스트로 확인했다.
무료 시간당 리뷰 한도 소진으로 해당 수정 이후의 새 AI 재리뷰는 요청하지 않았다.
[리뷰 링크와 지적](github-review.json), [검증 파일 해시](manifest.json)를 함께 보관한다.

검증 출력의 의미는 보존하고 행 끝 공백만 정리했다. 최종 이미지는 `w3-final-verification` 이벤트로 대시보드 수집을 다시 확인했다.
