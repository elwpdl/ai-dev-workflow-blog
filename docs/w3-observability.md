# W3 오류 관측과 운영 기준

## 비용과 실행 구조

앱은 `docker compose up --build -d`로 로컬 127.0.0.1:3100에 실행한다.
Sentry는 무료 Developer 프로젝트에 연결한다. 유료 플랜·Seer·추가 사용량 결제는
이 구성에서 활성화하지 않는다. 현재 Docker RAM 약 8GB로는 공식 self-hosted 요구사항
(RAM 16GB + swap 16GB)을 충족하지 못하므로 Sentry 서버를 Compose에 넣지 않았다.

오류 이벤트만 수집한다. tracesSampleRate=0이며 Replay와 로그 수집은 활성화하지 않는다.
무료 할당량과 기능은 계정의 Billing/Usage에서 확인한다. 아래 경보는 운영 목표이며
무료 플랜에서 모든 자동 경보 형식을 지원한다고 가정하지 않는다. 지원하지 않는 지표는
Issues와 로컬 HTTP 검증 결과를 수동 확인한다.

## 연결

Sentry에서 Next.js 프로젝트를 만들고 DSN을 로컬 셸 환경에 제공한다.
`.env*`는 보호 경로이므로 이 작업에서 생성하거나 수정하지 않는다.

- `SENTRY_DSN`: 서버 런타임 DSN.
- `NEXT_PUBLIC_SENTRY_DSN`: 브라우저 DSN. 공개 번들에 포함되므로 관리 API 토큰을 넣으면 안 된다.
- `SENTRY_ENVIRONMENT`: 기본 local-docker. 브라우저 환경명에도 빌드 시 반영한다.
- `SENTRY_RELEASE`: 서버 이벤트의 배포 식별자. 예: 커밋 SHA.
- `SENTRY_TEST_ENABLED`: 기본 0. 오류 전송 확인 시에만 1.
- `SENTRY_TEST_TOKEN`: 테스트용 임의 비밀값. 활성화 시 반드시 지정한다.

브라우저 DSN 변경 후에는 `docker compose up --build -d`로 이미지를 다시 빌드한다.
서버 DSN은 컨테이너 재생성 시 반영한다. 설정값을 확인하려고 `docker compose config`나
전체 환경을 로그로 출력하지 않는다. DSN은 접수 주소이며 관리 권한을 부여하는 API 토큰과 다르다.

## 의도적 오류 검증

POST `/api/monitoring-test`는 기본 404이며 테스트 플래그와 토큰이 모두 있어야 활성화된다.
Authorization Bearer 인증 실패는 401, DSN 미설정은 503이다. 인증을 통과하면 고정된 오류를
throw/catch 후 captureException으로 전송한다. 원본 요청 헤더·쿠키·본문·쿼리와 사용자 정보는
공통 beforeSend에서 제거한다. 브라우저·서버·edge에 같은 필터를 적용하며 stack frame의 vars와 URL fragment도 제거한다. 오류 메시지나 임의 extra 데이터 전체를 자동 비식별화하는 필터는 아니므로 시크릿을 오류 메시지에 넣지 않는다. 사용자 입력이나 인증 토큰을 오류 메시지에 넣지 않는다.

응답 eventId를 Sentry Issues의 이벤트 ID와 대조하고 이슈 URL·환경·수집 시각을 증거로 남긴다.
flushed=true는 SDK의 전송 큐 처리 완료이지 대시보드 인덱싱의 증거가 아니다.
검증 뒤 플래그를 0으로 바꾸고 컨테이너를 재생성한다. 운영에서 계속 활성화하지 않는다.
전역 예외는 instrumentation.ts의 onRequestError와 app/global-error.tsx에서 별도로 수집한다.
소스맵 업로드는 꺼져 있으므로 축소된 클라이언트 스택의 원본 소스 매핑은 이번 범위에 없다.

## 운영 지표와 대응

아래 숫자는 관측된 SLO가 아니라 저트래픽 실습용 초기 기준이다.

| 지표 | 초기 기준 | 확인/대응 |
| --- | --- | --- |
| 새 오류 유형 | local-docker 검증 태그를 제외한 새 issue 1건 | 재현, 영향 경로·release 확인. 테스트 이벤트는 verification:w3로 구분 |
| 오류 빈도 | 같은 issue 5분 내 5건 | 최근 배포와 입력 조건 확인, 영향이 있으면 배포 중단·롤백 검토 |
| HTTP 가용성 | 30초 간격 검사 3회 연속 비-2xx/타임아웃 | docker compose ps 및 logs 확인, 재시작 전 원인 기록 |
| 응답 지연 | 20회 이상 요청에서 p95 > 1초가 5분 지속 | 재현 후 서버/컨테이너 자원 확인. 오류 SDK만으로 HTTP 지연을 측정하지 않음 |
| 월간 오류 할당량 | 계정 무료 한도의 80% | 반복 오류 수정·불필요 이벤트 억제. 유료 전환 자동화 없음 |

이미지 HEALTHCHECK는 30초/timeout 5초/retries 3이며 unhealthy 상태 표시만 한다.
Compose가 이를 보고 자동 재시작하거나 이메일을 보내는 것은 아니다.
아래 경보 기준도 Sentry 계정에 자동 등록된 상태가 아니다.

## 로컬 검증

```bash
npm run build
npm run test:monitoring
npm run lint
npm test
```

monitoring 검증은 production standalone 서버와 메모리 내 HTTP envelope 수신기를 사용한다.
기본 비활성·토큰 없음·인증 실패·DSN 없음·정상 오류 전송과 토큰 제거를 검사한다.
실제 Sentry Cloud 수집 증거와 구분한다.

## 공식 문서

- [Sentry Next.js 설정](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/)
- [무료 Developer 요금제](https://sentry.io/pricing/)
- [Self-hosted 요구사항](https://develop.sentry.dev/self-hosted/)
- Next.js 설치 패키지의 output, instrumentation, instrumentation-client, error, route 문서도 확인했다.
