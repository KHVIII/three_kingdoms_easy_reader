"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Chapter } from "@/lib/types";
import ChapterSidebar from "@/components/chapter-sidebar";
import type { ChapterMeta } from "@/components/chapter-sidebar";

const ZH_NUM = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

interface Props {
  chapter: Chapter;
  currentNum: number;
  chapterList: ChapterMeta[];
}

export default function ReaderClient({ chapter, currentNum, chapterList }: Props) {
  const [showPinyin, setShowPinyin] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [popup, setPopup] = useState<{ char: string; py: string } | null>(null);

  useEffect(() => {
    if (!popup) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPopup(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [popup]);

  // Group each hanzi with its immediately following punctuation into one flex token.
  // This prevents punctuation from wrapping to the start of a new line (行首禁則).
  function tokenize(text: string, pinyinAligned: (string | null)[]) {
    const chars = [...text];
    const tokens: { char: string; py: string | null; trailing: string }[] = [];
    let i = 0;
    while (i < chars.length) {
      const py = pinyinAligned[i];
      if (py !== null) {
        let trailing = "";
        let j = i + 1;
        while (j < chars.length && pinyinAligned[j] === null) {
          trailing += chars[j];
          j++;
        }
        tokens.push({ char: chars[i], py, trailing });
        i = j;
      } else {
        // Leading punctuation (rare) — render as standalone punct token
        tokens.push({ char: chars[i], py: null, trailing: "" });
        i++;
      }
    }
    return tokens;
  }

  return (
    <>
    <div className="reader-layout">

      {/* ── Desktop sidebar ─────────────────────────────── */}
      <ChapterSidebar
        chapterList={chapterList}
        currentNum={currentNum}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
      />

      {/* ── Main pane ───────────────────────────────────── */}
      <div className="reader-main">

        {/* Top bar */}
        <header className="reader-topbar">
          <button
            className={`pinyin-toggle ${showPinyin ? "active" : ""}`}
            onClick={() => setShowPinyin((v) => !v)}
          >
            {showPinyin ? "隐藏拼音" : "显示拼音"}
          </button>
        </header>

        {/* Mobile chapter strip */}
        <nav className="chapter-strip" aria-label="章节">
          {chapterList.map((meta) => (
            <Link
              key={meta.number}
              href={`/reader/${meta.number}`}
              className={`chapter-strip__item${meta.number === currentNum ? " chapter-strip__item--active" : ""}`}
            >
              第{ZH_NUM[meta.number]}回
            </Link>
          ))}
        </nav>

        {/* Chapter header */}
        <div style={{ maxWidth: "80%", margin: "0 auto", padding: "0 1.5rem 6rem" }}>
          <div className="chapter-header">
            <p className="chapter-number">第{ZH_NUM[currentNum]}回</p>
            <p className="chapter-title">{chapter.title}</p>
          </div>

          {/* Reading area */}
          <div
            className="reading-area chinese"
            style={{ fontSize: "1.9rem", justifyContent: "center" }}
          >
            {chapter.sentences.flatMap((sentence) => {
              const tokens = tokenize(sentence.text, sentence.pinyin);
              const spans = tokens.map((tok, i) => {
                // Token has trailing punctuation: use row layout so pinyin stays
                // centered over just the hanzi, not over hanzi+punctuation.
                if (tok.trailing) {
                  return (
                    <span
                      key={`${sentence.id}-${i}`}
                      className="char-ruby char-ruby--row"
                      onClick={() => setPopup({ char: tok.char, py: tok.py! })}
                    >
                      <span className="char-cell">
                        <span
                          className="char-pinyin"
                          style={{ visibility: showPinyin ? "visible" : "hidden" }}
                        >
                          {tok.py}
                        </span>
                        <span className="char-glyph">{tok.char}</span>
                      </span>
                      <span className="char-punct">{tok.trailing}</span>
                    </span>
                  );
                }
                return (
                  <span
                    key={`${sentence.id}-${i}`}
                    className={`char-ruby ${tok.py === null ? "is-punct" : ""}`}
                    onClick={tok.py !== null ? () => setPopup({ char: tok.char, py: tok.py! }) : undefined}
                  >
                    <span
                      className="char-pinyin"
                      style={{ visibility: showPinyin && tok.py !== null ? "visible" : "hidden" }}
                    >
                      {tok.py ?? ""}
                    </span>
                    <span className="char-glyph">{tok.char}</span>
                  </span>
                );
              });
              if (sentence.para) {
                return [
                  <div key={`pb-${sentence.id}`} className="para-break" aria-hidden="true" />,
                  ...spans,
                ];
              }
              return spans;
            })}
          </div>
        </div>
      </div>
    </div>

    {popup && (
      <div className="popup-overlay" onClick={() => setPopup(null)}>
        <div className="popup-card" onClick={(e) => e.stopPropagation()}>
          <button className="popup-close" onClick={() => setPopup(null)}>✕</button>
          <div className="popup-char chinese">{popup.char}</div>
          <div className="popup-pinyin">{popup.py}</div>
        </div>
      </div>
    )}
    </>
  );
}
