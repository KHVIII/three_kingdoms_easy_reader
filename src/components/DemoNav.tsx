"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";

const MODES = [
  { href: "/demo/ruby",   zh: "全显拼音", en: "Always On"    },
  { href: "/demo/reveal", zh: "点击显拼", en: "Click Reveal"  },
  { href: "/demo/popup",  zh: "弹出释义", en: "Detail Popup"  },
];

export default function DemoNav() {
  const pathname = usePathname();
  const { lang, toggle } = useI18n();

  return (
    <nav className="demo-nav">
      <div className="demo-nav__modes">
        {MODES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className={`demo-nav__tab ${pathname === m.href ? "demo-nav__tab--active" : ""}`}
          >
            {lang === "zh" ? m.zh : m.en}
          </Link>
        ))}
      </div>
      <button className="demo-nav__lang" onClick={toggle}>
        {lang === "zh" ? "EN" : "中"}
      </button>
    </nav>
  );
}
