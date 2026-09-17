"use client";

import { useState } from "react";
import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

interface TagFilterListProps {
  posts: PostMeta[];
}

export default function TagFilterList({ posts }: TagFilterListProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // 고유 태그 목록 추출
  const allTags = Array.from(
    new Set(posts.flatMap((post) => post.tags || []))
  ).sort();

  // 선택된 태그에 따른 포스트 필터링
  const filteredPosts = selectedTag
    ? posts.filter((post) => post.tags?.includes(selectedTag))
    : posts;

  return (
    <div>
      {/* 태그 필터 버튼 바 */}
      <div className="tag-filter-bar" data-testid="tag-filter-bar">
        <span className="filter-label">태그 필터:</span>
        <button
          type="button"
          data-testid="tag-btn-ALL"
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
              className={`filter-btn ${selectedTag === tag ? "active" : ""}`}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            >
              #{tag} ({count})
            </button>
          );
        })}
      </div>

      {/* 필터링된 포스트 목록 */}
      <div className="post-list">
        {filteredPosts.length === 0 ? (
          <p className="no-posts">해당 태그를 가진 포스트가 없습니다.</p>
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
