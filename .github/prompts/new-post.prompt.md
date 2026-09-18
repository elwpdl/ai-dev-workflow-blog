---
name: new-post
description: content/posts/ 경로에 표준 Frontmatter 형식을 갖춘 새 마크다운 블로그 포스트를 생성합니다.
argument-hint: <slug> [title] [tags]
---

# 새 블로그 포스트 생성 (/new-post)

새로운 블로그 게시글을 생성할 때 사용하는 GitHub Copilot 프롬프트 파일(Prompt File)입니다.

## 입력 인자
- **slug**: 포스트 파일명 (`content/posts/<slug>.md`)
- **title**: 포스트 제목
- **tags**: 태그 목록 (예: "Next.js, Copilot")

## 실행 지침
1. **파일 경로 확인**:
   - `content/posts/<slug>.md` 경로를 확인하고, 기존에 동일한 파일이 있다면 덮어쓰지 않고 중단합니다.

2. **Frontmatter 메타데이터 생성**:
   - `title`: 사용자 지정 제목
   - `date`: 오늘 날짜 (`YYYY-MM-DD` 형식)
   - `description`: 포스트 한 줄 요약
   - `tags`: 지정된 태그 배열 (기본값: `["General"]`)

3. **기본 템플릿**:
```markdown
---
title: "{title}"
date: "{YYYY-MM-DD}"
description: "{description}"
tags: [{tags}]
---

# {title}

여기에 게시물 본문을 작성합니다.

## 섹션 1
- 내용 작성
```

4. **검증**:
   - 포스트 생성 후 `npm run build`를 실행하여 SSG 빌드가 정상 통과하는지 검증합니다.
