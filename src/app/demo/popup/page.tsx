"use client";

import { useState, useEffect } from "react";
import { I18nProvider, useI18n } from "@/lib/i18n";
import DemoNav from "@/components/DemoNav";
import { getChapter001 } from "@/lib/content";
import type { Character } from "@/lib/types";

const chapter = getChapter001();

// Placeholder definitions — will be replaced by real dictionary data later
const PLACEHOLDER_DEFS: Record<string, string> = {
  话: "言语；说话",  说: "陈述，讲解",  天: "自然界的最高处",
  下: "位置在低处",  大: "体积广，数量多", 势: "权力；形势",
  分: "区别；划分",  久: "时间长",       必: "一定，必然",
  合: "闭；聚集",    周: "朝代名",       末: "末端；最后",
  七: "数目字",      国: "国家",         争: "力求获取",
  并: "合并；兼并",  入: "进入",         于: "介词，在",
  秦: "朝代名",      及: "到；到达",     灭: "消灭；熄灭",
  之: "结构助词",    后: "在…之后",      楚: "国名",
  汉: "朝代名；汉族", 又: "再次；表示重复",
};

interface Selected {
  char: string;
  pinyin: string;
  def: string;
}

function PopupReader() {
  const { t, lang } = useI18n();
  const [selected, setSelected] = useState<Selected | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleClick(c: Character) {
    if (!c.pinyin) return;
    setSelected({
      char: c.char,
      pinyin: c.pinyin,
      def: PLACEHOLDER_DEFS[c.char] ?? "〔释义待补充〕",
    });
  }

  return (
    <>
      <DemoNav />
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 1.5rem 4rem" }}>
        <div className="chapter-header">
          <p className="chapter-number">第{chapter.number}回</p>
          <p className="chapter-title">{chapter.title}</p>
        </div>

        <p className="reader-hint">{t.reader.tapHint}</p>

        <div className="reading-area chinese" style={{ fontSize: "2rem", justifyContent: "center" }}>
          {chapter.sentences.map((sentence) =>
            sentence.characters.map((c, i) => {
              const isPunct = !c.pinyin;
              return (
                <span
                  key={`${sentence.id}-${i}`}
                  className={`char-ruby ${isPunct ? "is-punct" : ""}`}
                  onClick={() => handleClick(c)}
                  style={!isPunct ? { cursor: "pointer" } : undefined}
                >
                  {/* reserve pinyin row height so text doesn't jump */}
                  <span className="char-pinyin invisible" aria-hidden="true">a</span>
                  <span
                    className="char-glyph"
                    style={{
                      color: selected?.char === c.char && !isPunct ? "var(--vermillion)" : undefined,
                      transition: "color 0.15s",
                    }}
                  >
                    {c.char}
                  </span>
                </span>
              );
            })
          )}
        </div>
      </div>

      {selected && (
        <div className="popup-overlay" onClick={() => setSelected(null)}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setSelected(null)} aria-label={t.reader.close}>×</button>
            <div className="popup-char">{selected.char}</div>
            <div className="popup-pinyin">{selected.pinyin}</div>
            <div className="popup-divider" />
            <div className="popup-definition">{selected.def}</div>
          </div>
        </div>
      )}
    </>
  );
}

export default function PopupPage() {
  return (
    <I18nProvider>
      <PopupReader />
    </I18nProvider>
  );
}
