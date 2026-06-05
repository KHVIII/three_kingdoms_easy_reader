import { CHAPTER_METADATA } from "@/lib/content";
import HomeChapterGrid from "@/components/HomeChapterGrid";

export default function Home() {
  return (
    <main style={{ maxWidth: 780, margin: "0 auto", padding: "5rem 2rem 6rem" }}>

      {/* ── Hero ── */}
      <div className="text-center" style={{ marginBottom: "3.5rem" }}>
        <p className="chapter-number" style={{ marginBottom: "0.75rem" }}>
          Romance of the Three Kingdoms
        </p>
        <h1
          className="chinese"
          style={{ fontSize: "3rem", lineHeight: 1.3, color: "var(--ink)" }}
        >
          三国演义
        </h1>
        <p className="chapter-number" style={{ marginTop: "0.4rem", color: "var(--vermillion)" }}>
          轻松阅读版
        </p>
      </div>

      {/* ── Chapter grid + CTA + Settings ── */}
      <HomeChapterGrid chapters={CHAPTER_METADATA} />
    </main>
  );
}
