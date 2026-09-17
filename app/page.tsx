import { getAllPosts } from "@/lib/posts";
import TagFilterList from "./components/TagFilterList";

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <div>
      <section className="hero">
        <h1>AI Dev Workflow Blog</h1>
        <p>AI 에이전트와 함께 만드는 Next.js 개발 워크플로우 저장소입니다.</p>
      </section>

      <section>
        <TagFilterList posts={posts} />
      </section>
    </div>
  );
}
