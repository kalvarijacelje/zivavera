## Root cause

The current i18n has two independent problems that combine into the visible English → Slovene flash:

1. **Locale is resolved post-mount, not before first paint.**
   `src/i18n/I18nProvider.tsx` does:
   ```ts
   const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
   useEffect(() => { setLocaleState(detectInitial()); }, []);
   ```
   The very first render (both SSR and client hydration) always uses `DEFAULT_LOCALE`. The real locale (from `localStorage` / `navigator.language`) is only read in a `useEffect` **after** mount, which triggers a second render and swaps every translated string. That is the flash.

2. **SSR has no knowledge of the user's chosen locale.**
   Locale is persisted only in `localStorage`, which the server cannot read. So even if we lazy-init `useState` on the client, the server-rendered HTML shipped to the browser still uses the fallback locale, and hydration re-renders in the correct locale — same flash.

Secondary contributor: `t()` falls back to English (`dict[key] ?? fallback.en[key]`). Any missing Slovene key renders as English until state updates. Not the main cause, but worth auditing.

Additional symptoms this fix also removes:
- `<html lang="en">` is hardcoded in `RootShell` — should reflect the resolved locale.
- `StaticPageRenderer` reads `locale` from context, so its DB-driven copy flips too on the mount re-render.

## Fix strategy

Resolve the locale **once, before render**, using a cookie readable on both server and client, and hand it to the provider synchronously. No post-mount `setLocaleState`, no flicker.

### 1. Persist locale in a cookie (in addition to localStorage)

`ziva-vera.locale=sl|en; Path=/; Max-Age=31536000; SameSite=Lax`. Written by `setLocale` in `I18nProvider` alongside the existing `localStorage` write. Read on the server from the `Cookie` header, on the client from `document.cookie`.

### 2. Resolve locale in the root route context

In `src/routes/__root.tsx`, add a small `beforeLoad` that returns `{ locale }`:

- Server: read cookie from `getRequestHeaders()` (TanStack Start helper). Fall back to `Accept-Language`, then `DEFAULT_LOCALE`.
- Client: read `document.cookie`. Fall back to `navigator.language`, then `DEFAULT_LOCALE`.

Expose `locale` via `Route.useRouteContext()` so `RootComponent` and `RootShell` both see the same value.

### 3. Initialize I18nProvider synchronously from resolved locale

Change the provider signature to `I18nProvider({ initialLocale, children })`. Use a lazy initializer:

```ts
const [locale, setLocaleState] = useState<Locale>(() => initialLocale);
```

Remove the `useEffect(() => setLocaleState(detectInitial()), [])` — no post-mount swap. `setLocale` continues to write cookie + localStorage and update state, so the language switcher still works instantly.

### 4. Reflect locale in the HTML shell

Read `locale` from route context in `RootShell` and render `<html lang={locale}>`. This also fixes browser translation prompts.

### 5. Audit Slovene dictionary for missing keys

Quick scan of `src/i18n/translations.ts`: any key present in `en` but missing in `sl` renders as English via the fallback. Fill gaps so that even a stale render can't leak English strings. (Small pass, not a rewrite.)

## Files to change

- `src/i18n/I18nProvider.tsx` — accept `initialLocale`, drop post-mount effect, write cookie in `setLocale`, expose a `readLocaleSync()` helper.
- `src/routes/__root.tsx` — `beforeLoad` resolves locale from cookie/headers, passes to context; `RootShell` uses it for `<html lang>`; `RootComponent` passes it to `<I18nProvider initialLocale={locale}>`.
- `src/i18n/translations.ts` — fill any missing Slovene keys discovered during audit.

## What does not change

- `LangSwitch` UI and behavior.
- English remains the source-of-truth dictionary and code-level fallback.
- No new loading gate, no Suspense fence, no async translation loading — the dictionary is already bundled synchronously.
- `StaticPageRenderer`'s DB-fetch behavior is unchanged; because it now receives the correct locale on the very first render, its `fieldByLocale(en, sl, locale)` picks Slovene immediately when the DB response arrives (no locale flip afterward).

## Verification

- Set language to Slovene, hard-reload homepage, `/menu`, `/events`, `/visit`, `/about`, `/hospitality`, and an admin page: initial HTML and first paint are Slovene, no visible swap.
- Switch to English via `LangSwitch`, reload: initial paint is English.
- Clear cookies + `localStorage`, set browser to `sl-SI`: first paint Slovene. Set to `en-US`: first paint English.
- `document.documentElement.lang` matches the selected locale on first paint.

## Known limitations

- First-ever visit from a browser whose `Accept-Language` doesn't include `sl` or `en` will render in `DEFAULT_LOCALE` ("sl"). This is intentional and matches current behavior; the user can switch and it's remembered from then on.
- Very old sessions that only have `localStorage` set (no cookie yet) will get one initial render in `DEFAULT_LOCALE`, then the provider's `setLocale` (called once on mount if localStorage disagrees with cookie) will re-sync and write the cookie for future visits. We can either accept this one-time reconciliation for pre-existing users or skip it entirely — I'll skip the reconciliation to guarantee zero post-mount swaps, at the cost of one extra manual switch for users who had a stored preference but no cookie yet.
