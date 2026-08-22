import { Link } from "@tanstack/react-router";
import { Menu, X, Globe } from "lucide-react";
import { useState } from "react";
import logoLight from "@/assets/logo-light.jpg";
import { useI18n } from "@/i18n/I18nProvider";
import { SUPPORTED_LOCALES, type Locale } from "@/i18n/translations";
import { cn } from "@/lib/utils";
import { useNavPages, type NavPage } from "@/lib/nav-pages";

// Core nav items are operational sections (Home, Menu, Events) and are not
// part of the editable static-pages CMS. Static informational pages (About,
// Visit, Hospitality, plus any custom pages) come from the database and are
// rendered after these — see useNavPages().
const coreNavItems = [
  { to: "/", key: "nav.home" as const },
  { to: "/menu", key: "nav.menu" as const },
  { to: "/events", key: "nav.events" as const },
];

function StaticNavLink({
  page,
  className,
  activeClassName,
  onClick,
}: {
  page: NavPage;
  className: string;
  activeClassName: string;
  onClick?: () => void;
}) {
  const { tField } = useI18n();
  const label = tField({ en: page.title_en, sl: page.title_sl }) ?? page.page_key;
  if (page.is_built_in) {
    // Built-in pages have dedicated typed routes.
    const to =
      page.page_key === "about"
        ? "/about"
        : page.page_key === "visit"
          ? "/visit"
          : page.page_key === "prayer"
            ? "/prayer"
            : "/hospitality";
    return (
      <Link
        to={to}
        className={className}
        activeProps={{ className: activeClassName }}
        onClick={onClick}
      >
        {label}
      </Link>
    );
  }
  return (
    <Link
      to="/p/$pageKey"
      params={{ pageKey: page.page_key }}
      className={className}
      activeProps={{ className: activeClassName }}
      onClick={onClick}
    >
      {label}
    </Link>
  );
}

function LangSwitch() {
  const { locale, setLocale, t } = useI18n();
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-border bg-card/70 px-1 py-1 text-xs font-medium backdrop-blur"
      role="group"
      aria-label={t("lang.switch")}
    >
      <Globe className="ml-2 size-3.5 text-muted-foreground" aria-hidden />
      {SUPPORTED_LOCALES.map((l: Locale) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          className={cn(
            "rounded-full px-2.5 py-1 uppercase tracking-wide transition-colors",
            locale === l
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={locale === l}
        >
          {l === "sl" ? "SLO" : "ENG"}
        </button>
      ))}
    </div>
  );
}

export function SiteHeader() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const staticPages = useNavPages();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <img
            src={logoLight}
            alt={t("brand.name")}
            width={44}
            height={44}
            className="size-11 rounded-full object-cover ring-1 ring-border"
          />
          <div className="leading-tight">
            <div className="font-display text-lg font-semibold tracking-tight">
              {t("brand.name")}
            </div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {t("brand.tagline")}
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {coreNavItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {t(item.key)}
            </Link>
          ))}
          {staticPages.map((p) => (
            <StaticNavLink
              key={p.page_key}
              page={p}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeClassName="bg-secondary text-foreground"
            />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LangSwitch />
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full border border-border md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          className="border-t border-border/60 bg-background md:hidden"
          aria-label="Mobile"
        >
          <ul className="mx-auto flex max-w-6xl flex-col px-4 py-2 sm:px-6">
            {coreNavItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="block rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-secondary"
                  activeProps={{ className: "bg-secondary text-foreground" }}
                  activeOptions={{ exact: item.to === "/" }}
                  onClick={() => setOpen(false)}
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
            {staticPages.map((p) => (
              <li key={p.page_key}>
                <StaticNavLink
                  page={p}
                  className="block rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-secondary"
                  activeClassName="bg-secondary text-foreground"
                  onClick={() => setOpen(false)}
                />
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
