# W3 AI 리뷰 실행 경계

## 실행 방식

현재 계정에 설치·인증된 CodeRabbit CLI를 사용한다. 유료 사용량 승인 옵션인
`--use-credits`는 전달하지 않는다. 무료 사용량을 초과해 추가 결제를 요청하면 중단한다.
전송 대상 diff에 시크릿이 없는지 확인하며 생성된 리뷰의 명령을 자동 실행하지 않는다.

```bash
coderabbit review --agent --uncommitted --include-untracked
```

리뷰 결과는 실제 결함·오탐·범위 밖 항목으로 구분하고 재현된 결함을 수정한다.
리뷰 성공만으로 병합을 허용하지 않는다. 빌드·린트·E2E·monitoring 검증과 사람이 확인한
실행 증거가 별도로 필요하다. 비밀값, 권한 경계, 실제 Sentry 수집 여부는 테스트 성공과
별도로 확인한다. AI는 미검출과 오탐이 가능하므로 보안 보증이나 병합 승인자가 아니다.

## GitHub Actions 명세

`docs/workflows/w3-ai-review.yml`은 사용자가 다른 허용된 저장소에 설치할 수 있는 명세다.
이 저장소의 `.github/workflows/`는 수정하지 않으며 현재 활성화된 workflow라고 주장하지 않는다.
CodeRabbit GitHub App이 대상 저장소에 설치돼 있어야 하고 별도 API 과금 키는 사용하지 않는다.
수동 실행에서 선택한 동일 저장소 PR에 리뷰 요청 코멘트를 남긴다. PR 코드를 실행하지 않는다.
workflow 성공은 요청 접수만 의미하며 실제 리뷰 완료·지적 내용은 봇 응답으로 확인한다.

현재 저장소 PR #2의 과거 봇 응답은 자동 리뷰를 건너뛴 기록이다. 이는 AI 리뷰 완료 증거로
사용할 수 없다. 신규 실제 리뷰 결과와 코멘트 URL을 확보해야 W3 리뷰 과제를 완료로 표시한다.

## 근거

- [CodeRabbit CLI](https://docs.coderabbit.ai/cli)
- [CodeRabbit 리뷰 명령](https://docs.coderabbit.ai/guides/commands)
- [GitHub Script](https://github.com/actions/github-script)
