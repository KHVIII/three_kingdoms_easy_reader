"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { Chapter } from "@/lib/types";
import ChapterSidebar from "@/components/chapter-sidebar";
import type { ChapterMeta } from "@/components/chapter-sidebar";
import { toZhNum } from "@/lib/zh-num";

interface Props {
  chapter: Chapter;
  currentNum: number;
  chapterList: ChapterMeta[];
}

export default function ReaderClient({ chapter, currentNum, chapterList }: Props) {
  const [showPinyin, setShowPinyin] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [popup, setPopup] = useState<{ char: string; py: string } | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    if (!popup) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPopup(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [popup]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [sidebarOpen]);

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

      {/* ── Sidebar ──────────────────────────────────────── */}
      <div ref={sidebarRef}>
        <ChapterSidebar
          chapterList={chapterList}
          currentNum={currentNum}
          open={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
        />
      </div>

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
              第{toZhNum(meta.number)}回
            </Link>
          ))}
        </nav>

        {/* Chapter header */}
        <div className="reader-content">
          <div className="chapter-header">
            <div className="chapter-header__nav">
              {currentNum > 1
                ? <Link href={`/reader/${currentNum - 1}`} className="chapter-nav__arrow chapter-nav__arrow--prev">➵</Link>
                : <span className="chapter-nav__arrow chapter-nav__arrow--prev chapter-nav__arrow--ghost">➵</span>
              }
              <div>
                <p className="chapter-number">第{toZhNum(currentNum)}回</p>
                <p className="chapter-title">{chapter.title}</p>
              </div>
              {currentNum < chapterList.length
                ? <Link href={`/reader/${currentNum + 1}`} className="chapter-nav__arrow">➵</Link>
                : <span className="chapter-nav__arrow chapter-nav__arrow--ghost">➵</span>
              }
            </div>
          </div>

          {/* Reading area */}
          <div className="reading-area reading-area--reader chinese">
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

          {/* Bottom chapter navigation */}
          {(() => {
            const prev = chapterList.find(ch => ch.number === currentNum - 1);
            const next = chapterList.find(ch => ch.number === currentNum + 1);
            return (
              <div className="chapter-nav-bottom">
                <div className="chapter-nav-bottom__side chapter-nav-bottom__side--prev">
                  {prev ? (
                    <Link href={`/reader/${prev.number}`} className="chapter-nav-bottom__link">
                      <span className="chapter-nav-bottom__row">
                        <span className="chapter-nav__arrow chapter-nav__arrow--prev chapter-nav-bottom__arrow">➵</span>
                        <span className="chapter-nav-bottom__label">上一回</span>
                      </span>
                      <span className="chapter-nav-bottom__num">第{toZhNum(prev.number)}回</span>
                      <span className="chapter-nav-bottom__title">{prev.title}</span>
                    </Link>
                  ) : <span />}
                </div>
                <div className="chapter-nav-bottom__divider" aria-hidden="true" />
                <div className="chapter-nav-bottom__side chapter-nav-bottom__side--next">
                  {next ? (
                    <Link href={`/reader/${next.number}`} className="chapter-nav-bottom__link">
                      <span className="chapter-nav-bottom__row">
                        <span className="chapter-nav-bottom__label">下一回</span>
                        <span className="chapter-nav__arrow chapter-nav-bottom__arrow">➵</span>
                      </span>
                      <span className="chapter-nav-bottom__num">第{toZhNum(next.number)}回</span>
                      <span className="chapter-nav-bottom__title">{next.title}</span>
                    </Link>
                  ) : <span />}
                </div>
              </div>
            );
          })()}
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
