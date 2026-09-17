# 프로젝트 헌법: AI Dev Workflow Blog (CLAUDE.md)

이 문서는 이 저장소에서 AI 코딩 에이전트와 개발자가 작업을 수행할 때 반드시 준수해야 하는 최상위 규칙(프로젝트 헌법)입니다.

---

## 1. 프로젝트 개요 & 아키텍처

- **목적**: Next.js App Router와 TypeScript 기반의 초경량 Markdown 블로그 및 AI 협업 워크플로우 실습 저장소
- **런타임 환경**: Node.js `v24.19.0` (mise 관리)
- **핵심 기술 스택**:
  - Framework: Next.js (App Router, Turbopack)
  - Language: TypeScript (Strict mode)
  - Content: Markdown (`gray-matter` + `marked`)
  - Testing: Playwright (E2E)
  - Linting: ESLint 9 (Flat config)

---

## 2. 디렉터리 구조 및 역할

- `app/`: Next.js App Router 애플리케이션 코드
  - `layout.tsx`: 전역 레이아웃 (헤더, 네비게이션, 푸터)
  - `page.tsx`: 블로그 메인 홈 (게시물 목록 렌더링)
  - `globals.css`: 전역 스타일시트
  - `blog/[slug]/page.tsx`: 개별 마크다운 게시글 상세 렌더링
- `content/posts/`: 마크다운 게시글 저장소 (`.md` 형식)
- `lib/`: 비즈니스 로직 및 공통 유틸리티
  - `posts.ts`: 포스트 메타데이터 파싱 및 본문 HTML 변환
- `docs/`: 프로젝트 문서 및 평가 증거 자료
  - `evidence/`: 주차별 실행 증거 (w1, w2, w3)
- `tests/`: Playwright E2E 테스트 시나리오 (`*.spec.ts`)
- `.claude/`: Claude Code 전용 설정, 스킬, 훅
  - `skills/`: 반복 작업 자동화 스킬
  - `hooks/`: PreToolUse / PostToolUse 안전망 스크립트
  - `settings.json`: 도구 및 후크 설정

---

## 3. 핵심 실행 명령어

모든 작업 전후에는 아래 명령어를 사용하여 코드 품질과 동작을 검증합니다.

```bash
# 로컬 개발 서버 실행 (포트 3000)
npm run dev

# 프로덕션 빌드 및 정적 페이지 생성(SSG) 검증
npm run build

# 코드 정적 분석 (ESLint 린트 검사)
npm run lint

# E2E 회귀 테스트 실행
npm test
```

---

## 4. 코딩 및 포스트 작성 규칙

1. **TypeScript & React 규약**:
   - `any` 타입 사용 금지, 명시적인 인터페이스/타입 선언
   - Next.js 15+ App Router 규약 준수: 동적 라우트의 `params`는 `Promise`로 처리
   - 서버 컴포넌트(RSC)를 기본으로 하고, 상태나 브라우저 이벤트가 필요한 경우에만 최소한으로 클라이언트 컴포넌트(`"use client"`) 사용

2. **마크다운 포스트 작성 규약**:
   - 파일 경로: `content/posts/<slug>.md`
   - 필수 Frontmatter 필드:
     ```yaml
     ---
     title: "게시물 제목"
     date: "YYYY-MM-DD"
     description: "게시물 한 줄 요약"
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
   - 형식: `<type>(<scope>): <description>`
   - 허용 타입:
     - `feat`: 새로운 기능 추가
     - `fix`: 버그 수정
     - `docs`: 문서 추가 및 수정
     - `test`: 테스트 코드 추가 및 수정
     - `refactor`: 프로덕션 코드 리팩토링
     - `chore`: 빌드 업무, 패키지 매니저 설정 등
   - 예시: `feat: add tag filtering UI and query parameter support (#1)`

3. **PR(Pull Request) 규약**:
   - GitHub CLI(`gh`)를 활용하여 PR을 생성 및 관리합니다.
   - `.github/PULL_REQUEST_TEMPLATE.md` 형식을 충실히 준수하여 작성합니다.
   - 반드시 관련 이슈를 본문에 연결합니다 (`Closes #<이슈번호>`).
   - PR 제출 전 로컬에서 빌드, 린트, E2E 테스트 통과 증거를 본문에 포함해야 합니다.

---

## 6. 변경 금지 경로 (Protected Paths)

AI 에이전트는 다음 경로의 파일을 수정하거나 삭제해서는 안 됩니다.

- ❌ `.env*`: 환경 변수 및 시크릿 파일 (보안 보호)
- ❌ `.github/workflows/*`: CI/CD 워크플로우 파일 (평가 보호 경로)
- ❌ `package-lock.json`: 수동 수정 금지 (npm 명령어로만 갱신)
- ❌ `.git/*`: Git 내부 메타데이터

---

## 6. 완료 조건 (Definition of Done)

어떠한 기능 추가나 코드 수정 작업도 다음 3가지 검증을 모두 통과해야 완료된 것으로 간주합니다.

1. `npm run build`가 0개의 에러로 정상 완료될 것
2. `npm run lint`가 경고 및 에러 없이 통과할 것
3. `npm test` 실행 시 모든 Playwright 테스트가 통과할 것
