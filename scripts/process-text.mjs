import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, basename } from "path";
import { pinyin } from "pinyin-pro";

const CONTENT_DIR = join(process.cwd(), "content");
const RAW_DIR = join(process.cwd(), "content", "raw");

// Punctuation that gets null pinyin
const PUNCT = new Set(["，", "。", "！", "？", "；", "：", "、", "…", "「", "」", "『", "』", "（", "）", "—", "·", "\n", " "]);

function sentenceSplit(text) {
  // Split on sentence-ending punctuation, keeping the delimiter attached
  return text.split(/(?<=[。！？])/).map(s => s.trim()).filter(Boolean);
}

function annotateCharacters(sentence) {
  const chars = [...sentence]; // spread handles multi-byte CJK correctly
  return chars.map((char) => {
    if (PUNCT.has(char)) return { char, pinyin: null };
    const py = pinyin(char, { toneType: "symbol", type: "string" });
    return { char, pinyin: py || null };
  });
}

function processChapter(rawPath, chapterNumber, title) {
  const raw = readFileSync(rawPath, "utf-8").trim();
  const sentences = sentenceSplit(raw);

  const result = {
    id: `chapter-${String(chapterNumber).padStart(3, "0")}`,
    number: chapterNumber,
    title,
    sentences: sentences.map((sentence, i) => ({
      id: `s${String(i + 1).padStart(3, "0")}`,
      characters: annotateCharacters(sentence),
    })),
  };

  const outPath = join(CONTENT_DIR, `chapter-${String(chapterNumber).padStart(3, "0")}.json`);
  writeFileSync(outPath, JSON.stringify(result, null, 2), "utf-8");
  console.log(`✓ Wrote ${outPath} (${sentences.length} sentences)`);
}

// Usage: node scripts/process-text.mjs <chapter-number> <title> <raw-file.txt>
// Example: node scripts/process-text.mjs 1 "宴桃园豪杰三结义" content/raw/ch01.txt
const [, , chapterArg, titleArg, fileArg] = process.argv;

if (!chapterArg || !titleArg || !fileArg) {
  console.error("Usage: node scripts/process-text.mjs <chapter-number> <title> <raw-txt-path>");
  process.exit(1);
}

processChapter(fileArg, parseInt(chapterArg, 10), titleArg);
