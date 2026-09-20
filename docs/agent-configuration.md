# 에이전트 설정 및 지원 범위

대상: Claude Code, Codex, Antigravity CLI·2.0, GitHub Copilot CLI.
Gemini CLI의 `.gemini/settings.json` 형식과 혼용하지 않는다.

## 공통 구성과 네이티브 진입점

공통 작업 규칙·역할·스킬·hook 검사·GitHub MCP를 맞춘다. 모델, 권한 강제 방식,
제품별 로드·승인 절차까지 동일하다는 뜻은 아니다. 전역 사용자 설정은 변경하지 않는다.

| 항목 | 공통 원본 | Claude Code | Codex | Antigravity CLI·2.0 | Copilot CLI |
| --- | --- | --- | --- | --- | --- |
| 프로젝트 지침 | `AGENTS.md` | `CLAUDE.md`에서 import | 네이티브 발견 | `.agents/rules/project.md`에서 읽도록 지시 | `.github/copilot-instructions.md`에서 참조 |
| 프론트·백엔드 규칙 | `docs/agent-rules/` | `.claude/rules/`의 paths | AGENTS의 경로별 읽기 지침 | `.agents/rules/`의 범위 지침 | `.github/instructions/`의 applyTo |
| 역할 | `docs/agent-roles/` | `.claude/agents/` | `.codex/agents/*.toml` | `.agents/agents/` | `.github/agents/` |
| 스킬 3종 | `.agents/skills/` | `.claude/skills/` 동일 복사본 | 공통 원본 직접 발견 | 공통 원본 직접 발견 | `.github/skills/` 동일 복사본 |
| GitHub MCP | `scripts/github-mcp.sh` | `.mcp.json` | `.codex/config.toml` | `.agents/mcp_config.json` | `.mcp.json` |

스킬은 `new-post`(게시글 작성), `review-changes`(변경 검토), `e2e-testing`(E2E 검증)이다.
각 도구에 해당 스킬 사용을 명시적으로 요청할 수 있다. CLI 버전별 명령 UI는 별도로 확인한다.
Copilot은 여러 지원 디렉터리를 발견할 수 있으므로 같은 이름의 복사본 내용을 동일하게 유지한다.
복사본 변경 시 세 디렉터리를 함께 수정하고 `npm run test:agent-config`를 실행한다.

역할 파일은 공통 역할 문서를 읽도록 지시한다. 파일 참조를 호스트가 자동으로 삽입한다는
가정은 하지 않는다. reviewer는 읽기·검색만 수행하고 qa-tester는 테스트·증거 작성과 검증을 담당한다.

MCP 등록 이름은 `repo-github`이며 기존 `@modelcontextprotocol/server-github` stdio 서버를
공통 launcher로 실행한다. `GITHUB_PERSONAL_ACCESS_TOKEN`, 없으면 `GITHUB_TOKEN`을 사용한다.
토큰은 환경에서 제공하며 파일에 저장하지 않는다. Copilot 기본 GitHub MCP와는 별도 등록이다.
서버 패키지 교체·버전 고정은 이번 동기화 범위에 포함하지 않았다.

## 미지원·비동등 항목

| 항목 | 차이와 처리 |
| --- | --- |
| `.prompt.md` 자동 명령 | Copilot CLI 미지원. 기존 prompts 파일은 스킬 안내만 유지하며 모든 제품의 공통 실행 경로는 스킬이다. |
| `.codex/skills` | 현재 공식 프로젝트 경로는 `.agents/skills`. 이전 파일을 README 안내로 전환했다. |
| `.claude/instructions`, `.codex/instructions`, `.agents/instructions` | 자동 발견을 전제로 하지 않는 이전 참고 경로. 실제 진입점은 위 표를 따른다. |
| 경로별 규칙 강제 | Claude paths·Copilot applyTo와 달리 Codex는 AGENTS의 읽기 지침, Antigravity는 규칙 본문 범위 지침을 사용한다. 동일한 자동 활성화는 보장하지 않는다. |
| reviewer 셸 제한 | Claude·Antigravity·Copilot은 읽기·검색 도구만 허용한다. Codex read-only는 셸 제거 기능이 아니므로 공통 역할 지침에서도 셸 실행을 금지한다. |
| QA 쓰기 범위 | tests/·docs/evidence/ 범위는 역할 지침이며 OS 수준 디렉터리 접근 제한이 아니다. |
| worktree 격리 | Claude는 isolation 필드, Antigravity는 호출 시 branch workspace, Codex·Copilot은 호출자가 별도 작업 공간을 준비한다. |
| 모델·승인·샌드박스 | 각 호스트 모델과 권한 정책을 따른다. 공급자 간 같은 모델명이나 동일한 보안 경계는 설정하지 않는다. |
| Antigravity 2.0 MCP 발견 | 공통 MCP 형식을 제공하되 2.0 UI의 Installed MCP Servers에서 실제 로드를 확인해야 한다. CLI의 프로젝트 파일 발견과 동일하게 동작한다고 검증하지 않았다. |
| Pre hook 허용 | Claude·Codex·Copilot의 빈 응답은 기존 권한 판단을 유지한다. Antigravity decision allow는 같은 의미의 권한 유보가 아니다. |
| 플러그인 | 활성 커스텀 플러그인 없음. 이전 Antigravity 예시는 `docs/examples/antigravity-plugin.json`으로 이동했다. 패키징은 제품 간 호환되지 않는다. |
| 저장·커밋 hook | 공통 onSave/preCommit 기능을 구성하지 않는다. 도구 호출 전후 hook과 완료 검증을 사용한다. Git hook은 설치하지 않는다. |

