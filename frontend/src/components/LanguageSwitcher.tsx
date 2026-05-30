"use client";

import { useEffect, useRef, useState } from "react";
import { Languages, Check, Loader2 } from "lucide-react";
import { useLanguage, LANGS } from "./LanguageProvider";

export function LanguageSwitcher() {
  const { lang, setLang, translating } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <div ref={ref} className="relative" data-no-translate>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        className="p-2 rounded-md text-ink-700 hover:bg-cream-200 transition flex items-center gap-1"
      >
        {translating ? <Loader2 size={18} className="animate-spin" /> : <Languages size={18} />}
        <span className="text-xs font-medium hidden sm:inline">{current.code.toUpperCase()}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-48 max-h-80 overflow-y-auto rounded-lg border border-cream-200 bg-[var(--color-surface)] shadow-lg py-1 z-50"
        >
          <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
            Language
          </p>
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-1.5 text-sm text-ink-700 hover:bg-cream-100 transition"
            >
              <span>
                {l.native}
                <span className="text-ink-500 text-xs ml-1.5">{l.label}</span>
              </span>
              {lang === l.code && <Check size={13} className="text-clay-500" />}
            </button>
          ))}
          <p className="px-3 pt-2 pb-2 text-[10px] text-ink-500 border-t border-cream-200 mt-1">
            AI-powered · 9 languages
          </p>
        </div>
      )}
    </div>
  );
}
