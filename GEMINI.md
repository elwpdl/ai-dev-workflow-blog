# Gemini Agent Configuration & Guidelines

@AGENTS.md

---

## Google Gemini / Antigravity 지침

이 파일은 Google Gemini 및 Antigravity 에이전트를 위한 전용 가이드입니다. 기본 프로젝트 헌법은 `@AGENTS.md`를 상속합니다.

### 1. 도구, 스킬 및 MCP 사용 지침
- **스킬**: `.agents/skills/new-post/SKILL.md`를 통해 새 블로그 포스트 생성 절차를 자동화합니다.
- **안전망**: `.agents/hooks.json` 및 `scripts/`를 통해 파일 수정 전 보호 경로를 검증합니다.
- **MCP**: 프로젝트 루트의 `.mcp.json`에 정의된 MCP 서버(GitHub MCP 등)를 사용하여 저장소 컨텍스트를 탐색합니다.
- 파일 수정 전 `npm run lint`와 `npm test`를 통해 현재 상태를 파악하고, 작업 완료 후 반드시 `npm run build`를 실행하여 SSG 빌드를 확인합니다.

### 2. 보호 경로 및 안전 가이드라인
- `AGENTS.md`에 명시된 대로 `.env*`, `.github/workflows/*`, `package-lock.json` 파일의 임의 수정을 엄격히 금지합니다.
- 대규모 코드 리팩토링이나 디렉터리 이동 시 사전에 계획(Plan)을 수립하고 사용자 확인을 거칩니다.

### 3. 완료 검증 절차
```bash
npm run build && npm run lint && npm test
```
위 3개 명령어가 모두 성공적으로 종료(exit code 0)되어야 작업이 완료됩니다.
