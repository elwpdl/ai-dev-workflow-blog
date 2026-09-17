import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <div>
      <section className="hero">
        <h1>AI Dev Workflow Blog</h1>
        <p>AI 에이전트와 함께 만드는 Next.js 개발 워크플로우 저장소입니다.</p>
      </section>

      <section>
        <div className="post-list">
          {posts.map((post) => (
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
                    <span key={tag} className="tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
