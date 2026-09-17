# 1주차(W1) 질문 1~3 답변

[docs/w1-reflection.md](../../w1-reflection.md) 원본 참조.

---

### 1. claude.md에 반드시 있어야 하지만 일반 README에는 없어도 되는 정보는 무엇인가요?
- **절대 변경 금지 경로 (Protected Paths)**: `.env*`, `.github/workflows/*`, `package-lock.json` 등 AI 에이전트의 오작동 시 치명적인 사고를 유발하는 경로 차단 지침.
- **기계적 완료 조건 (Definition of Done)**: `npm run build`, `npm run lint`, `npm test` 등 작업 완료를 위해 에이전트가 반드시 통과해야 하는 검증 명령어.
- **구체적인 프레임워크 제약**: Next.js 15+ App Router 동적 라우트 규약(`Promise<params>`), 마크다운 Frontmatter 스키마 등 환각 방지용 기술 스펙.

### 2. PreToolUse로 막아야 하는 변경과 PostToolUse로 뒤처리하면 되는 변경을 어떻게 나눴나요?
- **PreToolUse (사전 차단)**: 보안/CI/의존성과 관련된 비가역적이고 위험한 파일 조작을 exit code 2로 실행 전 원천 차단.
- **PostToolUse (사후 교정)**: 허용된 코드 파일의 수정 후 ESLint 등을 자동 실행하여 문법/스타일 오류를 에이전트에게 즉각 피드백하고 자가 수정(Self-healing) 유도.

### 3. Hook을 붙였는데도 막지 못한 실수는 무엇이고 다음에 어떻게 막을 계획인가요?
- **한계점**: 파일 수정 도구 외에 Bash 쉘 명령(`echo "..." > .env`)을 통한 우회 조작이나, 린트를 통과하지만 비즈니스 로직(날짜 형식, UI 깨짐 등)이 틀린 논리적 결함.
- **개선 계획**: Bash 도구 호출 시 파라미터 정적 분석 필터 추가, W2의 Playwright E2E 테스트 검증 연동, Git pre-commit 훅을 통한 심층 방어 체계 구축.
