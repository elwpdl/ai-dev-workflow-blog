# OpenAI Codex & Copilot Guidelines

@AGENTS.md

---

## OpenAI Codex / Copilot Workspace 지침

이 파일은 OpenAI Codex, GitHub Copilot, ChatGPT 에이전트를 위한 전용 작업 가이드입니다. 공통 프로젝트 헌법은 `@AGENTS.md`를 준수합니다.

### 1. 코드 생성 및 수정 원칙
- 모든 코드는 TypeScript strict mode를 준수하여 작성하며 암시적 `any` 타입을 금지합니다.
- Next.js 15+ App Router 동적 세그먼트(`blog/[slug]/page.tsx`)에서 `params`는 비동기 객체(`Promise<{ slug: string }>`)로 접근해야 합니다.
- 정적 사이트 생성을 지원하기 위해 `generateStaticParams`를 적극 활용합니다.

### 2. 안전망 및 보호 경로 준수
- `.env*`, `.github/workflows/*`, `package-lock.json` 파일의 임의 생성 또는 수정을 금지합니다.
- 패키지 의존성을 변경할 경우 수동으로 `package.json`만 수정하지 말고, `npm install <package>` CLI를 통해 무결성을 유지합니다.

### 3. Git 협업 절차
- 브랜치 생성: `feature/<issue-number>-<slug>`
- 커밋 메시지: Conventional Commits (`feat:`, `fix:` 등)
- PR 본문: `.github/PULL_REQUEST_TEMPLATE.md` 규격 준수
