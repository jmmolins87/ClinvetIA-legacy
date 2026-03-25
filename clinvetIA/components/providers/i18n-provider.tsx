"use client";

import * as React from "react";

import en from "@/locales/en.json";
import es from "@/locales/es.json";

type Language = "es" | "en";
type Messages = typeof es;

function getFromMessages(messages: Messages, key: string): unknown {
  const parts = key.split(".");
  let cur: unknown = messages;
  for (const p of parts) {
    if (!cur || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

const STORAGE_KEY = "clinvetia.lang";

type I18nContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  get: (key: string) => unknown;
};

const I18nContext = React.createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Language>("es");

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "es" || stored === "en") setLangState(stored);
    } catch {
      // Ignore.
    }
  }, []);

  const setLang = React.useCallback((next: Language) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore.
    }
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const fallback = es as Messages;
  const messages = lang === "en" ? (en as Messages) : fallback;

  const get = React.useCallback(
    (key: string) => {
      const value = getFromMessages(messages, key);
      if (value !== undefined) return value;
      return getFromMessages(fallback, key);
    },
    [messages, fallback]
  );

  const t = React.useCallback(
    (key: string) => {
      const value = getFromMessages(messages, key);
      if (typeof value === "string") return value;

      const fallbackValue = getFromMessages(fallback, key);
      if (typeof fallbackValue === "string") return fallbackValue;

      return key;
    },
    [messages, fallback]
  );

  const value = React.useMemo<I18nContextValue>(() => ({ lang, setLang, t, get }), [lang, setLang, t, get]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation(): I18nContextValue {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useTranslation must be used within I18nProvider");
  return ctx;
}
