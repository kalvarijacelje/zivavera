import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";
import {
  fetchStaticPageByKey,
  fieldByLocale,
  type StaticPage,
  type StaticPageSection,
} from "@/lib/static-pages";
import { SignedImage } from "@/components/admin/SignedImage";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export function StaticPageRenderer({
  pageKey,
  before,
  after,
}: {
  pageKey: string;
  /** @deprecated no longer rendered — kept optional to avoid breaking callers mid-migration */
  fallbackTitle?: string;
  before?: ReactNode;
  after?: ReactNode;
}) {
  const { locale, t } = useI18n();
  const [page, setPage] = useState<StaticPage | null>(null);
  const [sections, setSections] = useState<StaticPageSection[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetchStaticPageByKey(pageKey).then((res) => {
      if (!active) return;
      setPage(res.page);
      setSections(res.sections);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [pageKey]);

  const title = page ? fieldByLocale(page.title_en, page.title_sl, locale) : null;

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
      {!loaded ? (
        // Locale-neutral title-shaped skeleton to preserve the H1 height
        // (matches font-display text-4xl sm:text-5xl line-height) and avoid layout shift.
        <header className="text-center" aria-hidden="true">
          <div className="mx-auto h-10 w-2/3 animate-pulse rounded bg-muted sm:h-12" />
        </header>
      ) : (
        title && (
          <header className="text-center">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              {title}
            </h1>
          </header>
        )
      )}

      {before && <div className="mt-12">{before}</div>}

      {!loaded && (
        <div className="mt-12 space-y-6">
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
        </div>
      )}

      {loaded && !page && !before && !after && (
        <p className="mt-12 text-center text-sm text-muted-foreground">
          {t("static.notAvailable")}
        </p>
      )}

      {loaded && sections.length > 0 && (
        <div className="mt-12 space-y-12">
          {sections.map((s) => (
            <SectionRenderer key={s.id} section={s} locale={locale} />
          ))}
        </div>
      )}

      {after && <div className="mt-12">{after}</div>}
    </section>
  );
}


function toEmbedUrl(url: string): { src: string; provider: "youtube" | "vimeo" | "other" } | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v");
      if (id) return { src: `https://www.youtube.com/embed/${id}`, provider: "youtube" };
    }
    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      if (id) return { src: `https://www.youtube.com/embed/${id}`, provider: "youtube" };
    }
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id) return { src: `https://player.vimeo.com/video/${id}`, provider: "vimeo" };
    }
    return { src: url, provider: "other" };
  } catch {
    return null;
  }
}