## Hook 파일과 실행 방식

| 도구 | Hook 등록 | Reviewer | QA Tester |
| --- | --- | --- | --- |
| Claude Code | `.claude/settings.json` | `.claude/agents/reviewer.agent.md` | `.claude/agents/qa-tester.md` |
| Codex | `.codex/hooks.json` | `.codex/agents/reviewer.toml` | `.codex/agents/qa-tester.toml` |
| Antigravity CLI·2.0 | `.agents/hooks.json` | `.agents/agents/reviewer.agent.md` | `.agents/agents/qa-tester.md` |
| Copilot CLI | `.github/hooks/validation.json`, `formatting.json` | `.github/agents/reviewer.agent.md` | `.github/agents/qa-tester.agent.md` |

Node.js와 npm, Bash, Git을 사용할 수 있는 macOS/Linux 환경을 전제로 한다.
각 도구의 등록 형식과 응답 형식은 분리하고, 실제 입력 파싱·경로 검사·린트는
`scripts/agent-hooks.mjs`에서 수행한다. 스크립트 위치를 기준으로 저장소 루트를
찾으므로 하위 디렉터리에서 실행해도 같은 프로젝트를 검사한다.

- Claude/Codex: `tool_name`, `tool_input`. Codex patch는 `tool_input.command`의 모든 파일 헤더와 이동 목적지를 검사한다.
- Antigravity: `toolCall.name`, `toolCall.args`. `TargetFile`과 `CommandLine`을 구분한다.
- Copilot: `toolName`, `toolArgs`(객체 또는 JSON 문자열). 호환 입력 `tool_name`, `tool_input`도 처리한다.
- Claude/Codex/Copilot에서 허용되는 호출은 `{}`를 반환해 기존 권한 판단에 맡긴다. Antigravity는 공식 계약에 따라 `decision`을 반환한다.
- 입력을 해석할 수 없는 Pre hook은 거부 응답을 반환한다. 원본 입력·명령·수정 내용은 로그에 출력하지 않는다.

## 보호와 린트 범위

파일 편집 도구는 `.env*`, `.git`, `.github/workflows`, `package-lock.json` 경로를
차단한다. 상대 경로와 존재하는 심볼릭 링크의 실제 경로도 확인한다.
읽기 도구는 수정으로 취급하지 않는다.

셸 hook은 명령에 명시된 보호 경로를 보수적으로 차단한다. 셸로 보호 파일을
읽으려는 명령도 차단될 수 있으므로 읽기 도구를 사용한다. `npm install`처럼
보호 경로를 직접 지정하지 않는 npm 명령은 이 검사에서 거부하지 않는다.

이 검사는 보조 안전장치이며 샌드박스가 아니다. 변수·글롭·인코딩·외부 스크립트로
간접 접근하는 셸 명령, 알 수 없는 MCP 쓰기 도구, hook 자체의 변경까지 통제하지는
않는다. 도구의 권한·샌드박스 설정을 함께 유지한다.

Post hook은 파일 편집/patch 대상에 JS·TS 계열 파일이 있을 때 저장소의
`npm run lint`를 한 번 실행한다. 읽기나 일반 셸 호출, Markdown 수정에는 실행하지
않는다. 셸로 수정한 파일은 완료 검증에서 별도로 확인한다.

린트 실패는 stderr에 보고한다. Claude/Codex에는 `additionalContext`, Copilot에는
`additionalContext`를 반환한다. Antigravity Post hook은 `{}`만 반환해야 하므로
stderr와 종료 코드 1로 실패를 알린다. 이미 수행한 편집을 되돌리거나 다음 도구
호출을 반드시 차단하는 기능은 아니다. 자동 `--fix`는 실행하지 않는다.

