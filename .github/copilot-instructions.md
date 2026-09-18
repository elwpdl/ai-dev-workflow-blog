# GitHub Copilot Repository Instructions

@AGENTS.md

본 저장소는 Next.js App Router와 TypeScript 기반의 블로그 프로젝트입니다.
모든 코드 작성, 리팩토링 및 코드 리뷰는 루트의 [AGENTS.md](../AGENTS.md) 헌법을 따릅니다.

---

## 1. 핵심 코딩 지침
- **TypeScript**: `strict` 모드를 준수하며, `any` 타입 사용을 엄격히 금지합니다.
- **Next.js App Router**: 
  - 동적 세그먼트(`blog/[slug]/page.tsx`)의 `params`는 반드시 `Promise<{ slug: string }>`로 비동기 처리합니다.
  - 정적 페이지 생성을 위해 `generateStaticParams`를 적극 활용합니다.
  - 기본적으로 서버 컴포넌트(RSC)를 유지하고, 인터랙션이 필요한 경우에만 클라이언트 컴포넌트(`"use client"`)로 분리합니다.

## 2. 보안 및 보호 경로 (Protected Paths)
다음 경로는 GitHub Copilot이 직접 수정하거나 생성하지 않아야 합니다:
- ❌ `.env*`: 보안 환경 변수 및 시크릿
- ❌ `.github/workflows/*`: CI/CD 워크플로우 (평가 보호 경로)
- ❌ `package-lock.json`: npm CLI를 통해서만 갱신

## 3. 재사용 가능한 프롬프트 (Prompt Files)
- `.github/prompts/new-post.prompt.md`: 새 블로그 글 작성을 위한 프롬프트 템플릿 (`/new-post` 명령으로 호출)

## 4. 완료 검증 절차 (Definition of Done)
코드 제안 전후로 다음 명령어를 통해 정합성을 검증합니다:
```bash
npm run build && npm run lint && npm test
```
모든 검증이 에러 없이(0 errors) 통과되어야 합니다.
