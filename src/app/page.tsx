import Link from "next/link";
import { CHAPTER_METADATA } from "@/lib/content";
import { toZhNum } from "@/lib/zh-num";

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

      {/* ── Divider ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "3rem" }}>
        <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
        <span
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontSize: "0.72rem",
            letterSpacing: "0.22em",
            color: "var(--muted)",
          }}
        >
          目录
        </span>
        <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
      </div>

      {/* ── Chapter grid ── */}
      <div className="chapter-grid">
        {CHAPTER_METADATA.map((meta) => (
          <Link key={meta.number} href={`/reader/${meta.number}`} className="chapter-card">
            <span className="chapter-card__num">第{toZhNum(meta.number)}回</span>
            <span className="chapter-card__title chinese">{meta.title}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
