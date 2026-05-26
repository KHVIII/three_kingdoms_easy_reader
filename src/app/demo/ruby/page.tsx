"use client";

import { useState } from "react";
import DemoNav from "@/components/DemoNav";
import { getChapter001 } from "@/lib/content";

const chapter = getChapter001();

export default function RubyPage() {
  const [showPinyin, setShowPinyin] = useState(true);

  return (
    <>
      <DemoNav />
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 1.5rem 4rem" }}>
        <div className="chapter-header">
          <p className="chapter-number">第{chapter.number}回</p>
          <p className="chapter-title">{chapter.title}</p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
          <button
            className={`pinyin-toggle ${showPinyin ? "active" : ""}`}
            onClick={() => setShowPinyin((v) => !v)}
          >
            {showPinyin ? "隐藏拼音" : "显示拼音"}
          </button>
        </div>

        <div className="reading-area chinese" style={{ fontSize: "2rem", justifyContent: "center" }}>
          {chapter.sentences.map((sentence) =>
            sentence.characters.map((c, i) => (
              <span
                key={`${sentence.id}-${i}`}
                className={`char-ruby ${!c.pinyin ? "is-punct" : ""}`}
              >
                <span
                  className="char-pinyin"
                  style={{ visibility: showPinyin && !!c.pinyin ? "visible" : "hidden" }}
                >
                  {c.pinyin ?? ""}
                </span>
                <span className="char-glyph">{c.char}</span>
              </span>
            ))
          )}
        </div>
      </div>
    </>
  );
}
