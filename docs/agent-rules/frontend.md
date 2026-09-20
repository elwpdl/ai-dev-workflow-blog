# Frontend

- `app/`의 기존 React 함수형 컴포넌트와 Next.js App Router 구조를 따릅니다.
- 서버 컴포넌트를 기본으로 하고 상태·이벤트·브라우저 API가 필요한 경계에만 `"use client"`를 둡니다.
- 동적 라우트의 `params`는 Promise로 처리하며 구현 전 설치된 Next.js 문서를 확인합니다.
- 스타일은 기존 `app/globals.css`와 CSS 구조를 따릅니다. 현재 의존성에 없는 Tailwind를 전제로 작성하지 않습니다.
- 기존 내비게이션, 키보드 접근성, 시맨틱 요소와 반응형 레이아웃을 유지합니다.
- UI 변경 시 관련 Playwright 사용자 흐름을 검증하고 실제 화면 확인 여부를 보고합니다.
