# AI Dev Workflow Blog

Next.js App Router와 TypeScript 기반의 초경량 마크다운(Markdown) 블로그 샘플 프로젝트입니다.  
AI 에이전트와 인간 개발자의 협업 워크플로우를 단계별로 구축하고 검증하기 위한 기본 베이스라인입니다.

---

## 🛠 사전 요구 사항

- **Node.js**: `v24.19.0` (mise 또는 nvm 사용 권장)
- **npm**: `v10` 이상

```bash
# mise를 사용하는 경우 자동 설정
mise install
```

---

## 🚀 빠른 시작 가이드

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 블로그 홈과 포스트를 확인할 수 있습니다.

### 3. 프로덕션 빌드 및 실행

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 구동
npm start
```

### 4. 코드 정적 분석 (Lint)

```bash
npm run lint
```

### 5. E2E 테스트 실행

```bash
# Playwright 브라우저가 설치되어 있지 않은 경우 1회 실행
npx playwright install chromium

# 테스트 실행
npm test
```

---

## 📁 디렉터리 구조

```
ai-dev-workflow-blog/
├── app/                  # Next.js App Router
│   ├── layout.tsx        # 루트 레이아웃 (헤더, 네비게이션, 푸터)
│   ├── page.tsx          # 블로그 홈 (포스트 목록)
│   ├── globals.css       # 전역 스타일시트
│   └── blog/
│       └── [slug]/
│           └── page.tsx  # 포스트 상세 페이지
├── content/
│   └── posts/            # 마크다운 포스트 (.md)
│       ├── hello-world.md
│       ├── getting-started.md
│       └── ai-driven-development.md
├── docs/                 # 프로젝트 문서 및 증거 자료
│   └── evidence/         # 주차별 실행 증거 (W1~W3)
├── tests/                # Playwright E2E 테스트 시나리오
├── public/               # 정적 애셋
├── mise.toml             # Node.js 런타임 버전 명세
├── package.json          # 프로젝트 의존성 및 스크립트
├── tsconfig.json         # TypeScript 컴파일러 설정
└── README.md
```
