import { useEffect, useState } from "react";
import { DoorOpen, Moon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

type Status = {
  is_open: boolean;
  note_en: string | null;
  note_sl: string | null;
};

export function CafeStatusBanner() {
  const { t, locale } = useI18n();
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      supabase
        .from("cafe_status")
        .select("is_open,note_en,note_sl")
        .maybeSingle()
        .then(({ data }) => {
          if (alive && data) setStatus(data as Status);
        });
    load();
    const channel = supabase
      .channel("cafe_status_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cafe_status" },
        () => load(),
      )
      .subscribe();
    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, []);

  if (!status) return null;
  const isOpen = status.is_open;
  const note = locale === "sl" ? status.note_sl ?? status.note_en : status.note_en ?? status.note_sl;
  const key = isOpen ? "open" : "closed";
  const Icon = isOpen ? DoorOpen : Moon;

  // Shared warm neutral base; accent hue swaps per state.
  const accent = isOpen
    ? {
        rgb: "74,222,128", // emerald
        rgbDeep: "16,185,129",
        text: "text-emerald-300",
        iconBg: "bg-emerald-400/10 text-emerald-300",
        noteBorder: "border-emerald-400/25",
        noteBg: "bg-emerald-400/[0.04]",
        divider: "border-emerald-400/15",
      }
    : {
        rgb: "234,128,90", // warm ember / terracotta
        rgbDeep: "200,90,60",
        text: "text-[oklch(0.72_0.14_42)]",
        iconBg: "bg-[oklch(0.72_0.14_42)]/10 text-[oklch(0.72_0.14_42)]",
        noteBorder: "border-[oklch(0.72_0.14_42)]/25",
        noteBg: "bg-[oklch(0.72_0.14_42)]/[0.04]",
        divider: "border-[oklch(0.72_0.14_42)]/15",
      };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-10 sm:px-6 sm:pb-14">
      <div
        className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-5 text-foreground sm:p-7"
        style={{
          boxShadow: `0 1px 2px oklch(0.30 0.05 50 / 0.06), 0 10px 28px -14px oklch(0.30 0.05 50 / 0.18), 0 0 0 1px rgba(${accent.rgb},0.10), 0 0 22px -6px rgba(${accent.rgb},0.22)`,
        }}
      >
        {/* Soft accent lighting wash — never a flat color block */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background: `radial-gradient(120% 80% at 0% 0%, rgba(${accent.rgb},0.14), transparent 55%), radial-gradient(120% 80% at 100% 100%, rgba(${accent.rgbDeep},0.10), transparent 60%)`,
          }}
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex size-14 shrink-0 items-center justify-center rounded-2xl",
                accent.iconBg,
              )}
              style={{
                boxShadow: `0 0 18px rgba(${accent.rgb},0.55), inset 0 0 12px rgba(${accent.rgb},0.30)`,
              }}
            >
              <Icon className="size-7" strokeWidth={2.25} />
            </div>
            <div>
              <div
                className={cn(
                  "font-display text-3xl font-bold uppercase tracking-[0.18em] sm:text-4xl",
                  accent.text,
                )}
                style={{
                  textShadow: `0 0 8px rgba(${accent.rgb},0.85), 0 0 18px rgba(${accent.rgb},0.55), 0 0 36px rgba(${accent.rgbDeep},0.45)`,
                }}
              >
                {t(`status.${key}.label`)}
              </div>
              <p className="mt-1 text-sm font-medium text-foreground/85 sm:text-base">
                {t(`status.${key}.line1`)}
              </p>
            </div>
          </div>
          <div
            className={cn(
              "flex-1 space-y-0.5 text-sm text-muted-foreground sm:border-l sm:pl-6",
              accent.divider,
            )}
          >
            <p>{t(`status.${key}.line2`)}</p>
            <p>{t(`status.${key}.line3`)}</p>
            {note && (
              <p
                className={cn(
                  "mt-3 rounded-xl border px-3 py-2 text-sm italic text-foreground/85",
                  accent.noteBorder,
                  accent.noteBg,
                )}
              >
                {note}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
