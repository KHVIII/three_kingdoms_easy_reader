"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import zh from "@/messages/zh.json";
import en from "@/messages/en.json";

type Lang = "zh" | "en";
type Messages = typeof zh;

interface I18nContextType {
  lang: Lang;
  t: Messages;
  toggle: () => void;
}

const I18nContext = createContext<I18nContextType>({
  lang: "zh",
  t: zh,
  toggle: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("zh");
  const t = lang === "zh" ? zh : en;
  const toggle = () => setLang((l) => (l === "zh" ? "en" : "zh"));
  return (
    <I18nContext.Provider value={{ lang, t, toggle }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
