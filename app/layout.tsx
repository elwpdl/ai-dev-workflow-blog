import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Dev Workflow Blog",
  description: "Next.js App Router 기반의 AI Dev Workflow 실습 블로그",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <header className="site-header">
          <div className="container header-content">
            <Link href="/" className="logo">
              AI Dev Workflow Blog
            </Link>
            <nav className="nav-links">
              <Link href="/">홈</Link>
              <a
                href="https://github.com/elwpdl/ai-dev-workflow-blog"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>

        <main>
          <div className="container">{children}</div>
        </main>

        <footer className="site-footer">
          <div className="container">
            <p>© 2026 AI Dev Workflow Blog. Built with Next.js & TypeScript.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
