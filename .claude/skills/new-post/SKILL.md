---
name: new-post
description: Create a Markdown blog post with project frontmatter under content/posts/.
---

# new-post

1. `AGENTS.md`와 기존 게시글을 읽고 제목·내용에 맞는 slug를 결정합니다.
2. `content/posts/<slug>.md`가 이미 있으면 덮어쓰지 않습니다.
3. Frontmatter에 title, 오늘 날짜의 date(YYYY-MM-DD), description, 문자열 배열 tags를 작성합니다. 본문은 사용자 요청과 기존 문서 언어를 따릅니다.
4. 확인하지 않은 사실이나 출처를 만들지 않습니다. 코드 블록에 언어 태그를 붙입니다.
5. `npm run build`, `npm run lint`, `npm test`로 검증하고 결과를 보고합니다.
