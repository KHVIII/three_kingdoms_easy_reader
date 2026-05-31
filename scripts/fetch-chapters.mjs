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
  "曹操煮酒论英雄 关公赚城斩车胄",
  "袁曹各起马步三军 关张共擒王刘二将",
  "祢正平裸衣骂贼 吉太医下毒遭刑",
  "国贼行凶杀贵妃 皇叔败走投袁绍",
  "屯土山关公约三事 救白马曹操解重围",
  "袁本初败兵折将 关云长挂印封金",
  "美髯公千里走单骑 汉寿侯五关斩六将",
  "斩蔡阳兄弟释疑 会古城主臣聚义",
  "小霸王怒斩于吉 碧眼儿坐领江东",
  "战官渡本初败绩 劫乌巢孟德烧粮",
  "曹操仓亭破本初 玄德荆州依刘表",
  "夺冀州袁尚争锋 决漳河许攸献计",
  "曹丕乘乱纳甄氏 郭嘉遗计定辽东",
  "蔡夫人隔屏听密语 刘皇叔跃马过檀溪",
  "玄德南漳逢隐沦 单福新野遇英主",
  "玄德用计袭樊城 元直走马荐诸葛",
  "司马徽再荐名士 刘玄德三顾茅庐",
  "定三分隆中决策 战长江孙氏报仇",
  "荆州城公子三求计 博望坡军师初用兵",
  "蔡夫人议献荆州 诸葛亮火烧新野",
  "刘玄德携民渡江 赵子龙单骑救主",
  "张翼德大闹长坂桥 刘豫州败走汉津口",
  "诸葛亮舌战群儒 鲁子敬力排众议",
  "孔明用智激周瑜 孙权决计破曹操",
  "三江口曹操折兵 群英会蒋干中计",
  "用奇谋孔明借箭 献密计黄盖受刑",
  "阚泽密献诈降书 庞统巧授连环计",
  "宴长江曹操赋诗 锁战船北军用武",
  "七星坛诸葛祭风 三江口周瑜纵火",
  "诸葛亮智算华容 关云长义释曹操",
  "曹仁大战东吴兵 孔明一气周公瑾",
  "诸葛亮智辞鲁肃 赵子龙计取桂阳",
  "关云长义释黄汉升 孙仲谋大战张文远",
  "吴国太佛寺看新郎 刘皇叔洞房续佳偶",
  "玄德智激孙夫人 孔明二气周公瑾",
  "曹操大宴铜雀台 孔明三气周公瑾",
  "柴桑口卧龙吊丧 耒阳县凤雏理事",
  "马孟起兴兵雪恨 曹阿瞒割须弃袍",
  "许褚裸衣斗马超 曹操抹书间韩遂",
  "张永年反难杨修 庞士元议取西蜀",
  "赵云截江夺阿斗 孙权遗书退老瞒",
  "取涪关杨高授首 攻雒城黄魏争功",
  "诸葛亮痛哭庞统 张翼德义释严颜",
  "孔明定计捉张任 杨阜借兵破马超",
  "马超大战葭萌关 刘备自领益州牧",
  "关云长单刀赴会 伏皇后为国捐生",
  "曹操平定汉中地 张辽威震逍遥津",
  "甘宁百骑劫魏营 左慈掷杯戏曹操",
  "卜周易管辂知机 讨汉贼五臣死节",
  "猛张飞智取瓦口隘 老黄忠计夺天荡山",
  "占对山黄忠逸待劳 据汉水赵云寡胜众",
  "诸葛亮智取汉中 曹阿瞒兵退斜谷",
  "玄德进位汉中王 云长攻拔襄阳郡",
  "庞令明抬棺决死战 关云长放水淹七军",
  "关云长刮骨疗毒 吕子明白衣渡江",
  "徐公明大战沔水 关云长败走麦城",
  "玉泉山关公显圣 洛阳城曹操感神",
  "治风疾神医身死 传遗命奸雄数终",
  "兄逼弟曹植赋诗 侄陷叔刘封伏法",
  "曹丕废帝篡炎刘 汉王正位续大统",
  "急兄仇张飞遇害 雪弟恨先主兴兵",
  "孙权降魏受九锡 先主征吴赏六军",
  "战猇亭先主得仇人 守江口书生拜大将",
  "陆逊营烧七百里 孔明巧布八阵图",
  "刘先主遗诏托孤儿 诸葛亮安居平五路",
  "难张温秦宓逞天辩 破曹丕徐盛用火攻",
  "征南寇丞相大兴师 抗天兵蛮王初受执",
  "渡泸水再缚番王 识诈降三擒孟获",
  "武乡侯四番用计 南蛮王五次遭擒",
  "驱巨兽六破蛮兵 烧藤甲七擒孟获",
  "祭泸水汉相班师 伐中原武侯上表",
  "赵子龙力斩五将 诸葛亮智取三城",
  "姜伯约归降孔明 武乡侯骂死王朗",
  "诸葛亮乘雪破羌兵 司马懿克日擒孟达",
  "马谡拒谏失街亭 武侯弹琴退仲达",
  "孔明挥泪斩马谡 周鲂断发赚曹休",
  "讨魏国武侯再上表 破曹兵姜维诈献书",
  "追汉军王双受诛 袭陈仓武侯取胜",
  "诸葛亮大破魏兵 司马懿入寇西蜀",
  "汉兵劫寨破曹真 武侯斗阵辱仲达",
  "出陇上诸葛妆神 奔剑阁张郃中计",
  "司马懿占北原渭桥 诸葛亮造木牛流马",
  "上方谷司马受困 五丈原诸葛禳星",
  "陨大星汉丞相归天 见木像魏都督丧胆",
  "武侯预伏锦囊计 魏主拆取承露盘",
  "公孙渊兵败死襄平 司马懿诈病赚曹爽",
  "魏主政归司马氏 姜维兵败牛头山",
  "丁奉雪中奋短兵 孙峻席间施密计",
  "困司马汉将奇谋 废曹芳魏家果报",
  "文鸯单骑退雄兵 姜维背水破大敌",
  "邓士载智败姜伯约 诸葛诞义讨司马昭",
  "救寿春于诠死节 取长城伯约鏖兵",
  "丁奉定计斩孙綝 姜维斗阵破邓艾",
  "曹髦驱车死南阙 姜维弃粮胜魏兵",
  "诏班师后主信谗 托屯田姜维避祸",
  "钟会分兵汉中道 武侯显圣定军山",
  "邓艾妙计取阴平 诸葛瞻战死绵竹",
  "哭祖庙一王死孝 入西川二士争功",
  "假投降巧计成虚话 再受禅依样画葫芦",
  "荐杜预老将献新谋 降孙皓三分归一统",
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
        // Remove interlanguage links ([[en:...]], [[vi:...]], etc.)
        .replace(/\[\[[a-z][a-z-]*:[^\]]*\]\]/g, "")
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

  if (n < to) {
    // Every 10 chapters, pause 90 seconds to respect Wikisource rate limits
    if ((n - from + 1) % 10 === 0) {
      process.stdout.write("  ⏸  Rate-limit pause (90s)… ");
      await new Promise((r) => setTimeout(r, 90000));
      console.log("resuming.");
    } else {
      await new Promise((r) => setTimeout(r, 4000));
    }
  }
}

console.log("\nDone.");
