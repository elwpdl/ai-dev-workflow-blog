# Backend and content loading

- 마크다운 파싱·메타데이터·데이터 로딩 로직은 기존 `lib/` 구조에 둡니다.
- `content/posts/`의 필수 Frontmatter는 `title`, `date`, `description`, `tags`입니다.
- 파일 경로를 외부 입력으로 구성할 때 저장소의 의도한 콘텐츠 범위를 벗어나지 않도록 검증합니다.
- 필요에 의해 `app/api/` Route Handler를 작성할 때 설치된 Next.js 문서를 확인하고 Web `Request`·`Response` 규약을 따릅니다. 작업에 필요하지 않은 API를 추가하지 않습니다.
- 기존 정적 생성 흐름과 오류 처리 방식을 유지하며, 콘텐츠 파싱과 SSG는 `npm run build`로 확인합니다.
