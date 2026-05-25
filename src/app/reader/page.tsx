"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { getChapter001 } from "@/lib/content";
import type { Character } from "@/lib/types";

const chapter = getChapter001();

const PLACEHOLDER_DEFS: Record<string, string> = {
  话: "言语；说话",  说: "陈述，讲解",  天: "自然界的最高处",
  下: "位置在低处",  大: "体积广，数量多", 势: "权力；形势",
  分: "区别；划分",  久: "时间长",       必: "一定，必然",
  合: "闭；聚集",    周: "朝代名",       末: "末端；最后",
  七: "数目字",      国: "国家",         争: "力求获取",
  并: "合并；兼并",  入: "进入",         于: "介词，在",
  秦: "朝代名",      及: "到；到达",     灭: "消灭；熄灭",
  之: "结构助词",    后: "在…之后",      楚: "国名",
  汉: "朝代名；汉族", 又: "再次；表示重复",
};

interface Selected {
  char: string;
  pinyin: string;
  def: string;
}

function Reader() {
  const { lang, t, toggle } = useI18n();
  const [showPinyin, setShowPinyin] = useState(true);
  const [selected, setSelected] = useState<Selected | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleClick(c: Character) {
    if (!c.pinyin) return;
    setSelected({
      char: c.char,
      pinyin: c.pinyin,
      def: PLACEHOLDER_DEFS[c.char] ?? "〔释义待补充〕",
    });
  }

  return (
    <>
      {/* Top bar */}
      <header className="demo-nav">
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontSize: "0.85rem",
            color: "var(--muted)",
            textDecoration: "none",
            letterSpacing: "0.05em",
          }}
        >
          ← {lang === "zh" ? "目录" : "Contents"}
        </Link>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button
            className={`pinyin-toggle ${showPinyin ? "active" : ""}`}
            onClick={() => setShowPinyin((v) => !v)}
          >
            {showPinyin
              ? lang === "zh" ? "隐藏拼音" : "Hide Pinyin"
              : lang === "zh" ? "显示拼音" : "Show Pinyin"}
          </button>
          <button className="demo-nav__lang" onClick={toggle}>
            {lang === "zh" ? "EN" : "中"}
          </button>
        </div>
      </header>

      {/* Content */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 1.5rem 6rem" }}>
        <div className="chapter-header">
          <p className="chapter-number">
            {lang === "zh" ? `第${chapter.number}回` : `Chapter ${chapter.number}`}
          </p>
          <p className="chapter-title">{chapter.title}</p>
        </div>

        <p className="reader-hint">
          {t.reader.tapHint}
        </p>

        <div
          className="reading-area chinese"
          style={{ fontSize: "2rem", justifyContent: "center" }}
        >
          {chapter.sentences.map((sentence) =>
            sentence.characters.map((c, i) => {
              const isPunct = !c.pinyin;
              const isActive = selected?.char === c.char && !isPunct;

              return (
                <span
                  key={`${sentence.id}-${i}`}
                  className={`char-ruby ${isPunct ? "is-punct" : ""}`}
                  onClick={() => handleClick(c)}
                  style={!isPunct ? { cursor: "pointer" } : undefined}
                >
                  <span
                    className="char-pinyin"
                    style={{
                      visibility: showPinyin && !isPunct ? "visible" : "hidden",
                      color: isActive ? "var(--vermillion)" : undefined,
                    }}
                  >
                    {c.pinyin ?? ""}
                  </span>
                  <span
                    className="char-glyph"
                    style={{
                      color: isActive ? "var(--vermillion)" : undefined,
                      transition: "color 0.15s",
                    }}
                  >
                    {c.char}
                  </span>
                </span>
              );
            })
          )}
        </div>
      </div>

      {/* Popup */}
      {selected && (
        <div className="popup-overlay" onClick={() => setSelected(null)}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="popup-close"
              onClick={() => setSelected(null)}
              aria-label={t.reader.close}
            >
              ×
            </button>
            <div className="popup-char">{selected.char}</div>
            <div className="popup-pinyin">{selected.pinyin}</div>
            <div className="popup-divider" />
            <div className="popup-definition">{selected.def}</div>
          </div>
        </div>
      )}
    </>
  );
}

export default function ReaderPage() {
  return (
    <I18nProvider>
      <Reader />
    </I18nProvider>
  );
}
