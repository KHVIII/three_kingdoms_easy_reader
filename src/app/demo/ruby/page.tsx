"use client";

import { useState } from "react";
import { I18nProvider, useI18n } from "@/lib/i18n";
import DemoNav from "@/components/DemoNav";
import { getChapter001 } from "@/lib/content";

const chapter = getChapter001();

function RubyReader() {
  const { t } = useI18n();
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
            <span style={{ fontSize: "0.7em", letterSpacing: "0.1em" }}>
              {showPinyin ? "▲" : "▽"}
            </span>
            {showPinyin ? t.reader.tapHint.slice(0, 2) + "拼音" : "显示拼音"}
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
                  className={`char-pinyin ${!showPinyin ? "invisible" : ""} ${!c.pinyin ? "invisible" : ""}`}
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

export default function RubyPage() {
  return (
    <I18nProvider>
      <RubyReader />
    </I18nProvider>
  );
}