function SectionRenderer({ section, locale }: { section: StaticPageSection; locale: string }) {
  const t = (en: string | null | undefined, sl: string | null | undefined) =>
    fieldByLocale(en, sl, locale) ?? "";

  const title = t(section.title_en, section.title_sl);
  const subtitle = t(section.subtitle_en, section.subtitle_sl);
  const body = t(section.body_en, section.body_sl);
  const eyebrow = t(section.eyebrow_en, section.eyebrow_sl);
  const btnText = t(section.button_text_en, section.button_text_sl);

  switch (section.section_type) {
    case "hero":
      return (
        <article className="text-center">
          {eyebrow && (
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
          )}
          {title && (
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-4 text-pretty text-muted-foreground">{subtitle}</p>
          )}
          {section.image_path && (
            <SignedImage
              path={section.image_path}
              alt=""
              className="mt-6 aspect-[16/7] w-full rounded-3xl"
            />
          )}
          {btnText && section.button_link && (
            <Button asChild className="mt-6">
              <a href={section.button_link}>{btnText}</a>
            </Button>
          )}
        </article>
      );

    case "simple_text_block":
      return (
        <article>
          {title && (
            <h2 className="font-display text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
              {title}
            </h2>
          )}
          {body && (
            <p
              className={cn(
                "text-pretty leading-relaxed text-foreground/85",
                title && "mt-4",
              )}
            >
              {body}
            </p>
          )}
        </article>
      );

    case "text_with_image": {
      const right = section.layout_variant === "right";
      return (
        <article className="grid items-center gap-8 md:grid-cols-2">
          {section.image_path && (
            <SignedImage
              path={section.image_path}
              alt=""
              className={cn("aspect-[4/3] w-full rounded-3xl", right && "md:order-2")}
            />
          )}
          <div className={cn(right && "md:order-1")}>
            {title && (
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                {title}
              </h2>
            )}
            {body && (
              <p className="mt-4 text-pretty leading-relaxed text-foreground/85">{body}</p>
            )}
            {btnText && section.button_link && (
              <Button asChild className="mt-5">
                <a href={section.button_link}>{btnText}</a>
              </Button>
            )}
          </div>
        </article>
      );
    }

    case "quote_or_highlight":
      return (
        <article className="rounded-3xl border border-primary/30 bg-primary/5 p-6 sm:p-10">
          {title && (
            <p className="font-display text-xl font-semibold text-primary">{title}</p>
          )}
          {body && (
            <blockquote
              className={cn(
                "text-pretty text-lg leading-relaxed text-foreground/90",
                title && "mt-3",
              )}
            >
              {body}
            </blockquote>
          )}
        </article>
      );

    case "call_to_action":
      return (
        <article className="rounded-3xl border border-primary/30 bg-primary/5 p-6 sm:p-8">
          {title && (
            <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
          )}
          {body && (
            <p className="mt-3 max-w-2xl leading-relaxed text-foreground/85">{body}</p>
          )}
          {btnText && section.button_link && (
            <Button asChild className="mt-4">
              <a href={section.button_link}>{btnText}</a>
            </Button>
          )}
          {subtitle && (
            <p className="mt-4 inline-flex items-start gap-2 rounded-2xl bg-card/70 px-4 py-3 text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
        </article>
      );

    case "image_block":
      return (
        <article>
          {section.image_path && (
            <SignedImage
              path={section.image_path}
              alt={title || ""}
              className="aspect-[16/9] w-full rounded-3xl"
            />
          )}
          {(title || body) && (
            <p className="mt-3 text-center text-sm text-muted-foreground">
              {title} {body}
            </p>
          )}
        </article>
      );

    case "policy_section": {
      const bullets = (section.bullets ?? [])
        .map((b) => fieldByLocale(b.text_en, b.text_sl, locale))
        .filter(Boolean) as string[];
      return (
        <article className="space-y-4 text-pretty leading-relaxed text-foreground/85">
          {title && (
            <h2 className="font-display text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
              {title}
            </h2>
          )}
          {body && <p className="font-medium text-foreground">{body}</p>}
          {bullets.length > 0 && (
            <ul className="list-disc space-y-2 pl-6">
              {bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}
          {subtitle && <p>{subtitle}</p>}
        </article>
      );
    }

    case "image_gallery": {
      const items = section.items ?? [];
      if (items.length === 0) return null;
      return (
        <article>
          {title && (
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h2>
          )}
          {body && (
            <p className="mt-3 text-pretty leading-relaxed text-foreground/85">{body}</p>
          )}
          <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3", (title || body) && "mt-6")}>
            {items.map((it, i) => {
              const caption = fieldByLocale(it.caption_en, it.caption_sl, locale) ?? "";
              return (
                <figure key={i} className="overflow-hidden">
                  {it.image_path && (
                    <SignedImage
                      path={it.image_path}
                      alt={caption}
                      className="aspect-square w-full rounded-2xl"
                    />
                  )}
                  {caption && (
                    <figcaption className="mt-2 text-xs text-muted-foreground">
                      {caption}
                    </figcaption>
                  )}
                </figure>
              );
            })}
          </div>
        </article>
      );
    }

    case "card_grid": {
      const items = section.items ?? [];
      const cols = section.layout_variant === "2" ? "sm:grid-cols-2" : section.layout_variant === "4" ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";
      return (
        <article>
          {title && (
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h2>
          )}
          {body && (
            <p className="mt-3 text-pretty leading-relaxed text-foreground/85">{body}</p>
          )}
          <div className={cn("grid grid-cols-1 gap-4", cols, (title || body) && "mt-6")}>
            {items.map((it, i) => {
              const cTitle = fieldByLocale(it.title_en, it.title_sl, locale) ?? "";
              const cBody = fieldByLocale(it.body_en, it.body_sl, locale) ?? "";
              const Wrap: React.ElementType = it.link ? "a" : "div";
              return (
                <Wrap
                  key={i}
                  {...(it.link ? { href: it.link } : {})}
                  className={cn(
                    "flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow",
                    it.link && "hover:shadow-md",
                  )}
                >
                  {it.image_path && (
                    <SignedImage
                      path={it.image_path}
                      alt={cTitle}
                      className="aspect-[4/3] w-full rounded-none"
                    />
                  )}
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    {it.icon && !it.image_path && (
                      <span className="text-2xl">{it.icon}</span>
                    )}
                    {cTitle && (
                      <h3 className="font-display text-lg font-semibold">{cTitle}</h3>
                    )}
                    {cBody && (
                      <p className="text-sm leading-relaxed text-foreground/80">{cBody}</p>
                    )}
                  </div>
                </Wrap>
              );
            })}
          </div>
        </article>
      );
    }

    case "faq": {
      const items = section.items ?? [];
      return (
        <article>
          {title && (
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h2>
          )}
          {body && (
            <p className="mt-3 text-pretty leading-relaxed text-foreground/85">{body}</p>
          )}
          <Accordion type="single" collapsible className={cn((title || body) && "mt-6")}>
            {items.map((it, i) => {
              const q = fieldByLocale(it.q_en, it.q_sl, locale) ?? "";
              const a = fieldByLocale(it.a_en, it.a_sl, locale) ?? "";
              if (!q) return null;
              return (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left font-medium">{q}</AccordionTrigger>
                  <AccordionContent className="leading-relaxed text-foreground/80 whitespace-pre-line">
                    {a}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </article>
      );
    }

    case "video": {
      const embed = toEmbedUrl(section.button_link ?? "");
      return (
        <article>
          {title && (
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h2>
          )}
          {body && (
            <p className="mt-3 text-pretty leading-relaxed text-foreground/85">{body}</p>
          )}
          {embed ? (
            <div className={cn("relative aspect-video w-full overflow-hidden rounded-3xl bg-black", (title || body) && "mt-6")}>
              <iframe
                src={embed.src}
                title={title || "Video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 size-full"
              />
            </div>
          ) : section.image_path ? (
            <SignedImage
              path={section.image_path}
              alt={title || ""}
              className={cn("aspect-video w-full rounded-3xl", (title || body) && "mt-6")}
            />
          ) : null}
        </article>
      );
    }

    case "alternating_content": {
      const items = section.items ?? [];
      return (
        <article className="space-y-12">
          {title && (
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h2>
          )}
          {items.map((it, i) => {
            const right = (it.variant ?? (i % 2 === 0 ? "left" : "right")) === "right";
            const rTitle = fieldByLocale(it.title_en, it.title_sl, locale) ?? "";
            const rBody = fieldByLocale(it.body_en, it.body_sl, locale) ?? "";
            return (
              <div key={i} className="grid items-center gap-8 md:grid-cols-2">
                {it.image_path && (
                  <SignedImage
                    path={it.image_path}
                    alt=""
                    className={cn("aspect-[4/3] w-full rounded-3xl", right && "md:order-2")}
                  />
                )}
                <div className={cn(right && "md:order-1")}>
                  {rTitle && (
                    <h3 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
                      {rTitle}
                    </h3>
                  )}
                  {rBody && (
                    <p className="mt-3 text-pretty leading-relaxed text-foreground/85 whitespace-pre-line">
                      {rBody}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </article>
      );
    }

    case "testimonial": {
      const items = section.items ?? [];
      return (
        <article>
          {title && (
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h2>
          )}
          <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", title && "mt-6")}>
            {items.map((it, i) => {
              const quote = fieldByLocale(it.quote_en, it.quote_sl, locale) ?? "";
              const role = fieldByLocale(it.role_en, it.role_sl, locale) ?? "";
              return (
                <figure
                  key={i}
                  className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6"
                >
                  <blockquote className="text-pretty leading-relaxed text-foreground/90">
                    “{quote}”
                  </blockquote>
                  <figcaption className="flex items-center gap-3 border-t border-border/60 pt-4">
                    {it.image_path && (
                      <SignedImage
                        path={it.image_path}
                        alt={it.name ?? ""}
                        className="size-10 rounded-full"
                      />
                    )}
                    <div className="text-sm">
                      {it.name && <p className="font-medium">{it.name}</p>}
                      {role && <p className="text-xs text-muted-foreground">{role}</p>}
                    </div>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </article>
      );
    }

    default:
      return null;
  }
}
