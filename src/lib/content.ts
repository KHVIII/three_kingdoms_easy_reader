import type { Chapter } from "./types";
import ch001 from "../../content/chapter-001.json";
import ch002 from "../../content/chapter-002.json";
import ch003 from "../../content/chapter-003.json";
import ch004 from "../../content/chapter-004.json";
import ch005 from "../../content/chapter-005.json";
import ch006 from "../../content/chapter-006.json";
import ch007 from "../../content/chapter-007.json";
import ch008 from "../../content/chapter-008.json";
import ch009 from "../../content/chapter-009.json";
import ch010 from "../../content/chapter-010.json";

const CHAPTERS: Chapter[] = [
  ch001, ch002, ch003, ch004, ch005,
  ch006, ch007, ch008, ch009, ch010,
] as Chapter[];

export function getChapter(n: number): Chapter | undefined {
  return CHAPTERS.find((ch) => ch.number === n);
}

export const CHAPTER_METADATA = CHAPTERS.map((ch) => ({
  number: ch.number,
  title: ch.title,
}));

// Kept for demo pages
export function getChapter001(): Chapter {
  return ch001 as Chapter;
}
