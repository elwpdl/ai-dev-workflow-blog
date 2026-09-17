---
title: "Getting Started: 개발 환경 설정 및 블로그 구조"
date: "2026-09-19"
description: "Next.js App Router와 Markdown을 결합한 블로그의 기본 아키텍처 및 로컬 개발 환경 가이드입니다."
tags: ["Next.js", "TypeScript", "Markdown"]
---

# Getting Started

본 프로젝트는 Next.js App Router 기반의 정적 Markdown 블로그입니다.

## 프로젝트 구조

- `app/`: Next.js App Router 페이지 및 레이아웃
  - `page.tsx`: 전체 글 목록 홈 화면
  - `layout.tsx`: 루트 레이아웃 (헤더, 네비게이션, 푸터)
  - `blog/[slug]/page.tsx`: 개별 글 상세 뷰
- `content/posts/`: Markdown 포스트 저장소 (`.md` 파일)
- `tests/`: E2E 및 기능 테스트 시나리오
- `docs/`: 프로젝트 문서 및 주차별 실행 증거

## 로컬 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000`에 접속하여 확인할 수 있습니다.
