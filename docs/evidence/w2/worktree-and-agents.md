# Git Worktree 및 서브에이전트 병렬 작업 격리 경계

## 1. 서브에이전트 역할 분리 (.claude/agents/qa-tester.md)
- **개발 에이전트(Main)**: `feature/1-tag-filter` 브랜치에서 `app/`, `lib/` 구현 집중
- **QA 에이전트(Sub)**: `tests/` 디렉터리만 쓰기 허용, 기능 구현 전 실패(Red) 테스트 시나리오 고정

## 2. Git Worktree를 통한 병렬 작업 절차
기존 작업 트리를 유지하면서 별도 브랜치에서 병렬 작업을 수행할 때 다음과 같이 worktree를 생성하여 컨텍스트 스위칭 비용과 충돌을 방지합니다:

```bash
# 1. 병렬 작업을 위한 격리 worktree 생성
git worktree add -b test/tag-filter-e2e ../ai-dev-blog-qa main

# 2. 격리된 작업 환경으로 이동하여 독립적 테스트 작성/실행
cd ../ai-dev-blog-qa
npm test

# 3. 작업 완료 후 worktree 정리
cd -
git worktree remove ../ai-dev-blog-qa
```

## 3. 충돌 방지 경계 (Isolation Boundaries)
1. **파일 시스템 경계**: 기능 개발 브랜치는 `app/` 중심, 테스트 브랜치는 `tests/` 중심으로 파일 수정 범위를 분리하여 Git 머지 컨플릭트 사전 차단.
2. **권한 경계**: QA 서브에이전트는 프로덕션 코드(`app/`, `lib/`)에 대한 쓰기 권한을 비활성화하여 테스트 코드만을 통한 순수 블랙박스/그레이박스 검증 수행.
