import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6">
      <div className="text-center">
        <p className="chapter-number mb-3">Romance of the Three Kingdoms</p>
        <h1
          className="chinese"
          style={{ fontSize: "3rem", lineHeight: 1.3, color: "var(--ink)" }}
        >
          三国演义
        </h1>
        <p className="chapter-number mt-1" style={{ color: "var(--vermillion)" }}>
          轻松阅读版
        </p>

        <div
          style={{
            width: "3rem",
            height: "1px",
            background: "var(--border)",
            margin: "2.5rem auto",
          }}
        />

        <Link
          href="/reader"
          style={{
            display: "inline-block",
            fontFamily: "var(--font-cormorant), serif",
            fontSize: "1.05rem",
            letterSpacing: "0.08em",
            color: "var(--parchment)",
            background: "var(--vermillion)",
            padding: "0.6rem 2rem",
            borderRadius: "2px",
            textDecoration: "none",
            transition: "opacity 0.15s",
          }}
        >
          开始阅读
        </Link>
      </div>
    </main>
  );
}
