"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MODES = [
  { href: "/demo/ruby",   label: "全显拼音" },
  { href: "/demo/reveal", label: "点击显拼" },
  { href: "/demo/popup",  label: "弹出释义" },
];

export default function DemoNav() {
  const pathname = usePathname();

  return (
    <nav className="demo-nav">
      <div className="demo-nav__modes">
        {MODES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className={`demo-nav__tab ${pathname === m.href ? "demo-nav__tab--active" : ""}`}
          >
            {m.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
