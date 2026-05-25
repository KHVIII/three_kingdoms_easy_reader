import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p className="chapter-number mb-3">Romance of the Three Kingdoms</p>
        <h1 className="chinese" style={{ fontSize: "2.2rem", lineHeight: 1.4, color: "var(--ink)" }}>
          三國演義
        </h1>
        <p className="chapter-number mt-1" style={{ color: "var(--vermillion)" }}>
          輕鬆閱讀版
        </p>
        <div
          style={{
            width: "3rem",
            height: "1px",
            background: "var(--border)",
            margin: "2rem auto",
          }}
        />
        <p style={{ fontFamily: "var(--font-cormorant), serif", fontStyle: "italic", color: "var(--muted)", fontSize: "0.9rem", marginBottom: "2rem" }}>
          Choose a reading style to begin
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/demo/ruby"   className="demo-nav__tab demo-nav__tab--active" style={{ display: "block", padding: "0.6rem 1rem" }}>全显拼音 · Always-On Pinyin</Link>
          <Link href="/demo/reveal" className="demo-nav__tab" style={{ display: "block", padding: "0.6rem 1rem", border: "1px solid var(--border)" }}>点击显拼 · Click to Reveal</Link>
          <Link href="/demo/popup"  className="demo-nav__tab" style={{ display: "block", padding: "0.6rem 1rem", border: "1px solid var(--border)" }}>弹出释义 · Detail Popup</Link>
        </div>
      </div>
    </main>
  );
}
