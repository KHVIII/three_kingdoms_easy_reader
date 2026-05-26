"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getChapter001 } from "@/lib/content";
import type { Character } from "@/lib/types";
import ui from "@/messages/zh.json";

const chapter = getChapter001();

interface Selected {
  char: string;
  pinyin: string;
  definitions: string[];
}

export default function ReaderPage() {
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
      definitions: c.definitions?.length ? c.definitions : [ui.reader.noDefinition],
    });
  }

  return (
    <>
      <header className="demo-nav">
        <Link href="/" className="nav-back">
          ← {ui.nav.back}
        </Link>
        <button
          className={`pinyin-toggle ${showPinyin ? "active" : ""}`}
          onClick={() => setShowPinyin((v) => !v)}
        >
          {showPinyin ? ui.reader.hidePinyin : ui.reader.showPinyin}
        </button>
      </header>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 1.5rem 6rem" }}>
        <div className="chapter-header">
          <p className="chapter-number">
            {ui.reader.chapter}{chapter.number}{ui.reader.chapterUnit}
          </p>
          <p className="chapter-title">{chapter.title}</p>
        </div>

        <p className="reader-hint">{ui.reader.tapHint}</p>

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

      {selected && (
        <div className="popup-overlay" onClick={() => setSelected(null)}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="popup-close"
              onClick={() => setSelected(null)}
              aria-label={ui.reader.close}
            >
              ×
            </button>
            <div className="popup-char">{selected.char}</div>
            <div className="popup-pinyin">{selected.pinyin}</div>
            <div className="popup-divider" />
            <ol className="popup-definitions">
              {selected.definitions.map((def, i) => (
                <li key={i} className="popup-definition">{def}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </>
  );
}
