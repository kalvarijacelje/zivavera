import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Clock, ArrowRight, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { evaluateCafeStatus, type CafeStatusRecord } from "@/lib/cafe-schedule";

export function CafeStatusBanner() {
  const { t, locale } = useI18n();
  const [status, setStatus] = useState<CafeStatusRecord | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = () =>
      supabase
        .from("cafe_status")
        .select("is_open,mode,schedule,override_until,note_en,note_sl")
        .maybeSingle()
        .then(({ data }) => {
          if (alive && data) setStatus(data as unknown as CafeStatusRecord);
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

    // Minute timer to re-evaluate schedule in case time rolls over 08:00 or 14:00
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 60000);

    return () => {
      alive = false;
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  if (!status) return null;

  const evaluated = evaluateCafeStatus(status);
  const isOpen = evaluated.isOpen;
  const note = locale === "sl" ? status.note_sl ?? status.note_en : status.note_en ?? status.note_sl;
  const scheduleInfo = locale === "sl" ? evaluated.statusTextSl : evaluated.statusTextEn;

  // Luminous accent hues matching the iconic café ambiance
  const accent = isOpen
    ? {
        rgb: "74, 222, 128", // emerald
        rgbDeep: "16, 185, 129",
        text: "text-emerald-400 dark:text-emerald-300",
        pillBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
        pillBorder: "border-emerald-500/35",
      }
    : {
        rgb: "234, 128, 90", // warm ember / terracotta
        rgbDeep: "200, 90, 60",
        text: "text-[#ea805a] dark:text-[#f09575]",
        pillBg: "bg-[#ea805a]/10 dark:bg-[#ea805a]/15",
        pillBorder: "border-[#ea805a]/35",
      };

  return (
    <div className="w-full">
      <div
        className={cn(
          "relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-2xl border px-4 py-3 sm:px-5 sm:py-3.5 backdrop-blur-md transition-all shadow-md",
          isOpen
            ? "border-emerald-500/30 bg-card/90 dark:bg-card/75 shadow-emerald-500/5 ring-1 ring-emerald-500/20"
            : "border-border/85 bg-card/90 dark:bg-card/75 shadow-black/5"
        )}
      >
        {/* Ambient backlight wash behind the status word */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-72 rounded-2xl opacity-45 transition-opacity"
          style={{
            background: `radial-gradient(circle at 18% 50%, rgba(${accent.rgb}, 0.22), transparent 75%)`,
          }}
        />

        {/* Left: Glowing Status Word & Schedule text */}
        <div className="relative z-10 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          {/* Glowing Status Pill */}
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-2.5 py-1 transition-all",
              accent.pillBorder,
              accent.pillBg,
            )}
            style={{
              boxShadow: `0 0 16px -2px rgba(${accent.rgb}, 0.30), inset 0 0 8px rgba(${accent.rgb}, 0.15)`,
            }}
          >
            <span className="relative flex size-2">
              <span
                className={cn(
                  "absolute inline-flex size-full rounded-full opacity-75",
                  isOpen ? "animate-ping bg-emerald-400" : "bg-[#ea805a]"
                )}
              />
              <span
                className={cn(
                  "relative inline-flex size-2 rounded-full",
                  isOpen ? "bg-emerald-500" : "bg-[#ea805a]"
                )}
              />
            </span>

            {/* Neon / Luminous Text with multi-layered glow */}
            <span
              className={cn(
                "font-display text-sm sm:text-base font-bold uppercase tracking-[0.18em]",
                accent.text,
              )}
              style={{
                textShadow: `0 0 8px rgba(${accent.rgb}, 0.85), 0 0 18px rgba(${accent.rgb}, 0.55), 0 0 30px rgba(${accent.rgbDeep}, 0.35)`,
              }}
            >
              {isOpen ? (locale === "sl" ? "ODPRTO" : "OPEN") : (locale === "sl" ? "ZAPRTO" : "CLOSED")}
            </span>
          </div>

          <span className="text-muted-foreground/50 hidden sm:inline">·</span>

          {scheduleInfo && (
            <span className="text-xs sm:text-sm font-medium text-foreground/90 flex items-center gap-1.5">
              <Clock className="size-3.5 text-muted-foreground" />
              {scheduleInfo}
            </span>
          )}

          {/* Optional Staff Note */}
          {note && (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-xs text-foreground/80 italic">
              <MessageSquare className="size-3 text-muted-foreground shrink-0 not-italic" />
              <span className="line-clamp-1">{note}</span>
            </span>
          )}
        </div>

        {/* Right: Quick link to /visit */}
        <div className="relative z-10 flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-border/50">
          <Link
            to="/visit"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors group"
          >
            <span>{locale === "sl" ? "Urnik in lokacija" : "Hours & Location"}</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
