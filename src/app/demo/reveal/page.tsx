"use client";

import { useState, useCallback } from "react";
import { I18nProvider, useI18n } from "@/lib/i18n";
import DemoNav from "@/components/DemoNav";
import { getChapter001 } from "@/lib/content";

const chapter = getChapter001();

function RevealReader() {
  const { t } = useI18n();
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const toggle = useCallback((key: string) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  return (
    <>
      <DemoNav />
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 1.5rem 4rem" }}>
        <div className="chapter-header">
          <p className="chapter-number">第{chapter.number}回</p>
          <p className="chapter-title">{chapter.title}</p>
        </div>

        <p className="reader-hint">{t.reader.tapHint}</p>

        <div className="reading-area chinese" style={{ fontSize: "2rem", justifyContent: "center" }}>
          {chapter.sentences.map((sentence) =>
            sentence.characters.map((c, i) => {
              const key = `${sentence.id}-${i}`;
              const isRevealed = revealed.has(key);
              const isPunct = !c.pinyin;

              return (
                <span
                  key={key}
                  className={`char-ruby ${isPunct ? "is-punct" : ""}`}
                  onClick={() => !isPunct && toggle(key)}
                  style={!isPunct ? { cursor: "pointer" } : undefined}
                >
                  <span
                    className="char-pinyin"
                    style={{
                      opacity: isRevealed && !isPunct ? 1 : 0,
                      transform: isRevealed && !isPunct ? "translateY(0)" : "translateY(3px)",
                      transition: "opacity 0.18s, transform 0.18s",
                    }}
                  >
                    {c.pinyin ?? ""}
                  </span>
                  <span
                    className="char-glyph"
                    style={{
                      color: isRevealed && !isPunct ? "var(--vermillion)" : undefined,
                      transition: "color 0.18s",
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
    </>
  );
}

export default function RevealPage() {
  return (
    <I18nProvider>
      <RevealReader />
    </I18nProvider>
  );
}
