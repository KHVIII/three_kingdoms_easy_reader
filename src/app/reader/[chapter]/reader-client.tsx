"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { Chapter } from "@/lib/types";
import ChapterSidebar from "@/components/chapter-sidebar";
import type { ChapterMeta } from "@/components/chapter-sidebar";
import { toZhNum } from "@/lib/zh-num";
import GearIcon from "@/components/GearIcon";

interface Props {
  chapter: Chapter;
  currentNum: number;
  chapterList: ChapterMeta[];
}

export default function ReaderClient({ chapter, currentNum, chapterList }: Props) {
  const [showPinyin, setShowPinyin] = useState(true);
  const saveShowPinyin = (v: boolean) => { setShowPinyin(v); localStorage.setItem("tk_showPinyin", String(v)); };
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [popup, setPopup] = useState<{ char: string; py: string } | null>(null);
  const [fontSize, setFontSize] = useState<number | null>(null);
  const [clickPopup, setClickPopup] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [readChapters, setReadChapters] = useState<Set<number>>(new Set());
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [progressInput, setProgressInput] = useState("1");
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // Persist settings in localStorage (client-only, works on static pages)
  const saveFontSize = (v: number) => { setFontSize(v); localStorage.setItem("tk_fontSize", String(v)); };
  const saveClickPopup = (v: boolean) => { setClickPopup(v); localStorage.setItem("tk_clickPopup", String(v)); };

  const markRead = () => {
    const next = new Set(readChapters);
    next.add(currentNum);
    setReadChapters(next);
    localStorage.setItem("tk_read", JSON.stringify([...next]));
  };

  const resetRead = () => {
    setReadChapters(new Set());
    localStorage.removeItem("tk_read");
  };

  const applyProgress = () => {
    const parsed = parseInt(progressInput, 10);
    const clamped = Math.max(1, Math.min(120, isNaN(parsed) ? 1 : parsed));
    const next = new Set(Array.from({ length: clamped - 1 }, (_, i) => i + 1));
    setReadChapters(next);
    localStorage.setItem("tk_read", JSON.stringify([...next]));
    setProgressModalOpen(false);
  };
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Load persisted settings after mount, then reveal the reading area
  useEffect(() => {
    const storedSize = localStorage.getItem("tk_fontSize");
    setFontSize(storedSize ? Number(storedSize) : window.innerWidth <= 768 ? 13 : 19);
    const storedClick = localStorage.getItem("tk_clickPopup");
    if (storedClick !== null) setClickPopup(storedClick === "true");
    const storedPinyin = localStorage.getItem("tk_showPinyin");
    if (storedPinyin !== null) setShowPinyin(storedPinyin === "true");
    const storedRead = localStorage.getItem("tk_read");
    if (storedRead) setReadChapters(new Set(JSON.parse(storedRead) as number[]));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!popup) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPopup(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [popup]);

  useEffect(() => {
    if (!settingsOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSettingsOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [settingsOpen]);

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

  if (!hydrated) {
    return (
      <div className="reader-loading">
        <span className="reader-loading__spinner" />
      </div>
    );
  }

  const readingAreaStyle = fontSize !== null
    ? { fontSize: `${fontSize / 10}rem` } as React.CSSProperties
    : undefined;

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
          readChapters={readChapters}
        />
      </div>

      {/* ── Main pane ───────────────────────────────────── */}
      <div className="reader-main">

        {/* Top bar */}
        <header className="reader-topbar">
          <div className="reader-topbar__actions">
            <button
              className="pinyin-toggle pinyin-toggle--icon"
              onClick={() => setSettingsOpen(true)}
              aria-label="设置"
            >
              <GearIcon />
            </button>
            <button
              className={`pinyin-toggle ${showPinyin ? "active" : ""}`}
              onClick={() => saveShowPinyin(!showPinyin)}
            >
              {showPinyin ? "隐藏拼音" : "显示拼音"}
            </button>
          </div>
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
          <div
            className={`reading-area reading-area--reader chinese${clickPopup ? "" : " reading-area--no-click"}`}
            style={readingAreaStyle}
          >
            {chapter.sentences.flatMap((sentence) => {
              const tokens = tokenize(sentence.text, sentence.pinyin);
              const spans = tokens.map((tok, i) => {
                if (tok.trailing) {
                  return (
                    <span
                      key={`${sentence.id}-${i}`}
                      className="char-ruby char-ruby--row"
                      onClick={clickPopup ? () => setPopup({ char: tok.char, py: tok.py! }) : undefined}
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
                    onClick={clickPopup && tok.py !== null ? () => setPopup({ char: tok.char, py: tok.py! }) : undefined}
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
                    <Link href={`/reader/${next.number}`} className="chapter-nav-bottom__link" onClick={markRead}>
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

    {/* ── Character popup ──────────────────────────────── */}
    {popup && (
      <div className="popup-overlay" onClick={() => setPopup(null)}>
        <div className="popup-card" onClick={(e) => e.stopPropagation()}>
          <button className="popup-close" onClick={() => setPopup(null)}>✕</button>
          <div className="popup-char chinese">{popup.char}</div>
          <div className="popup-pinyin">{popup.py}</div>
        </div>
      </div>
    )}

    {/* ── Settings modal ───────────────────────────────── */}
    {settingsOpen && (
      <div className="settings-overlay" onClick={() => setSettingsOpen(false)}>
        <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
          <button className="popup-close" onClick={() => setSettingsOpen(false)}>✕</button>
          <p className="settings-title">设置</p>

          <div className="settings-item">
            <span className="settings-label">字体大小</span>
            <div className="settings-slider-wrap">
              <span className="settings-slider-cap">小</span>
              <input
                type="range"
                min={12} max={28} step={1}
                value={fontSize ?? 19}
                onChange={(e) => saveFontSize(Number(e.target.value))}
                className="settings-slider"
              />
              <span className="settings-slider-cap">大</span>
            </div>
          </div>

          <div className="settings-item">
            <span className="settings-label">
              点击查看读音
              <span className="settings-hint" data-tip="点击文字，可放大显示该字及其拼音">?</span>
            </span>
            <button
              className={`settings-toggle${clickPopup ? " settings-toggle--on" : ""}`}
              onClick={() => saveClickPopup(!clickPopup)}
              role="switch"
              aria-checked={clickPopup}
            >
              <span className="settings-toggle__knob" />
            </button>
          </div>

          <div className="settings-subsection">
            <p className="settings-subsection__title">已读设置</p>
            <p className="settings-subsection__status">
              {readChapters.size > 0 ? (
                <>
                  《 目前读至第&nbsp;
                  <span className="settings-subsection__status-num">{Math.max(...readChapters) + 1}</span>
                  &nbsp;回 》
                </>
              ) : "暂无已读记录"}
            </p>
            <div className="settings-subsection__buttons">
              <button
                className="settings-action-btn"
                data-tip="清除所有章节的已读记录"
                onClick={() => setResetConfirmOpen(true)}
              >重置已读</button>
              <button
                className="settings-action-btn"
                data-tip="将指定回之前的章节全部标为已读"
                onClick={() => {
                  const latest = readChapters.size > 0 ? Math.max(...readChapters) + 1 : 1;
                  setProgressInput(String(latest));
                  setProgressModalOpen(true);
                }}
              >设置已读进度</button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* ── Reset confirmation modal ─────────────────────── */}
    {resetConfirmOpen && (
      <div className="settings-overlay" onClick={() => setResetConfirmOpen(false)}>
        <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
          <button className="popup-close" onClick={() => setResetConfirmOpen(false)}>✕</button>
          <p className="settings-title">重置已读</p>
          <p className="settings-progress-desc">确定清除所有已读记录？此操作无法撤销。</p>
          <div className="settings-progress-actions">
            <button className="settings-action-btn" onClick={() => setResetConfirmOpen(false)}>取消</button>
            <button className="settings-action-btn settings-action-btn--primary" onClick={() => { resetRead(); setResetConfirmOpen(false); }}>确认重置</button>
          </div>
        </div>
      </div>
    )}

    {/* ── Read progress modal ──────────────────────────── */}
    {progressModalOpen && (
      <div className="settings-overlay" onClick={() => setProgressModalOpen(false)}>
        <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
          <button className="popup-close" onClick={() => setProgressModalOpen(false)}>✕</button>
          <p className="settings-title">设置已读进度</p>
          <p className="settings-progress-desc">选定回之前的所有章节将标为已读</p>
          <div className="settings-progress-input-wrap">
            <span className="settings-label">已读至第</span>
            <input
              type="number"
              min={1} max={120}
              value={progressInput}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") { setProgressInput(""); return; }
                const n = parseInt(raw, 10);
                if (!isNaN(n)) setProgressInput(String(Math.min(120, n)));
              }}
              className="settings-progress-input"
            />
            <span className="settings-label">回</span>
          </div>
          <div className="settings-progress-actions">
            <button className="settings-action-btn" onClick={() => setProgressModalOpen(false)}>取消</button>
            <button className="settings-action-btn settings-action-btn--primary" onClick={applyProgress}>保存</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
