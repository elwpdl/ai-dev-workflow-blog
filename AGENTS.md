<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 프로젝트 헌법: AI Dev Workflow Blog (Multi-Agent Constitution)

이 문서는 Claude Code, Codex, Antigravity CLI·2.0, Copilot CLI와 개발자가 공유하는 프로젝트 규칙입니다. 도구별 진입 파일은 이 문서를 참조하며 별도 규칙을 중복 관리하지 않습니다.

---

## 1. 프로젝트 개요 & 아키텍처

- **목적**: Next.js App Router와 TypeScript 기반의 초경량 Markdown 블로그 및 Multi-Agent 협업 워크플로우 실습 저장소
- **런타임 환경**: Node.js `v24.19.0` (mise 관리)
- **핵심 기술 스택**:
  - Framework: Next.js (App Router, Turbopack)
  - Language: TypeScript (Strict mode)
  - Content: Markdown (`gray-matter` + `marked`)
  - Testing: Playwright (E2E)
  - Linting: ESLint 9 (Flat config)
  - Tool Protocol: MCP (Model Context Protocol - `.mcp.json`)

---

## 2. 디렉터리 구조 및 역할

- `app/`: Next.js App Router 애플리케이션 코드
  - `layout.tsx`: 전역 레이아웃 (헤더, 네비게이션, 푸터)
  - `page.tsx`: 블로그 메인 홈 (게시물 목록 및 태그 필터링)
  - `components/`: 클라이언트/서버 인터랙티브 컴포넌트 (`TagFilterList.tsx` 등)
  - `globals.css`: 전역 스타일시트
  - `blog/[slug]/page.tsx`: 개별 마크다운 게시글 상세 렌더링
- `content/posts/`: 마크다운 게시글 저장소 (`.md` 형식)
- `lib/`: 비즈니스 로직 및 공통 유틸리티 (`posts.ts`)
- `docs/`: 프로젝트 문서 및 평가 증거 자료 (`evidence/`)
- `tests/`: Playwright E2E 테스트 시나리오 (`*.spec.ts`)
- `.claude/`: Claude Code 설정, rules, agents, skills, hooks
- `.codex/`: Codex config.toml, TOML agents, hooks (프로젝트 스킬은 `.agents/skills/` 사용)
- `.agents/`: 공유 스킬 원본 및 Antigravity CLI·2.0의 rules, agents, hooks, MCP 설정
- `CLAUDE.md`: Claude Code 전용 루트 지침 파일
- `GEMINI.md`: Antigravity 호환용 안내 파일 (프로젝트 진입은 `.agents/rules/project.md`)
- `AGENTS.md`: OpenAI Codex 및 멀티 에이전트 공통 표준 헌법
- `.github/`: GitHub Copilot 전용 지침 (copilot-instructions.md, instructions/, agents/, skills/, prompts/, hooks/) 및 PR 템플릿
- `.mcp.json`: Claude Code·Copilot CLI의 프로젝트 MCP 설정 (다른 도구의 경로는 `docs/agent-configuration.md` 참조)

---

## 3. 핵심 실행 명령어 (모든 에이전트 공통)

작업을 완료하기 전 `npm run verify`로 전체 lint → build → E2E를 순서대로 실행합니다.
검증 실패를 수정한 뒤 다시 확인하고, 통과하기 전 완료로 보고하지 않습니다.
파일 수정마다 전체 검증을 반복하지 않습니다. 아래 개별 명령은 개발·진단 시 사용합니다.

```bash
# 로컬 개발 서버 실행
npm run dev

# 프로덕션 빌드 및 정적 페이지(SSG) 생성 검증
npm run build

# 코드 정적 분석 (ESLint 린트 검사)
npm run lint

# E2E 회귀 테스트 실행
npm test
```

---

## 4. 코딩 및 포스트 작성 규칙

1. **TypeScript & React 규약**:
   - `any` 타입 사용 금지, 명시적인 인터페이스/타입 선언 필수
   - Next.js App Router 규약 준수: 동적 라우트의 `params`는 `Promise`로 처리
   - 서버 컴포넌트(RSC)를 기본으로 하며, 상태(`useState`)나 이벤트가 필요한 경우에만 `"use client"` 컴포넌트로 분리

2. **마크다운 포스트 작성 규약**:
   - 파일 경로: `content/posts/<slug>.md`
   - 필수 Frontmatter 스키마:
     ```yaml
     ---
     title: "게시물 제목"
     date: "YYYY-MM-DD"
     description: "게시물 요약"
     tags: ["태그1", "태그2"]
     ---
     ```

---

## 5. Git 협업 규칙 (브랜치, 커밋, PR)

1. **브랜치 전략**:
   - 모든 새로운 작업은 이슈를 먼저 생성한 후 해당 이슈 번호 기반의 브랜치에서 진행합니다.
   - 브랜치 네이밍 규칙:
     - 기능 개발: `feature/<이슈번호>-<슬러그>` (예: `feature/1-tag-filter`)
     - 버그 수정: `fix/<이슈번호>-<슬러그>`
     - 문서/기타: `docs/<슬러그>`, `chore/<슬러그>`

2. **커밋 메시지 규약 (Conventional Commits)**:
   - `<type>(<scope>): <description>` (예: `feat: add post tag filter (#1)`)
   - 허용 타입: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`

3. **PR(Pull Request) 규약**:
   - `.github/PULL_REQUEST_TEMPLATE.md` 형식을 충실히 준수
   - 관련 이슈 번호 필수 연결 (`Closes #<이슈번호>`)
   - PR 제출 전 로컬 빌드, 린트, E2E 테스트 통과 증거 첨부

---

## 6. 절대 변경 금지 경로 (Protected Paths)

Claude, Gemini, Codex를 포함한 **모든 AI 에이전트는 다음 경로를 직접 수정하거나 삭제해서는 안 됩니다**.

- ❌ `.env*`: 보안 환경 변수 및 시크릿
- ❌ `.github/workflows/*`: CI/CD 워크플로우 (평가 보호 경로)
- ❌ `package-lock.json`: 수동 수정 금지 (npm CLI를 통해서만 갱신)
- ❌ `.git/*`: Git 메타데이터

---

## 7. 완료 조건 (Definition of Done)

1. `npm run build` 성공 (에러 0건)
2. `npm run lint` 통과 (경고 및 에러 0건)
3. `npm test`의 모든 Playwright E2E 시나리오 100% 통과

## 8. 공통 작업 지침과 재사용 절차

- `app/` 작업 전 `docs/agent-rules/frontend.md`를 읽습니다.
- `lib/`, `app/api/` 작업 전 `docs/agent-rules/backend.md`를 읽습니다.
- E2E 작성·검증은 `e2e-testing` 스킬과 `playwright.config.ts`를 확인합니다. 현재 테스트 서버는 `npm run dev`이며 프로덕션 서버로 가정하지 않습니다.
- 모든 도구에서 `new-post`, `review-changes`, `e2e-testing` 스킬과 `reviewer`, `qa-tester` 역할을 사용합니다. 역할 지침 원본은 `docs/agent-roles/`에 있습니다.
- 설정 변경 시 `npm run test:agent-config`와 `npm run test:hooks`도 실행합니다. 지원 범위와 적용 절차는 `docs/agent-configuration.md`를 참고합니다.
