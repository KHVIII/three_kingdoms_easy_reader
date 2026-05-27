"use client";

import { useState } from "react";
import DemoNav from "@/components/DemoNav";
import { getChapter001 } from "@/lib/content";

const chapter = getChapter001();

export default function PopupPage() {
  const [selected, setSelected] = useState<{ char: string; pinyin: string } | null>(null);

  return (
    <>
      <DemoNav />
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 1.5rem 4rem" }}>
        <div className="chapter-header">
          <p className="chapter-number">第{chapter.number}回</p>
          <p className="chapter-title">{chapter.title}</p>
        </div>

        <p className="reader-hint">点击字符查看拼音</p>

        <div className="reading-area chinese" style={{ fontSize: "2rem", justifyContent: "center" }}>
          {chapter.sentences.map((sentence) =>
            [...sentence.text].map((char, i) => {
              const py = sentence.pinyin[i];
              const isPunct = !py;
              return (
                <span
                  key={`${sentence.id}-${i}`}
                  className={`char-ruby ${isPunct ? "is-punct" : ""}`}
                  onClick={() => py && setSelected({ char, pinyin: py })}
                  style={!isPunct ? { cursor: "pointer" } : undefined}
                >
                  <span className="char-pinyin invisible" aria-hidden="true">a</span>
                  <span className="char-glyph">{char}</span>
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
          </div>
        </div>
      )}
    </>
  );
}
