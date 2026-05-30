"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export type Lang = "en" | "fr" | "es" | "ar" | "zh" | "hi" | "sw" | "pt" | "de";

export const LANGS: { code: Lang; label: string; native: string }[] = [
  { code: "en", label: "English",    native: "English" },
  { code: "fr", label: "French",     native: "Français" },
  { code: "es", label: "Spanish",    native: "Español" },
  { code: "pt", label: "Portuguese", native: "Português" },
  { code: "ar", label: "Arabic",     native: "العربية" },
  { code: "zh", label: "Chinese",    native: "中文" },
  { code: "hi", label: "Hindi",      native: "हिन्दी" },
  { code: "sw", label: "Swahili",    native: "Kiswahili" },
  { code: "de", label: "German",     native: "Deutsch" },
];

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  translating: boolean;
};

const LanguageCtx = createContext<Ctx | null>(null);

export function useLanguage() {
  const ctx = useContext(LanguageCtx);
  if (!ctx) throw new Error("useLanguage must be used within <LanguageProvider>");
  return ctx;
}

// Skip these tags entirely when walking text nodes.
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA", "INPUT"]);

// Collect translatable text nodes under root. Stores original in a WeakMap for revert.
function collectTextNodes(root: HTMLElement): Text[] {
  const out: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = node.nodeValue?.trim();
      if (!text || text.length < 2) return NodeFilter.FILTER_REJECT;
      if (/^[\d\s\p{P}\p{S}]+$/u.test(text)) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (parent.closest("[data-no-translate]")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let n: Node | null;
  while ((n = walker.nextNode())) out.push(n as Text);
  return out;
}

const originalText = new WeakMap<Text, string>();

const CACHE_KEY = "gb-translations";

function loadPersistentCache(): Map<string, Map<string, string>> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return new Map();
    const parsed = JSON.parse(raw) as Record<string, Record<string, string>>;
    const cache = new Map<string, Map<string, string>>();
    for (const [lang, entries] of Object.entries(parsed)) {
      cache.set(lang, new Map(Object.entries(entries)));
    }
    return cache;
  } catch {
    return new Map();
  }
}

function savePersistentCache(cache: Map<string, Map<string, string>>) {
  try {
    const obj: Record<string, Record<string, string>> = {};
    for (const [lang, entries] of cache) {
      obj[lang] = Object.fromEntries(entries);
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
  } catch { /* ignore */ }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [translating, setTranslating] = useState(false);
  const cache = useRef<Map<string, Map<string, string>>>(loadPersistentCache());

  // Restore preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem("user-language") as Lang | null;
      if (saved && LANGS.some((l) => l.code === saved) && saved !== "en") {
        // Defer to let first paint settle
        setTimeout(() => applyLang(saved), 300);
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const revertToEnglish = useCallback(() => {
    const root = document.querySelector("main") as HTMLElement | null;
    const scope = root ?? document.body;
    collectTextNodes(scope).forEach((node) => {
      const orig = originalText.get(node);
      if (orig !== undefined) node.nodeValue = orig;
    });
  }, []);

  const applyLang = useCallback(async (target: Lang) => {
    document.documentElement.lang = target;
    document.documentElement.dir = target === "ar" ? "rtl" : "ltr";

    if (target === "en") {
      revertToEnglish();
      return;
    }

    const root = (document.querySelector("main") as HTMLElement | null) ?? document.body;
    const nodes = collectTextNodes(root);
    if (!nodes.length) return;

    setTranslating(true);
    const langCache = cache.current.get(target) ?? new Map<string, string>();
    cache.current.set(target, langCache);

    // Save originals + figure out which strings still need translating
    const need: string[] = [];
    nodes.forEach((node) => {
      const src = node.nodeValue ?? "";
      if (!originalText.has(node)) originalText.set(node, src);
      const base = originalText.get(node)!;
      if (!langCache.has(base)) need.push(base);
    });

    const uniqueNeed = Array.from(new Set(need));
    try {
      // Batch in chunks of 40 to keep payloads reasonable
      for (let i = 0; i < uniqueNeed.length; i += 40) {
        const chunk = uniqueNeed.slice(i, i + 40);
        const res = await fetch("/api/ai/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texts: chunk, target }),
        });
        const data = await res.json();
        const translations: string[] = data.translations ?? chunk;
        chunk.forEach((src, idx) => langCache.set(src, translations[idx] ?? src));
      }
      // Apply
      nodes.forEach((node) => {
        const base = originalText.get(node)!;
        const t = langCache.get(base);
        if (t) node.nodeValue = t;
      });
      savePersistentCache(cache.current);
    } finally {
      setTranslating(false);
    }
  }, [revertToEnglish]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("user-language", l); } catch { /* ignore */ }
    applyLang(l);
  }, [applyLang]);

  return (
    <LanguageCtx.Provider value={{ lang, setLang, translating }}>
      {children}
    </LanguageCtx.Provider>
  );
}
