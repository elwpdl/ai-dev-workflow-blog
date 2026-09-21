# W4 캡스톤 실행 증거

기준: `w3-complete` (`acc697d`)에서 시작한 `feature/5-w4-search`.

| 항목 | 실제 확인 | 증거 |
| --- | --- | --- |
| PRD | 문제, 성공 기준 AC1–10, 사용자 스토리, 요구사항과 비범위 | [PRD](../../prd.md) |
| 실행 단위 | 기능 #5 / 검증 #6 / 회고 #7에 인수 조건 작성 | [#5](https://github.com/elwpdl/ai-dev-workflow-blog/issues/5), [#6](https://github.com/elwpdl/ai-dev-workflow-blog/issues/6), [#7](https://github.com/elwpdl/ai-dev-workflow-blog/issues/7) |
| 실제 Red | 구현 전 검색 입력 부재로 1개 실패(exit 1); 당시 도구 출력 발췌 | [Red](red.txt) |
| Green | 기존 4 + 신규 5 = 9개 통과(exit 0) | [Green](green.txt), [테스트](../../../tests/search.spec.ts) |
| 빌드·린트 | 모두 exit 0 | [빌드](build.txt), [린트](lint.txt) |
| Hook·설정 | 27개·7개 통과(exit 0), 실제 pre/post 어댑터 호출 | [Hook](hook-tests.txt), [설정](config-tests.txt), [호출](hooks.jsonl) |
| 관측 회귀 | sanitizer 3개 및 disabled/auth/전송 시나리오 통과 | [관측](monitoring.txt) |
| Docker | 새 W4 이미지에서 E2E 9개, 홈 200, 검색 1개, probe 404, pageerror 0 | [E2E](container-e2e.txt), [응답](docker-runtime.json) |
| 화면 | 390px/1280px 입력·초기화·태그 배치와 가로 넘침 없음 확인 | [모바일](search-390.png), [데스크톱](search-1280.png) |
| AI 리뷰 | CodeRabbit CLI 실제 완료, findings 0 | [리뷰](coderabbit-review.jsonl) |
| 회고 | 자동화의 효과·병목·개인 의존성과 W4 근거형 질문 3개 | [회고](../../retrospective.md) |

## 검증 범위와 재현

- `npm run build`, `npm run lint`, `npm test`, `npm run test:hooks`,
  `npm run test:agent-config`, `npm run test:monitoring`을 사용했다.
- 개발 E2E는 기존 Playwright 설정의 3000 서버다. Docker E2E는
  `playwright.container.config.ts`의 baseURL만 `http://127.0.0.1:3101`로 덮어썼다.
  기존 W3 컨테이너의 런타임 환경을 보존하기 위해 별도 컨테이너로 검증했다.
- 이미지: `docker build -t ai-dev-workflow-blog:w4 .`.
  `docker run -d --name ai-blog-w4-verification --init --cap-drop ALL --security-opt no-new-privileges:true -p 127.0.0.1:3101:3000 ai-dev-workflow-blog:w4`.
  상태는 healthy, 실행 사용자는 node로 확인했다. 검증 뒤 컨테이너는 중지한다.
- Hook 증거는 공통 어댑터의 실제 실행이며 모든 제품의 자동 호스트 전달 증거가 아니다.
  보호 경로 probe는 payload만 전달했고 환경 파일을 생성·수정하지 않았다.
- Sentry Cloud 재수집은 하지 않았다. W3의 실제 대시보드 검증과 W4의 로컬 전송 회귀는 구분한다.
  검증용 Docker에는 DSN을 넣지 않았다. 검색어 분석 이벤트는 추가하지 않았다.
- 리뷰 실행 당시 나열된 파일만 CLI 검토 범위다. 이후 증거·회고 문서가 추가됐으며
  이들을 모두 AI가 승인했다는 의미가 아니다. GitHub 리뷰와 병합 상태는 통합 PR에서 확인한다.
- 유료 크레딧, 신규 의존성, 보호 CI 파일 변경 없음. 선택 과제인 신규 CI/CD 배포는 미수행이다.