## 적용 확인

1. **Claude Code**: 새 세션의 `/hooks`와 `/agents`에서 등록을 확인한다. GitHub MCP는 루트 `.mcp.json`을 사용한다. `qa-tester`는 `isolation: worktree`를 사용하며 본문의 디렉터리 범위는 작업 지침이다.
2. **Codex**: 프로젝트를 신뢰한 새 세션에서 `/hooks`로 hook 정의를 검토하고 신뢰한다. 설정 파일 저장만으로 hook 신뢰가 자동 부여되지는 않는다. reviewer는 TOML로 정의하며 `sandbox_mode = "read-only"`를 사용한다. MCP는 `.codex/config.toml`에서 별도로 등록한다.
3. **Antigravity CLI**: `/hooks`, `/agents`에서 등록을 확인한다. **2.0**은 Settings → Customizations → Hooks 및 agent 목록을 확인한다. 공유 `.agents` 파일의 실제 발견 여부를 각 제품에서 확인한다.
4. **Copilot CLI**: 저장소를 신뢰한 새 세션에서 `/agent`로 reviewer 또는 qa-tester를 선택하고 hook 실행 로그를 확인한다. VS Code와 cloud agent 배포는 이번 구성의 검증 대상이 아니다.

Reviewer는 코드 수정 대신 근거가 있는 문제를 보고한다. Claude/Antigravity/Copilot
reviewer에는 읽기·검색 도구만 제공하므로 diff와 테스트 실행 결과는 메인 에이전트가
전달한다. Codex reviewer는 읽기 전용 샌드박스에서 검토한다.

QA Tester는 모든 도구에 `qa-tester`라는 이름으로 정의한다. `tests/`와
`docs/evidence/`를 수정하고 Playwright E2E·빌드·린트를 실행하며, `app/`와 `lib/`의
구현 결함은 메인 에이전트에 보고한다. 이 디렉터리 범위는 작업 지침이며 쓰기 도구나
`workspace-write` 설정이 두 디렉터리만 허용한다는 뜻은 아니다.

Claude는 `isolation: worktree`를 사용한다. Antigravity는 호출 시 메인 에이전트가
`branch` workspace를 선택한다. Codex·Copilot CLI는 병렬 작업 전에 메인 에이전트가
별도 worktree를 준비한다. Claude의 격리 필드를 다른 도구에 그대로 복사하지 않는다.

## 검증

```bash
npm run test:agent-config
npm run test:hooks
npm run build
npm run lint
npm test
```

Hook 테스트는 실제 설정의 명령을 하위 디렉터리에서 실행하고, 보호 경로 거부,
정상 편집·읽기, Codex 다중 파일 patch, symlink, 잘못된 입력, 린트 실패의 네이티브
응답을 검사한다. 테스트 통과는 각 제품의 로그인·프로젝트 신뢰·hook 신뢰
상태까지 보장하지 않는다.

설정 테스트는 스킬 복사본 일치, 네이티브 agent의 공통 역할 참조, MCP 등록과 launcher의
토큰 우선순위를 검사한다. MCP는 가짜 npx로 검증하며 실제 GitHub API 호출을 하지 않는다.
설치된 모든 제품에서 실제 agent 호출을 완료했다는 의미는 아니다. Claude/Copilot CLI 실행과
Antigravity 2.0 UI 로드는 미검증이며, Codex의 프로젝트 신뢰·hook 신뢰도 사용자 환경에서 확인해야 한다.

## 공식 문서

확인일: 2026-09-20.

- [Claude Code hooks](https://code.claude.com/docs/en/hooks), [subagents](https://code.claude.com/docs/en/sub-agents)
- [Codex hooks](https://learn.chatgpt.com/docs/hooks), [subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents), [configuration](https://learn.chatgpt.com/docs/config-file/config-reference)
- [Antigravity hooks](https://antigravity.google/docs/hooks), [custom subagents](https://antigravity.google/docs/subagents/)
- [Copilot hooks](https://docs.github.com/en/copilot/reference/hooks-reference), [custom agents](https://docs.github.com/en/copilot/reference/custom-agents-configuration)

- [Claude memory와 rules](https://code.claude.com/docs/en/memory), [skills](https://code.claude.com/docs/en/skills)
- [Codex skills](https://learn.chatgpt.com/docs/build-skills), [AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- [Antigravity rules](https://antigravity.google/docs/rules-workflows), [skills](https://antigravity.google/docs/skills), [MCP](https://antigravity.google/docs/mcp), [plugins](https://antigravity.google/docs/plugins)
- [Copilot 지원 범위](https://docs.github.com/en/copilot/reference/customization-cheat-sheet), [CLI와 MCP](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)
