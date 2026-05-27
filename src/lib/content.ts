import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import type { Chapter } from "./types";

const contentDir = join(process.cwd(), "content");

const CHAPTERS: Chapter[] = readdirSync(contentDir)
  .filter((f) => /^chapter-\d{3}\.json$/.test(f))
  .sort()
  .map((f) => JSON.parse(readFileSync(join(contentDir, f), "utf-8")) as Chapter);

export function getChapter(n: number): Chapter | undefined {
  return CHAPTERS.find((ch) => ch.number === n);
}

export const CHAPTER_METADATA = CHAPTERS.map((ch) => ({
  number: ch.number,
  title: ch.title,
}));
