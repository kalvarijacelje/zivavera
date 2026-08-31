import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/SiteShell";
import { SignedImage } from "@/components/admin/SignedImage";
import { useI18n } from "@/i18n/I18nProvider";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — ŽIVA VERA" },
      {
        name: "description",
        content:
          "Espresso drinks, teas, hot chocolate and fresh juices — served by voluntary contribution. Coffee by Barcaffè.",
      },
      { property: "og:title", content: "Menu — ŽIVA VERA" },
      {
        property: "og:description",
        content: "Discover what we serve at ŽIVA VERA — no price list, just hospitality.",
      },
    ],
  }),
  component: MenuPage,
});

type Category = {
  id: string;
  name_en: string;
  name_sl: string;
  description_en: string | null;
  description_sl: string | null;
  sort_order: number;
};

type Item = {
  id: string;
  category_id: string | null;
  name_en: string;
  name_sl: string;
  description_en: string | null;
  description_sl: string | null;
  image_path: string | null;
  featured: boolean;
  available: boolean;
  sort_order: number;
};

function MenuPage() {
  const { t, locale } = useI18n();
  const [cats, setCats] = useState<Category[] | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [c, i] = await Promise.all([
        supabase
          .from("menu_categories")
          .select("id,name_en,name_sl,description_en,description_sl,sort_order")
          .eq("published", true)
          .order("sort_order")
          .order("name_en")
          .limit(50),
        supabase
          .from("menu_items")
          .select(
            "id,category_id,name_en,name_sl,description_en,description_sl,image_path,featured,available,sort_order",
          )
          .eq("published", true)
          .order("sort_order")
          .order("name_en")
          .limit(100),
      ]);
      if (!alive) return;
      setCats((c.data as Category[]) ?? []);
      setItems((i.data as Item[]) ?? []);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const pick = <T,>(en: T, sl: T) => (locale === "sl" ? sl : en);

  const populatedCats = (cats ?? []).filter((c) =>
    items.some((i) => i.category_id === c.id),
  );

  return (
    <SiteShell>
      {/* Full-width Ambient Hero Banner matching homepage */}
      <section className="relative isolate overflow-hidden min-h-[460px] sm:min-h-[520px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1920&q=80"
            alt=""
            width={1920}
            height={1280}
            className="size-full object-cover scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/65 to-background" />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl px-4 py-16 sm:px-6 md:py-24 w-full">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card/80 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary backdrop-blur-sm shadow-xs">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            {t("brand.partner")}
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.08] text-balance text-foreground sm:text-5xl md:text-6xl tracking-tight">
            {t("menu.title")}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-pretty font-normal text-muted-foreground sm:text-lg">
            {t("menu.intro")}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
        {cats === null ? (
          <p className="py-12 text-center text-sm text-muted-foreground">{t("menu.loading")}</p>
        ) : populatedCats.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center text-muted-foreground">
            {t("menu.empty")}
          </p>
        ) : (
          <div className="space-y-16">
            {populatedCats.map((cat) => {
              const catItems = items.filter((i) => i.category_id === cat.id);
              const description = pick(cat.description_en, cat.description_sl);
              return (
                <section key={cat.id}>
                  <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    {pick(cat.name_en, cat.name_sl)}
                  </h2>
                  {description && (
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  )}
                  <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {catItems.map((item) => {
                      const name = pick(item.name_en, item.name_sl);
                      const desc = pick(item.description_en, item.description_sl);
                      return (
                        <li
                          key={item.id}
                          className={cn(
                            "group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg",
                            !item.available && "opacity-70",
                          )}
                        >
                          <div className="relative aspect-[4/3] overflow-hidden">
                            <SignedImage
                              path={item.image_path}
                              alt={name ?? ""}
                              className="size-full transition-transform duration-500 group-hover:scale-105"
                            />
                            {item.featured && (
                              <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground">
                                <Sparkles className="size-3" /> {t("menu.featured")}
                              </span>
                            )}
                            {!item.available && (
                              <span className="absolute right-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                                {t("menu.unavailable")}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-1 flex-col p-5">
                            <h3 className="font-display text-lg font-semibold tracking-tight">
                              {name}
                            </h3>
                            {desc && (
                              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                                {desc}
                              </p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
        )}

        <div className="mt-16 max-w-3xl rounded-3xl border border-border bg-card/60 p-8 sm:p-10">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            {t("menu.offer_note.title")}
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            {t("menu.offer_note.body_1")}
          </p>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            {t("menu.offer_note.body_2")}
          </p>
        </div>
      </div>
    </SiteShell>
  );
}
