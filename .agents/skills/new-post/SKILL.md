---
name: new-post
description: Use this skill when the user asks to create a new markdown blog post with standard frontmatter under content/posts/.
---

# /new-post 스킬 가이드 (Google Gemini / Antigravity)

이 스킬은 `content/posts/` 경로에 정형화된 Frontmatter를 갖춘 마크다운 블로그 포스트 초안을 생성하는 절차를 안내합니다.

## 절차

1. **파일 경로 확인**:
   - `content/posts/<slug>.md` 경로를 결정합니다.
   - 기존에 동일한 파일이 존재하는지 확인하고, 이미 존재할 경우 덮어쓰지 않고 사용자에게 알립니다.

2. **메타데이터(Frontmatter) 구성**:
   - `title`: 사용자 지정 제목 또는 slug를 읽기 쉽게 변환한 텍스트
   - `date`: 오늘 날짜 (`YYYY-MM-DD` 형식)
   - `description`: 포스트 요약
   - `tags`: 문자열 배열 (예: `["Next.js", "Gemini"]`)

3. **기본 템플릿**:
```markdown
---
title: "{title}"
date: "{YYYY-MM-DD}"
description: "{description}"
tags: [{tags}]
---

# {title}

게시물 본문 내용 작성.

## 섹션 1
- 상세 내용
```

4. **검증**:
   - 파일 생성 후 `npm run build`를 실행하여 SSG 빌드가 정상 통과하는지 확인합니다.
