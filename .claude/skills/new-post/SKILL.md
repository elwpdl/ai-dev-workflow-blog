---
name: new-post
description: content/posts/ 경로 아래에 표준 Frontmatter 형식을 갖춘 새 마크다운 블로그 포스트를 생성합니다.
---

# /new-post 스킬 가이드

새로운 블로그 게시글을 생성할 때 사용하는 자동화 스킬입니다.

## 사용법

`/new-post <slug> [title] [tags]`

예시:
- `/new-post automated-workflow "AI 자동화 워크플로우" "AI,Nextjs"`
- `/new-post my-post`

## 동작 원리 및 지침

1. **파일 경로 결정**:
   - `content/posts/<slug>.md` 경로를 확인합니다.
   - 이미 동일한 파일명이 존재하는 경우 오류를 반환하거나 덮어쓰지 않습니다.

2. **메타데이터(Frontmatter) 생성**:
   - `title`: 인자로 전달된 제목, 없는 경우 slug를 Title Case로 변환하여 사용
   - `date`: 오늘 날짜 (`YYYY-MM-DD` 형식)
   - `description`: 포스트 요약 문구
   - `tags`: 전달된 태그 배열 (기본값: `["General"]`)

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
   - 파일 생성 후 `npm run build`를 통해 마크다운 파싱 및 정적 페이지 생성이 정상 동작하는지 검증합니다.
