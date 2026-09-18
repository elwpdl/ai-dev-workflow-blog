# GitHub Copilot & OpenAI Workspace Instructions

@AGENTS.md

이 저장소는 Next.js App Router 기반의 AI Dev Workflow 블로그입니다.
모든 코드 작성 및 협업 규칙은 루트의 [AGENTS.md](../AGENTS.md) 헌법을 따릅니다.

## 주요 지침
1. **타입 안전성**: TypeScript strict mode 준수 (`any` 금지).
2. **Next.js App Router**: `params`는 비동기(`Promise<{ slug: string }>`)로 처리.
3. **보호 경로**: `.env*`, `.github/workflows/*`, `package-lock.json` 수정 금지.
4. **완료 조건**: 작업 후 `npm run build`, `npm run lint`, `npm test` 통과 필수.
