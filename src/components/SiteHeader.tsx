import { Link } from "@tanstack/react-router";
import { Menu, X, Globe, ChevronDown, Sparkles, Download, Smartphone, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import logoLight from "@/assets/logo-light.jpg";
import { useI18n } from "@/i18n/I18nProvider";
import { SUPPORTED_LOCALES, type Locale } from "@/i18n/translations";
import { cn } from "@/lib/utils";
import { useNavPages, type NavPage, publicHrefForPage } from "@/lib/nav-pages";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SiteHeader() {
  const { t, tField, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const staticPages = useNavPages();
  const dropdownPages = staticPages.filter(
    (p) => p.page_key !== "prayer" && p.page_key !== "visit" && p.page_key !== "events",
  );
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      localStorage.getItem('kck_zivavera_pwa_installed') === 'true' ||
      localStorage.getItem('kck_pwa_installed') === 'true'
    ) {
      setIsPwaInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const installedHandler = () => {
      setIsPwaInstalled(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('kck_zivavera_pwa_installed', 'true');
      }
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handlePwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsPwaInstalled(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('kck_zivavera_pwa_installed', 'true');
        }
      }
      setDeferredPrompt(null);
    } else {
      const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || 'ontouchstart' in window);
      alert(
        isMobile
          ? (locale === 'sl'
              ? 'Za namestitev aplikacije Živa Vera na začetni zaslon izberite »Dodaj na začetni zaslon« v meniju brskalnika.'
              : 'To install the Živa Vera app on your home screen, tap "Add to Home Screen" in your browser menu.')
          : (locale === 'sl'
              ? 'Za namestitev na računalnik kliknite na ikono za namestitev v naslovni vrstici brskalnika (zgoraj desno).'
              : 'To install on your computer, click the install icon in your browser address bar (top right).')
      );
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        
        {/* Brand Logo & Name */}
        <Link
          to="/"
          className="group flex items-center gap-2.5 shrink-0 transition-opacity hover:opacity-90"
          onClick={() => setOpen(false)}
        >
          <img
            src="/logo.png"
            alt={t("brand.name")}
            width={40}
            height={40}
            className="size-10 object-contain drop-shadow-xs"
          />
          <div className="leading-tight">
            <div className="font-display text-lg font-semibold tracking-tight text-foreground">
              {t("brand.name")}
            </div>
            <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {t("brand.tagline")}
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium" aria-label="Primary">
          <Link
            to="/"
            className="rounded-full px-3.5 py-1.5 text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
            activeProps={{ className: "bg-secondary text-foreground font-semibold" }}
            activeOptions={{ exact: true }}
          >
            {t("nav.home")}
          </Link>
          <Link
            to="/menu"
            className="rounded-full px-3.5 py-1.5 text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
            activeProps={{ className: "bg-secondary text-foreground font-semibold" }}
          >
            {t("nav.menu")}
          </Link>
          <Link
            to="/events"
            className="rounded-full px-3.5 py-1.5 text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
            activeProps={{ className: "bg-secondary text-foreground font-semibold" }}
          >
            {t("nav.events")}
          </Link>

          {/* O nas / About Dropdown (Deduplicated) */}
          {dropdownPages.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="group inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground focus-visible:outline-none"
                >
                  <span>{t("nav.aboutDropdown")}</span>
                  <ChevronDown className="size-3.5 text-muted-foreground/70 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 p-1.5 shadow-lg">
                {dropdownPages.map((p) => {
                  const label =
                    p.page_key === "about" && (!p.title_en || p.title_en.toLowerCase() === "about us" || p.title_en.toLowerCase() === "about")
                      ? (locale === "sl" ? (p.title_sl || "Spoznajte nas") : "Get to know us")
                      : p.page_key === "hospitality"
                        ? (locale === "sl" ? "Naše gostoljubje" : "Our Hospitality")
                        : (tField({ en: p.title_en, sl: p.title_sl }) ?? p.page_key);
                  const href = publicHrefForPage(p.page_key);
                  return (
                    <DropdownMenuItem key={p.page_key} asChild className="cursor-pointer">
                      <Link
                        to={href}
                        className="w-full rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        {label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Link
            to="/prayer"
            className="rounded-full px-3.5 py-1.5 text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
            activeProps={{ className: "bg-secondary text-foreground font-semibold" }}
          >
            {t("nav.prayer")}
          </Link>
        </nav>

        {/* Right Area: Language Switcher + PWA Download + CTA Button + Portal Link */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Top Bar PWA Download Button - Auto-hides when installed / standalone */}
          {!isPwaInstalled && (
            <div className="relative group">
              <button
                onClick={handlePwaInstall}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition-all cursor-pointer shadow-xs border border-amber-400 hover:scale-105"
                title={locale === 'sl' ? 'Namesti aplikacijo ŽIVA VERA na začetni zaslon' : 'Install ŽIVA VERA App'}
                aria-label="Namesti aplikacijo"
              >
                <Download className="size-3.5 text-stone-950 animate-bounce" />
                <span className="hidden sm:inline">
                  {locale === 'sl' ? 'Namesti APP' : 'Install App'}
                </span>
              </button>

              {/* Tooltip Hover Effect */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-stone-950/95 backdrop-blur-md text-white text-[11px] font-semibold rounded-xl shadow-2xl border border-white/20 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-50 transform translate-y-1 group-hover:translate-y-0">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="size-3.5 text-amber-400" />
                  <span>{locale === 'sl' ? 'Namesti aplikacijo ŽIVA VERA' : 'Install ŽIVA VERA App'}</span>
                </div>
                <div className="text-[9px] text-amber-200 font-normal text-center mt-0.5">
                  {locale === 'sl' ? 'Hitrejši 1-klik dostop brez brskalnika' : 'Fast 1-click standalone access'}
                </div>
              </div>
            </div>
          )}

          <LangSwitch />

          {/* Where We Are CTA Button */}
          <Link
            to="/visit"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground shadow-xs transition-all hover:bg-primary/90 hover:shadow-sm active:scale-98"
          >
            <MapPin className="size-3.5" />
            <span>{t("nav.whereWeAre")}</span>
          </Link>

          {/* Quick link back to Main Church Portal using the secondary small logo */}
          <a
            href="https://kalvarija.si"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex size-8 items-center justify-center rounded-full border border-border/80 bg-secondary/40 p-1 hover:bg-secondary transition-all hover:scale-105"
            title="Krščanska cerkev Kalvarija Celje (kalvarija.si)"
            aria-label="Krščanska cerkev Kalvarija Celje"
          >
            <img
              src="/KCK-logo-rdec-sekundaren_small.png"
              alt="Kalvarija Celje"
              className="size-5.5 object-contain rounded-full"
            />
          </a>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-full border border-border/80 bg-background lg:hidden hover:bg-secondary transition-colors"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {open && (
        <nav className="border-t border-border/60 bg-background px-4 py-4 lg:hidden animate-in slide-in-from-top-2 duration-200 shadow-xl max-h-[calc(100dvh-3.75rem)] overflow-y-auto overscroll-contain">
          <div className="mx-auto flex max-w-6xl flex-col space-y-1 pb-6">
            <Link
              to="/"
              className="rounded-lg px-3.5 py-2.5 text-base font-medium text-foreground hover:bg-secondary transition-colors"
              activeProps={{ className: "bg-secondary font-semibold" }}
              activeOptions={{ exact: true }}
              onClick={() => setOpen(false)}
            >
              {t("nav.home")}
            </Link>
            <Link
              to="/menu"
              className="rounded-lg px-3.5 py-2.5 text-base font-medium text-foreground hover:bg-secondary transition-colors"
              activeProps={{ className: "bg-secondary font-semibold" }}
              onClick={() => setOpen(false)}
            >
              {t("nav.menu")}
            </Link>
            <Link
              to="/events"
              className="rounded-lg px-3.5 py-2.5 text-base font-medium text-foreground hover:bg-secondary transition-colors"
              activeProps={{ className: "bg-secondary font-semibold" }}
              onClick={() => setOpen(false)}
            >
              {t("nav.events")}
            </Link>
            <Link
              to="/prayer"
              className="rounded-lg px-3.5 py-2.5 text-base font-medium text-foreground hover:bg-secondary transition-colors"
              activeProps={{ className: "bg-secondary font-semibold" }}
              onClick={() => setOpen(false)}
            >
              {t("nav.prayer")}
            </Link>

            {/* Subpages on mobile */}
            {dropdownPages.length > 0 && (
              <div className="pt-2 pb-1">
                <div className="px-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  {t("nav.aboutDropdown")}
                </div>
                <div className="space-y-0.5 pl-2 border-l-2 border-border/70 ml-3.5">
                  {dropdownPages.map((p) => {
                    const label =
                      p.page_key === "about" && (!p.title_en || p.title_en.toLowerCase() === "about us" || p.title_en.toLowerCase() === "about")
                        ? (locale === "sl" ? (p.title_sl || "Spoznajte nas") : "Get to know us")
                        : p.page_key === "hospitality"
                          ? (locale === "sl" ? "Naše gostoljubje" : "Our Hospitality")
                          : (tField({ en: p.title_en, sl: p.title_sl }) ?? p.page_key);
                    const href = publicHrefForPage(p.page_key);
                    return (
                      <Link
                        key={p.page_key}
                        to={href}
                        className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        activeProps={{ className: "text-foreground font-semibold bg-secondary/50" }}
                        onClick={() => setOpen(false)}
                      >
                        {label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mobile Where We Are Button */}
            <div className="pt-3 mt-2 border-t border-border/60">
              <Link
                to="/visit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
                onClick={() => setOpen(false)}
              >
                <MapPin className="size-4" />
                <span>{t("nav.whereWeAre")}</span>
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

function LangSwitch() {
  const { locale, setLocale, t } = useI18n();
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-secondary/40 p-0.5 text-xs font-medium backdrop-blur-sm"
      role="group"
      aria-label={t("lang.switch")}
    >
      <Globe className="ml-1.5 size-3.5 text-muted-foreground" aria-hidden />
      {SUPPORTED_LOCALES.map((l: Locale) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider transition-all",
            locale === l
              ? "bg-background text-foreground shadow-xs"
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
