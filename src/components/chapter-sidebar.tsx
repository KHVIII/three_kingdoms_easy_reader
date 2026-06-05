"use client";

import Link from "next/link";
import { toZhNum } from "@/lib/zh-num";

export interface ChapterMeta { number: number; title: string; }

interface Props {
  chapterList: ChapterMeta[];
  currentNum?: number;
  open: boolean;
  onToggle: () => void;
  readChapters?: Set<number>;
}

function shortTitle(title: string) {
  const space = title.indexOf(" ");
  return space > 0 ? title.slice(0, space) : title;
}

export default function ChapterSidebar({ chapterList, currentNum, open, onToggle, readChapters }: Props) {
  return (
    <aside className={`reader-sidebar${open ? "" : " reader-sidebar--collapsed"}`}>
      <button
        className="reader-sidebar__header"
        onClick={onToggle}
        aria-label={open ? "收起目录" : "展开目录"}
      >
        <span className="reader-sidebar__toggle">{open ? "‹" : "☰"}</span>
      </button>
      {open && (
        <>
          <nav aria-label="章节">
            <ul className="reader-sidebar__list">
              {chapterList.map((meta) => (
                <li
                  key={meta.number}
                  className={`reader-sidebar__item${meta.number === currentNum ? " reader-sidebar__item--active" : ""}${readChapters?.has(meta.number) ? " reader-sidebar__item--read" : ""}`}
                >
                  <Link href={`/reader/${meta.number}`}>
                    <span className="reader-sidebar__num">第{toZhNum(meta.number)}回</span>
                    <span className="reader-sidebar__name">{shortTitle(meta.title)}</span>
                    {readChapters?.has(meta.number) && (
                      <span className="reader-sidebar__read-badge">已读</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Link href="/" className="reader-sidebar__footer reader-sidebar__home">
            ← 首页
          </Link>
        </>
      )}
    </aside>
  );
}
