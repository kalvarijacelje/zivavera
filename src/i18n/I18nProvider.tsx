import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_LOCALE, translations, type Locale } from "./translations";
import { LOCALE_COOKIE, LOCALE_STORAGE_KEY, resolveInitialLocale } from "./locale";

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
  /** Pick the right value from a per-locale field on a content record. */
  tField: <T,>(field: Partial<Record<Locale, T>> | undefined) => T | undefined;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function writeCookie(locale: Locale) {
  if (typeof document === "undefined") return;
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${oneYear}; SameSite=Lax`;
}

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  /** Locale resolved before render (SSR + client). Falls back to a
   *  synchronous isomorphic read if not provided. */
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(
    () => initialLocale ?? resolveInitialLocale() ?? DEFAULT_LOCALE,
  );

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      // Backfill cookie so SSR resolves the same locale on the next visit,
      // avoiding a one-time flicker for users who only had localStorage.
      if (!document.cookie.includes(`${LOCALE_COOKIE}=`)) {
        writeCookie(locale);
      }
    }
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, l);
      } catch {
        /* ignore */
      }
    }
    writeCookie(l);
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const dict = translations[locale];
    const fallback = translations.en;
    return {
      locale,
      setLocale,
      t: (key) => dict[key] ?? fallback[key] ?? key,
      tField: (field) => field?.[locale] ?? field?.en,
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
