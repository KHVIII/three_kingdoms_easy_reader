"use client";

import { useState, useEffect } from "react";
import DemoNav from "@/components/DemoNav";
import { getChapter001 } from "@/lib/content";
import type { Character } from "@/lib/types";

const chapter = getChapter001();

interface Selected { char: string; pinyin: string; definitions: string[] }

export default function PopupPage() {
  const [selected, setSelected] = useState<Selected | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleClick(c: Character) {
    if (!c.pinyin) return;
    setSelected({ char: c.char, pinyin: c.pinyin, definitions: c.definitions?.length ? c.definitions : ["暂无释义"] });
  }

  return (
    <>
      <DemoNav />
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 1.5rem 4rem" }}>
        <div className="chapter-header">
          <p className="chapter-number">第{chapter.number}回</p>
          <p className="chapter-title">{chapter.title}</p>
        </div>

        <p className="reader-hint">点击字符查看释义</p>

        <div className="reading-area chinese" style={{ fontSize: "2rem", justifyContent: "center" }}>
          {chapter.sentences.map((sentence) =>
            sentence.characters.map((c, i) => {
              const isPunct = !c.pinyin;
              return (
                <span
                  key={`${sentence.id}-${i}`}
                  className={`char-ruby ${isPunct ? "is-punct" : ""}`}
                  onClick={() => handleClick(c)}
                  style={!isPunct ? { cursor: "pointer" } : undefined}
                >
                  <span className="char-pinyin invisible" aria-hidden="true">a</span>
                  <span className="char-glyph">{c.char}</span>
                </span>
              );
            })
          )}
        </div>
      </div>

      {selected && (
        <div className="popup-overlay" onClick={() => setSelected(null)}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setSelected(null)}>×</button>
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
