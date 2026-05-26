import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { pinyin } from "pinyin-pro";

const CONTENT_DIR = join(process.cwd(), "content");
const DICT_PATH   = join(process.cwd(), "scripts", "dict", "word.json");

// Punctuation that gets null pinyin/definition
const PUNCT = new Set(["，", "。", "！", "？", "；", "：", "、", "…", "「", "」", "『", "』", "（", "）", "—", "·", "\n", " "]);

// ── Dictionary setup ──────────────────────────────────────────────────────────

function loadDict() {
  if (!existsSync(DICT_PATH)) {
    console.warn("⚠  Dictionary not found at scripts/dict/word.json");
    console.warn("   Run: curl -sL https://raw.githubusercontent.com/pwxcoo/chinese-xinhua/master/data/word.json -o scripts/dict/word.json");
    return new Map();
  }
  const raw = JSON.parse(readFileSync(DICT_PATH, "utf-8"));
  const map = new Map();
  for (const entry of raw) {
    if (!map.has(entry.word)) {
      map.set(entry.word, extractDefinitions(entry.explanation, entry.word));
    }
  }
  console.log(`✓ Loaded ${map.size} dictionary entries`);
  return map;
}

// Numbered definition markers used in Xinhua-style entries: ⒈⒉⒊ … ⒛
const NUMBERED_DEF = /^[⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑⒒⒓⒔⒕⒖⒗⒘⒙⒚⒛]/;

function extractDefinitions(explanation, headword) {
  if (!explanation) return null;
  const lines = explanation.split("\n").map((l) => l.trim()).filter(Boolean);

  // Prefer numbered definitions (⒈⒉⒊ …) — most entries have them
  const numbered = lines
    .filter((l) => NUMBERED_DEF.test(l))
    .slice(0, 3)
    .map((l) =>
      l
        .replace(NUMBERED_DEF, "")       // strip the leading number
        .replace(/～/g, headword)         // ～ is the dictionary's stand-in for the headword
        .replace(/\s+/g, "")
        .slice(0, 60)
    )
    .filter(Boolean);

  if (numbered.length > 0) return numbered;

  // Fallback: take first few non-header substantive lines
  const fallback = lines
    .filter((l) => !/^[一-鿿]{1,3}[〈《【(（]/.test(l) && l.length >= 4)
    .slice(0, 3)
    .map((l) => l.replace(/\s+/g, "").slice(0, 60));

  return fallback.length > 0 ? fallback : null;
}

// ── Text processing ───────────────────────────────────────────────────────────

function sentenceSplit(text) {
  return text.split(/(?<=[。！？])/).map((s) => s.trim()).filter(Boolean);
}

function annotateCharacters(sentence, dict) {
  const chars = [...sentence];

  // Pass all hanzi together so pinyin-pro can resolve polyphones using context.
  // Punctuation is excluded because it doesn't aid disambiguation and can
  // confuse the library's word-segmentation step.
  const hanziOnly = chars.filter((c) => !PUNCT.has(c)).join("");
  const pinyinArr =
    hanziOnly.length > 0
      ? pinyin(hanziOnly, { toneType: "symbol", type: "array" })
      : [];

  let pi = 0;
  return chars.map((char) => {
    if (PUNCT.has(char)) return { char, pinyin: null, definitions: null };
    const py = pinyinArr[pi++] ?? null;
    const definitions = dict.get(char) ?? null;
    return { char, pinyin: py, definitions };
  });
}

function processChapter(rawPath, chapterNumber, title) {
  const dict = loadDict();
  const raw  = readFileSync(rawPath, "utf-8").trim();
  const sentences = sentenceSplit(raw);

  const result = {
    id: `chapter-${String(chapterNumber).padStart(3, "0")}`,
    number: chapterNumber,
    title,
    sentences: sentences.map((sentence, i) => ({
      id: `s${String(i + 1).padStart(3, "0")}`,
      characters: annotateCharacters(sentence, dict),
    })),
  };

  const outPath = join(CONTENT_DIR, `chapter-${String(chapterNumber).padStart(3, "0")}.json`);
  writeFileSync(outPath, JSON.stringify(result, null, 2), "utf-8");
  console.log(`✓ Wrote ${outPath} (${sentences.length} sentences)`);
}

// Usage: node scripts/process-text.mjs <chapter-number> <title> <raw-file.txt>
const [, , chapterArg, titleArg, fileArg] = process.argv;

if (!chapterArg || !titleArg || !fileArg) {
  console.error("Usage: node scripts/process-text.mjs <chapter-number> <title> <raw-txt-path>");
  process.exit(1);
}

processChapter(fileArg, parseInt(chapterArg, 10), titleArg);
