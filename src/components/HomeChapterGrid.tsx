"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { ChapterMeta } from "@/components/chapter-sidebar";
import { toZhNum } from "@/lib/zh-num";
import GearIcon from "@/components/GearIcon";

export default function HomeChapterGrid({ chapters }: { chapters: ChapterMeta[] }) {
  const [readChapters, setReadChapters] = useState<Set<number>>(new Set());
  const [hydrated, setHydrated] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fontSize, setFontSize] = useState<number | null>(null);
  const [clickPopup, setClickPopup] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [progressInput, setProgressInput] = useState("1");

  const saveFontSize = (v: number) => { setFontSize(v); localStorage.setItem("tk_fontSize", String(v)); };
  const saveClickPopup = (v: boolean) => { setClickPopup(v); localStorage.setItem("tk_clickPopup", String(v)); };

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

  useEffect(() => {
    const storedSize = localStorage.getItem("tk_fontSize");
    setFontSize(storedSize ? Number(storedSize) : window.innerWidth <= 768 ? 13 : 19);
    const storedClick = localStorage.getItem("tk_clickPopup");
    if (storedClick !== null) setClickPopup(storedClick === "true");
    const storedRead = localStorage.getItem("tk_read");
    if (storedRead) setReadChapters(new Set(JSON.parse(storedRead) as number[]));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!settingsOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSettingsOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [settingsOpen]);

  const hasHistory = hydrated && readChapters.size > 0;
  const nextChapter = hasHistory
    ? Math.min(chapters.length, Math.max(...readChapters) + 1)
    : 1;

  return (
    <>
      {/* ── Fixed settings button ── */}
      <button
        className="home-settings-btn"
        onClick={() => setSettingsOpen(true)}
        aria-label="设置"
      >
        <GearIcon size={16} />
      </button>

      {/* ── CTA button ── */}
      <div className="home-cta-wrap">
        <Link
          href={`/reader/${nextChapter}`}
          className={`home-cta-btn${hydrated ? "" : " home-cta-btn--loading"}`}
        >
          {hasHistory ? "继续阅读" : "开始阅读"}
        </Link>
      </div>

      {/* ── 目录 divider ── */}
      <div className="home-divider">
        <div className="home-divider__line" />
        <span className="home-divider__label">目录</span>
        <div className="home-divider__line" />
      </div>

      {/* ── Chapter grid ── */}
      <div className="chapter-grid">
        {chapters.map((meta) => {
          const isRead = readChapters.has(meta.number);
          return (
            <Link
              key={meta.number}
              href={`/reader/${meta.number}`}
              className={`chapter-card${isRead ? " chapter-card--read" : ""}`}
            >
              <span className="chapter-card__num">
                第{toZhNum(meta.number)}回
                {isRead && <span className="chapter-card__read-badge">已读</span>}
              </span>
              <span className="chapter-card__title chinese">{meta.title}</span>
            </Link>
          );
        })}
      </div>

      {/* ── Settings modal ── */}
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

      {/* ── Reset confirmation modal ── */}
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

      {/* ── Progress modal ── */}
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
