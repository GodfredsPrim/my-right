"use client";

import { useEffect, useState } from "react";
import { supportedLanguages, type LanguageCode, t } from "@/lib/i18n";

const STORAGE_KEY = "my-right-language";

export function LanguageSelector({ onChange }: { onChange?: (language: LanguageCode) => void }) {
  const [language, setLanguage] = useState<LanguageCode>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
    if (saved && supportedLanguages.some((item) => item.code === saved)) setLanguage(saved);
  }, []);

  function change(value: LanguageCode) {
    setLanguage(value);
    window.localStorage.setItem(STORAGE_KEY, value);
    window.dispatchEvent(new CustomEvent("my-right-language", { detail: value }));
    onChange?.(value);
  }

  return <label className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--ink-muted)]"><span className="sr-only">{t(language, "language")}</span><select aria-label={t(language, "language")} value={language} onChange={(event) => change(event.target.value as LanguageCode)} className="rounded-full border border-[var(--line)] bg-white px-3 py-2 text-xs outline-none transition-colors hover:border-[var(--accent)] focus:border-[var(--accent)]">{supportedLanguages.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}</select></label>;
}
