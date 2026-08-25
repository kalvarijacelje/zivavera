import { Link } from "@tanstack/react-router";
import logoLight from "@/assets/logo-light.jpg";
import { useI18n } from "@/i18n/I18nProvider";
import { useNavPages } from "@/lib/nav-pages";

export function SiteFooter() {
  const { t, tField } = useI18n();
  const staticPages = useNavPages();
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={logoLight}
              alt={t("brand.name")}
              width={48}
              height={48}
              className="size-12 rounded-full object-cover ring-1 ring-border"
              loading="lazy"
            />
            <div>
              <div className="font-display text-lg font-semibold">
                {t("brand.name")}
              </div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {t("brand.tagline")}
              </div>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            {t("footer.mission")}
          </p>
          <Link
            to="/login"
            className="mt-2 inline-block text-xs text-muted-foreground/70 hover:text-primary hover:underline"
          >
            {t("footer.adminLogin")}
          </Link>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t("nav.menu")}
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/" className="hover:text-primary">{t("nav.home")}</Link></li>
            <li><Link to="/menu" className="hover:text-primary">{t("nav.menu")}</Link></li>
            <li><Link to="/events" className="hover:text-primary">{t("nav.events")}</Link></li>
            {staticPages.map((p) => {
              const label =
                p.page_key === "about" && (!p.title_en || p.title_en.toLowerCase() === "about us" || p.title_en.toLowerCase() === "about")
                  ? (locale === "sl" ? (p.title_sl || "Spoznajte nas") : "Get to know us")
                  : (tField({ en: p.title_en, sl: p.title_sl }) ?? p.page_key);
              if (p.is_built_in) {
                const to =
                  p.page_key === "about"
                    ? "/about"
                    : p.page_key === "visit"
                      ? "/visit"
                      : p.page_key === "prayer"
                        ? "/prayer"
                        : "/hospitality";
                return (
                  <li key={p.page_key}>
                    <Link to={to} className="hover:text-primary">
                      {label}
                    </Link>
                  </li>
                );
              }
              return (
                <li key={p.page_key}>
                  <Link
                    to="/p/$pageKey"
                    params={{ pageKey: p.page_key }}
                    className="hover:text-primary"
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t("brand.partner")}
          </h3>
          <div className="mt-3 text-muted-foreground font-extralight whitespace-pre-line text-xs">
            © {new Date().getFullYear()} {t("brand.name")}. {t("footer.rights")}{"\n\n"}
            {t("footer.disclaimerShort")}
          </div>
          <Link
            to="/hospitality"
            className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
          >
            {t("footer.hospitalityLink")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
