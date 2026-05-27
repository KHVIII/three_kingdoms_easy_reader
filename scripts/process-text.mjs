import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { pinyin } from "pinyin-pro";

const CONTENT_DIR = join(process.cwd(), "content");

// Punctuation characters — get null pinyin
const PUNCT = new Set(["，", "。", "！", "？", "；", "：", "、", "…", "「", "」", "『", "』", "（", "）", "—", "·", "\n", " "]);

function sentenceSplit(text) {
  return text.split(/(?<=[。！？])/).map((s) => s.trim()).filter(Boolean);
}

function annotateSentence(sentence) {
  const chars = [...sentence];
  const hanziOnly = chars.filter((c) => !PUNCT.has(c)).join("");
  const pinyinArr =
    hanziOnly.length > 0
      ? pinyin(hanziOnly, { toneType: "symbol", type: "array" })
      : [];

  let pi = 0;
  const pinyinAligned = chars.map((c) =>
    PUNCT.has(c) ? null : (pinyinArr[pi++] ?? null)
  );

  return { text: sentence, pinyin: pinyinAligned };
}

function processChapter(rawPath, chapterNumber, title) {
  const raw = readFileSync(rawPath, "utf-8").trim();

  // Each line in the raw file is one paragraph (set by fetch-chapters.mjs).
  // Paragraphs within a chapter are separated by \n.
  const paragraphs = raw.split("\n").filter((l) => l.trim().length > 0);

  const allSentences = [];
  let idx = 0;

  for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
    const sentences = sentenceSplit(paragraphs[pIdx]);
    for (let sIdx = 0; sIdx < sentences.length; sIdx++) {
      const entry = {
        id: `s${String(idx + 1).padStart(3, "0")}`,
        // Flag the first sentence of every paragraph after the first so the
        // reader can insert a visual paragraph break before it.
        ...(pIdx > 0 && sIdx === 0 ? { para: true } : {}),
        ...annotateSentence(sentences[sIdx]),
      };
      allSentences.push(entry);
      idx++;
    }
  }

  const result = {
    id: `chapter-${String(chapterNumber).padStart(3, "0")}`,
    number: chapterNumber,
    title,
    sentences: allSentences,
  };

  const outPath = join(CONTENT_DIR, `chapter-${String(chapterNumber).padStart(3, "0")}.json`);
  writeFileSync(outPath, JSON.stringify(result, null, 2), "utf-8");
  console.log(`✓ Wrote ${outPath} (${allSentences.length} sentences, ${paragraphs.length} paragraphs)`);
}

// Usage: node scripts/process-text.mjs <chapter-number> <title> <raw-file.txt>
const [, , chapterArg, titleArg, fileArg] = process.argv;

if (!chapterArg || !titleArg || !fileArg) {
  console.error("Usage: node scripts/process-text.mjs <chapter-number> <title> <raw-txt-path>");
  process.exit(1);
}

processChapter(fileArg, parseInt(chapterArg, 10), titleArg);
