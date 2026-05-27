/**
 * Downloads chapters from Wikisource and runs process-text.mjs on each.
 *
 * Source: zh.wikisource.org — Traditional Chinese wikitext, converted to
 * Simplified via opencc-js (devDependency, not bundled into the app).
 *
 * Usage:
 *   node scripts/fetch-chapters.mjs          # chapters 1–10
 *   node scripts/fetch-chapters.mjs 1 20     # chapters 1–20
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { spawnSync } from "child_process";
import * as OpenCC from "opencc-js";

const toSimplified = OpenCC.Converter({ from: "tw", to: "cn" });

// ── Chapter metadata ──────────────────────────────────────────────────────────
// Titles are the Simplified Chinese versions of the chapter headings.
const CHAPTER_TITLES = [
  "",                                             // 0-index padding
  "宴桃园豪杰三结义 斩黄巾英雄首立功",
  "张翼德怒鞭督邮 何国舅谋诛宦竖",
  "议温明董卓叱丁原 馈金珠李肃说吕布",
  "废汉帝陈留践位 谋董贼孟德献刀",
  "发矫诏诸镇应曹公 破关兵三英战吕布",
  "焚金阙董卓行凶 匿玉玺孙坚背约",
  "袁绍磐河战公孙 孙坚跨江击刘表",
  "王司徒巧使连环计 董太师大闹凤仪亭",
  "除暴凶吕布助司徒 犯长安李傕听贾诩",
  "勤王室马腾举义 报父仇曹操兴师",
  "刘皇叔北海救孔融 吕温侯濮阳破曹操",
  "陶恭祖三让徐州 曹孟德大战吕布",
  "李傕郭汜大交兵 杨奉董承双救驾",
  "曹孟德移驾幸许都 吕奉先乘夜袭徐郡",
  "军败西凉李傕死 将殴国母汉无名",
  "吕奉先射戟辕门 曹孟德败师育水",
  "袁公路大起七军 曹孟德会合三将",
  "贾文和料敌决胜 夏侯惇拔矢啖睛",
  "下邳城曹操鏖兵 白门楼吕布殒命",
  "曹阿瞒许田打围 董国舅内阁受诏",
];

// ── Wikisource fetch ──────────────────────────────────────────────────────────
const API = "https://zh.wikisource.org/w/api.php";

async function fetchWikitext(chapterNum) {
  const title = encodeURIComponent(
    `三國演義/第${String(chapterNum).padStart(3, "0")}回`
  );
  const url = `${API}?action=query&titles=${title}&prop=revisions&rvprop=content&format=json&rvslots=main`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const pages = data.query.pages;
  const page = Object.values(pages)[0];
  if (page.missing !== undefined) throw new Error(`Chapter ${chapterNum} not found on Wikisource`);
  return page.revisions[0].slots.main["*"];
}

// ── Wikitext → plain text ─────────────────────────────────────────────────────
// Output: one paragraph per line, paragraphs separated by \n.
function wikitextToPlain(wikitext) {
  // Split on blank lines to get raw paragraph blocks
  const blocks = wikitext.split(/\n{2,}/);

  const paragraphs = blocks
    .map((block) =>
      block
        // Remove templates
        .replace(/\{\{[^}]*\}\}/g, "")
        // Unwrap wiki links
        .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1")
        // Remove HTML tags
        .replace(/<[^>]+>/g, "")
        // Strip line-level markup prefixes (::, *, #, =, |, etc.)
        .replace(/^[:*#=|!]+\s*/gm, "")
        // Strip leading whitespace / ideographic spaces
        .replace(/^[\s　]+/gm, "")
        // Collapse the block's lines into one continuous string
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
        .join("")
    )
    .filter((p) => p.length > 0);

  // One paragraph per line in the raw .txt file
  return paragraphs.join("\n");
}

// ── Main ─────────────────────────────────────────────────────────────────────
const [, , fromArg, toArg] = process.argv;
const from = parseInt(fromArg ?? "1", 10);
const to   = parseInt(toArg   ?? "10", 10);

const rawDir = join(process.cwd(), "content", "raw");
mkdirSync(rawDir, { recursive: true });

for (let n = from; n <= to; n++) {
  const title = CHAPTER_TITLES[n];
  if (!title) {
    console.warn(`⚠  No title defined for chapter ${n} — add it to CHAPTER_TITLES`);
    continue;
  }

  process.stdout.write(`Chapter ${n}: fetching… `);

  let wikitext;
  try {
    wikitext = await fetchWikitext(n);
  } catch (e) {
    console.error(`\n  ✗ Fetch failed: ${e.message}`);
    continue;
  }

  const plain = wikitextToPlain(wikitext);
  const simplified = toSimplified(plain);

  const rawPath = join(rawDir, `chapter-${String(n).padStart(3, "0")}.txt`);
  writeFileSync(rawPath, simplified, "utf-8");

  process.stdout.write(`${simplified.length} chars → processing… `);

  const result = spawnSync(
    "node",
    ["scripts/process-text.mjs", String(n), title, rawPath],
    { encoding: "utf-8" }
  );

  if (result.status !== 0) {
    console.error(`\n  ✗ process-text failed:\n${result.stderr}`);
    continue;
  }

  console.log("✓");

  // Be polite to Wikisource — 1 second between requests
  if (n < to) await new Promise((r) => setTimeout(r, 1000));
}

console.log("\nDone.");
