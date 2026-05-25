import type { Chapter } from "./types";
import ch001 from "../../content/chapter-001.json";

export function getChapter001(): Chapter {
  return ch001 as Chapter;
}
