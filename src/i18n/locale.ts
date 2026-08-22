import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie, getRequestHeader } from "@tanstack/react-start/server";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from "./translations";

export const LOCALE_COOKIE = "ziva-vera.locale";
export const LOCALE_STORAGE_KEY = "ziva-vera.locale";

function normalize(value: string | null | undefined): Locale | null {
  if (!value) return null;
  const v = value.toLowerCase();
  if (v.startsWith("sl")) return "sl";
  if (v.startsWith("en")) return "en";
  return null;
}

function fromCookieHeader(header: string | undefined | null): Locale | null {
  if (!header) return null;
  for (const part of header.split(/;\s*/)) {
    const [k, ...rest] = part.split("=");
    if (k === LOCALE_COOKIE) {
      const raw = decodeURIComponent(rest.join("="));
      if ((SUPPORTED_LOCALES as readonly string[]).includes(raw)) return raw as Locale;
    }
  }
  return null;
}

/**
 * Resolve the active locale synchronously on both server (SSR) and client
 * (browser), before first render. Order: explicit cookie → localStorage
 * (client only) → Accept-Language / navigator.language → DEFAULT_LOCALE.
 */
export const resolveInitialLocale = createIsomorphicFn()
  .server((): Locale => {
    const cookie = getCookie(LOCALE_COOKIE);
    if (cookie && (SUPPORTED_LOCALES as readonly string[]).includes(cookie)) {
      return cookie as Locale;
    }
    const accept = getRequestHeader("accept-language");
    const first = accept?.split(",")[0]?.trim();
    return normalize(first) ?? DEFAULT_LOCALE;
  })
  .client((): Locale => {
    if (typeof document !== "undefined") {
      const fromCookie = fromCookieHeader(document.cookie);
      if (fromCookie) return fromCookie;
    }
    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
        if (stored && (SUPPORTED_LOCALES as readonly string[]).includes(stored)) {
          return stored as Locale;
        }
      } catch {
        /* ignore */
      }
      const nav = normalize(window.navigator.language);
      if (nav) return nav;
    }
    return DEFAULT_LOCALE;
  });
