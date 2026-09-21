"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

interface TagFilterListProps {
  posts: PostMeta[];
}

export default function TagFilterList({ posts }: TagFilterListProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const normalizedQuery = query.trim().toLowerCase();

  // 고유 태그 목록 추출
  const allTags = Array.from(
    new Set(posts.flatMap((post) => post.tags || []))
  ).sort();

  // 검색어와 선택 태그를 모두 만족하는 글만 기존 순서대로 표시합니다.
  const filteredPosts = posts.filter((post) => {
    const matchesTag = selectedTag === null || post.tags?.includes(selectedTag);
    const matchesQuery = [post.title, post.description ?? "", ...(post.tags ?? [])]
      .some((value) => value.toLowerCase().includes(normalizedQuery));
    return matchesTag && matchesQuery;
  });

  return (
    <div>
      <div className="post-search" role="search" aria-label="게시글">
        <label htmlFor="post-search">게시글 검색</label>
        <div className="search-controls">
          <input
            ref={searchRef}
            id="post-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="제목, 요약, 태그로 검색"
          />
          <button
            type="button"
            className="filter-btn"
            disabled={query.length === 0}
            onClick={() => {
              setQuery("");
              searchRef.current?.focus();
            }}
          >
            검색 초기화
          </button>
        </div>
      </div>
      {/* 태그 필터 버튼 바 */}
      <div className="tag-filter-bar" data-testid="tag-filter-bar">
        <span className="filter-label">태그 필터:</span>
        <button
          type="button"
          data-testid="tag-btn-ALL"
          aria-pressed={selectedTag === null}
          className={`filter-btn ${selectedTag === null ? "active" : ""}`}
          onClick={() => setSelectedTag(null)}
        >
          전체 ({posts.length})
        </button>
        {allTags.map((tag) => {
          const count = posts.filter((p) => p.tags?.includes(tag)).length;
          return (
            <button
              key={tag}
              type="button"
              data-testid={`tag-btn-${tag}`}
              aria-pressed={selectedTag === tag}
              className={`filter-btn ${selectedTag === tag ? "active" : ""}`}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            >
              #{tag} ({count})
            </button>
          );
        })}
      </div>

      <p className="search-count" role="status">검색 결과 {filteredPosts.length}개</p>
      {/* 필터링된 포스트 목록 */}
      <div className="post-list">
        {filteredPosts.length === 0 ? (
          <p className="no-posts">검색 조건에 맞는 게시글이 없습니다.</p>
        ) : (
          filteredPosts.map((post) => (
            <article key={post.slug} className="post-card">
              <h2>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <div className="post-meta">
                <time dateTime={post.date}>{post.date}</time>
              </div>
              {post.description && (
                <p className="post-description">{post.description}</p>
              )}
              {post.tags && post.tags.length > 0 && (
                <div className="tags">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`tag ${selectedTag === tag ? "highlight" : ""}`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
