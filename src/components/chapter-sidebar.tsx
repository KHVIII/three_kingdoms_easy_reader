"use client";

import Link from "next/link";

const ZH_NUM = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

export interface ChapterMeta { number: number; title: string; }

interface Props {
  chapterList: ChapterMeta[];
  currentNum?: number;
  open: boolean;
  onToggle: () => void;
}

function shortTitle(title: string) {
  const space = title.indexOf(" ");
  return space > 0 ? title.slice(0, space) : title;
}

export default function ChapterSidebar({ chapterList, currentNum, open, onToggle }: Props) {
  return (
    <aside className={`reader-sidebar${open ? "" : " reader-sidebar--collapsed"}`}>
      <div className="reader-sidebar__header">
        {open && (
          <Link href="/" className="reader-sidebar__home">← 首页</Link>
        )}
        <button
          className="reader-sidebar__toggle"
          onClick={onToggle}
          aria-label={open ? "收起目录" : "展开目录"}
        >
          {open ? "‹" : "›"}
        </button>
      </div>
      {open && (
        <nav aria-label="章节">
          <ul className="reader-sidebar__list">
            {chapterList.map((meta) => (
              <li
                key={meta.number}
                className={`reader-sidebar__item${meta.number === currentNum ? " reader-sidebar__item--active" : ""}`}
              >
                <Link href={`/reader/${meta.number}`}>
                  <span className="reader-sidebar__num">第{ZH_NUM[meta.number]}回</span>
                  <span className="reader-sidebar__name">{shortTitle(meta.title)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </aside>
  );
}
