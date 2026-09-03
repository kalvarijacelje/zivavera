import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  DoorOpen,
  Moon,
  History,
  ChevronDown,
  Coffee,
  GlassWater,
  Users,
  StickyNote,
  Plus,
  Banknote,
  CreditCard,
  ExternalLink,
  Calendar,
  Clock,
  Sparkles,
  Save,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { LogVisitDialog } from "@/components/admin/LogVisitDialog";
import { useI18n } from "@/i18n/I18nProvider";
import {
  evaluateCafeStatus,
  DEFAULT_SCHEDULE,
  DAYS_ORDER,
  type WeeklySchedule,
  type DayKey,
  type CafeMode,
  type CafeStatusRecord,
} from "@/lib/cafe-schedule";

export const Route = createFileRoute("/admin/cafe-status")({
  component: CafeStatusAdmin,
});

type Status = CafeStatusRecord;

type SessionRow = {
  id: string;
  opened_at: string;
  closed_at: string | null;
  opened_by_email: string | null;
  closed_by_email: string | null;
  hot_drinks_served: number;
  cold_drinks_served: number;
  people_served: number;
  note: string | null;
};

function formatDuration(openedAt: string, closedAt: string | null) {
  const end = closedAt ? new Date(closedAt).getTime() : Date.now();
  const ms = Math.max(0, end - new Date(openedAt).getTime());
  const mins = Math.floor(ms / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfWeek(d: Date) {
  const x = startOfDay(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  return x;
}
function startOfMonth(d: Date) {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}

function CafeStatusAdmin() {
  const { session } = useSession();
  const { t, locale } = useI18n();
  const [status, setStatus] = useState<Status | null>(null);
  const [noteEn, setNoteEn] = useState("");
  const [noteSl, setNoteSl] = useState("");
  const [saving, setSaving] = useState(false);
  const [sessions, setSessions] = useState<SessionRow[]>([]);

  // Weekly Schedule in-app editor state
  const [schedule, setSchedule] = useState<WeeklySchedule>(DEFAULT_SCHEDULE);
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Active session edits
  const [hotDrinks, setHotDrinks] = useState<string>("0");
  const [coldDrinks, setColdDrinks] = useState<string>("0");
  const [people, setPeople] = useState<string>("0");
  const [sessionNote, setSessionNote] = useState<string>("");
  const [savingSession, setSavingSession] = useState(false);

  // New visit tracker state
  const [logVisitOpen, setLogVisitOpen] = useState(false);
  const [todayVisits, setTodayVisits] = useState<any[]>([]);

  const load = async () => {
    const todayStart = startOfDay(new Date()).toISOString();
    const [{ data: s }, { data: rows }, { data: vData }] = await Promise.all([
      supabase
        .from("cafe_status")
        .select("is_open,mode,schedule,override_until,note_en,note_sl,updated_at")
        .maybeSingle(),
      supabase
        .from("cafe_sessions")
        .select("id,opened_at,closed_at,opened_by_email,closed_by_email,hot_drinks_served,cold_drinks_served,people_served,note")
        .order("opened_at", { ascending: false })
        .limit(50),
      supabase
        .from("cafe_visits")
        .select("*")
        .gte("visited_at", todayStart)
        .order("visited_at", { ascending: false })
        .limit(50),
    ]);
    if (s) {
      setStatus(s as unknown as Status);
      setNoteEn(s.note_en ?? "");
      setNoteSl(s.note_sl ?? "");
      if (s.schedule && typeof s.schedule === "object") {
        setSchedule({ ...DEFAULT_SCHEDULE, ...s.schedule });
      }
    }
    if (rows) setSessions(rows as SessionRow[]);
    if (vData) setTodayVisits(vData);
  };

  useEffect(() => {
    load();
  }, []);

  const evaluated = useMemo(() => evaluateCafeStatus(status), [status]);
  const isOpen = evaluated.isOpen;

  const activeSession = useMemo(
    () => sessions.find((r) => r.closed_at === null) ?? null,
    [sessions],
  );

  useEffect(() => {
    if (activeSession) {
      setHotDrinks(String(activeSession.hot_drinks_served ?? 0));
      setColdDrinks(String(activeSession.cold_drinks_served ?? 0));
      setPeople(String(activeSession.people_served ?? 0));
      setSessionNote(activeSession.note ?? "");
    } else {
      setHotDrinks("0");
      setColdDrinks("0");
      setPeople("0");
      setSessionNote("");
    }
  }, [activeSession?.id]);

  const persistActiveSession = async (overrides?: Partial<Pick<SessionRow, "hot_drinks_served" | "cold_drinks_served" | "people_served" | "note">>) => {
    if (!activeSession) return;
    const payload = {
      hot_drinks_served: Math.max(0, parseInt(hotDrinks || "0", 10) || 0),
      cold_drinks_served: Math.max(0, parseInt(coldDrinks || "0", 10) || 0),
      people_served: Math.max(0, parseInt(people || "0", 10) || 0),
      note: sessionNote.trim() || null,
      ...overrides,
    };
    setSavingSession(true);
    const { error } = await supabase
      .from("cafe_sessions")
      .update(payload)
      .eq("id", activeSession.id);
    setSavingSession(false);
    if (error) return toast.error(error.message);
    toast.success(locale === "sl" ? "Izmena posodobljena" : "Session updated");
    load();
  };

  // Change automation mode & overrides
  const setMode = async (nextMode: CafeMode, overrideUntil?: string | null) => {
    if (!session) return;
    setSaving(true);

    const nextIsOpen = nextMode === "manual_open" ? true : nextMode === "manual_closed" ? false : evaluated.isOpen;

    if (!nextIsOpen && activeSession) {
      await persistActiveSession();
    }

    const { error } = await supabase
      .from("cafe_status")
      .upsert({
        id: true,
        mode: nextMode,
        is_open: nextIsOpen,
        override_until: overrideUntil ?? null,
        note_en: noteEn.trim() || null,
        note_sl: noteSl.trim() || null,
        updated_at: new Date().toISOString(),
        updated_by: session.user.id,
      });

    setSaving(false);
    if (error) return toast.error(error.message);

    if (nextMode === "auto") {
      toast.success(locale === "sl" ? "Preklopljeno na samodejni tedenski urnik" : "Resumed automatic weekly schedule");
    } else if (nextMode === "manual_open") {
      toast.success(locale === "sl" ? "Kavarna ročno odprta" : "Café forced OPEN");
    } else {
      toast.success(locale === "sl" ? "Kavarna ročno zaprta" : "Café forced CLOSED");
    }
    load();
  };

  // Force close for the rest of today (auto-resumes tomorrow morning at midnight)
  const handleCloseForToday = async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    await setMode("manual_closed", tomorrow.toISOString());
  };

  // Save modified weekly schedule
  const handleSaveSchedule = async () => {
    if (!session) return;
    setSavingSchedule(true);
    try {
      const { error } = await supabase
        .from("cafe_status")
        .upsert({
          id: true,
          schedule: schedule as any,
          updated_at: new Date().toISOString(),
          updated_by: session.user.id,
        });
      if (error) throw error;
      toast.success(locale === "sl" ? "Tedenski urnik uspešno shranjen!" : "Weekly schedule saved successfully!");
      load();
    } catch (err: any) {
      toast.error(err.message || (locale === "sl" ? "Napaka pri shranjevanju urnika" : "Failed to save schedule"));
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleDayChange = (key: DayKey, patch: Partial<WeeklySchedule[DayKey]>) => {
    setSchedule((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...patch,
      },
    }));
  };

  const saveNoteOnly = async () => {
    if (!session || !status) return;
    setSaving(true);
    const { error } = await supabase
      .from("cafe_status")
      .upsert({
        id: true,
        is_open: status.is_open,
        note_en: noteEn.trim() || null,
        note_sl: noteSl.trim() || null,
        updated_at: new Date().toISOString(),
        updated_by: session.user.id,
      });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(locale === "sl" ? "Javno obvestilo posodobljeno" : "Public note updated");
  };

  const now = new Date();
  const dayStart = startOfDay(now).getTime();
  const weekStart = startOfWeek(now).getTime();
  const monthStart = startOfMonth(now).getTime();

  const closed = sessions.filter((r) => r.closed_at !== null);
  const today = closed.filter((r) => new Date(r.opened_at).getTime() >= dayStart);
  const thisWeek = closed.filter(
    (r) =>
      new Date(r.opened_at).getTime() >= weekStart &&
      new Date(r.opened_at).getTime() < dayStart,
  );
  const thisMonth = closed.filter(
    (r) =>
      new Date(r.opened_at).getTime() >= monthStart &&
      new Date(r.opened_at).getTime() < weekStart,
  );
  const older = closed.filter((r) => new Date(r.opened_at).getTime() < monthStart);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-semibold">{t("admin.cafe.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("admin.cafe.subtitle")}
        </p>
      </header>

      {/* 1. Current status & Automation Mode Switcher */}
      <Card className="p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex size-14 items-center justify-center rounded-2xl",
                  isOpen ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-100 text-amber-700",
                )}
              >
                {isOpen ? <DoorOpen className="size-7" /> : <Moon className="size-7" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {t("admin.cafe.currentStatus")}
                  </span>
                  {evaluated.mode === "auto" ? (
                    <Badge variant="outline" className="border-blue-500/30 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-[10px] font-semibold">
                      <Clock className="mr-1 size-3" /> {t("admin.cafe.mode.auto")}
                    </Badge>
                  ) : evaluated.mode === "manual_open" ? (
                    <Badge variant="outline" className="border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-semibold">
                      <Sparkles className="mr-1 size-3" /> {t("admin.cafe.mode.forceOpen")}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-[10px] font-semibold">
                      <AlertCircle className="mr-1 size-3" /> {t("admin.cafe.mode.forceClosed")}
                    </Badge>
                  )}
                </div>

                <div className="font-display text-2xl font-semibold">{isOpen ? t("admin.cafe.open") : t("admin.cafe.closed")}</div>

                <div className="text-xs text-muted-foreground mt-0.5">
                  {locale === "sl" ? evaluated.statusTextSl : evaluated.statusTextEn}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {evaluated.isOverride && (
                <Button
                  variant="outline"
                  onClick={() => setMode("auto")}
                  disabled={saving}
                  className="border-primary/40 font-medium"
                >
                  <RotateCcw className="mr-1.5 size-3.5" /> {t("admin.cafe.revertAuto")}
                </Button>
              )}

              <Button
                variant={evaluated.mode === "manual_open" ? "default" : "outline"}
                onClick={() => setMode("manual_open")}
                disabled={saving}
                className={cn(evaluated.mode === "manual_open" && "ring-2 ring-emerald-500/40")}
              >
                {t("admin.cafe.mode.forceOpen")}
              </Button>

              <Button
                variant={evaluated.mode === "manual_closed" ? "default" : "outline"}
                onClick={() => setMode("manual_closed")}
                disabled={saving}
                className={cn(evaluated.mode === "manual_closed" && "ring-2 ring-amber-500/40")}
              >
                {t("admin.cafe.mode.forceClosed")}
              </Button>

              {isOpen && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCloseForToday}
                  disabled={saving}
                  className="text-xs"
                  title="Close for today and automatically resume schedule tomorrow morning"
                >
                  {t("admin.cafe.forceCloseToday")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* 2. In-App Weekly Operating Hours Editor */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
          <div>
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <Calendar className="size-5 text-primary" /> {t("admin.cafe.scheduleTitle")}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("admin.cafe.scheduleSubtitle")}
            </p>
          </div>
          <Button
            onClick={handleSaveSchedule}
            disabled={savingSchedule}
            className="font-semibold shadow-xs self-start sm:self-center"
          >
            <Save className="mr-1.5 size-4" /> {savingSchedule ? (locale === "sl" ? "Shranjevanje…" : "Saving…") : t("admin.cafe.saveSchedule")}
          </Button>
        </div>

        <div className="divide-y divide-border/60 pt-2">
          {DAYS_ORDER.map((day) => {
            const item = schedule[day.key] || { enabled: false, open: "08:00", close: "14:00" };
            return (
              <div
                key={day.key}
                className={cn(
                  "py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors",
                  !item.enabled && "opacity-60"
                )}
              >
                <div className="flex items-center gap-3 min-w-[140px]">
                  <Switch
                    id={`switch-${day.key}`}
                    checked={item.enabled}
                    onCheckedChange={(checked) => handleDayChange(day.key, { enabled: checked })}
                  />
                  <Label htmlFor={`switch-${day.key}`} className="font-medium cursor-pointer flex items-center gap-1.5 flex-wrap">
                    <span>{locale === "sl" ? day.nameSl : day.nameEn}</span>
                    {(locale === "sl" ? day.noteSl : day.noteEn) && (
                      <span className="text-xs font-normal text-muted-foreground">
                        {locale === "sl" ? day.noteSl : day.noteEn}
                      </span>
                    )}
                  </Label>
                </div>

                {item.enabled ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">{t("admin.cafe.openTime")}:</span>
                      <Input
                        type="time"
                        value={item.open}
                        onChange={(e) => handleDayChange(day.key, { open: e.target.value })}
                        className="w-28 h-8 text-xs font-semibold"
                      />
                    </div>
                    <span className="text-muted-foreground">—</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">{t("admin.cafe.closeTime")}:</span>
                      <Input
                        type="time"
                        value={item.close}
                        onChange={(e) => handleDayChange(day.key, { close: e.target.value })}
                        className="w-28 h-8 text-xs font-semibold"
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic">
                    {t("admin.cafe.dayClosed")}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 3. Visitors & Order Tracker */}
      <Card className="p-6 border-primary/20 bg-primary/[0.02] shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="size-4" />
              </span>
              <h2 className="font-display text-lg font-semibold">{t("admin.cafe.trackerTitle")}</h2>
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
                Live
              </span>
            </div>
            <p className="text-xs text-muted-foreground max-w-xl">
              {t("admin.cafe.trackerSubtitle")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => setLogVisitOpen(true)} className="font-semibold shadow-xs">
              <Plus className="mr-1.5 size-4" /> {t("admin.dash.logVisit")}
            </Button>
            <Link to="/admin/customers">
              <Button variant="outline" className="text-xs">
                {t("admin.cafe.allCustomersHistory")} <ExternalLink className="ml-1.5 size-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Today's visits quick feed if any */}
        {todayVisits.length > 0 && (
          <div className="mt-5 pt-4 border-t border-border">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>{t("admin.cafe.todaysVisits")} ({todayVisits.length})</span>
              <span className="text-foreground font-medium">
                €{todayVisits.reduce((acc, v) => acc + (v.donation_given ? Number(v.donation_amount || 0) : 0), 0).toFixed(2)} {t("admin.cafe.contributionsRecorded")}
              </span>
            </div>
            <div className="divide-y divide-border/60 max-h-48 overflow-y-auto">
              {todayVisits.map((v) => (
                <div key={v.id} className="py-2 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium text-foreground truncate">{v.guest_name}</span>
                    <span className="text-muted-foreground shrink-0">
                      {new Date(v.visited_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {v.items && v.items.length > 0 && (
                      <span className="text-muted-foreground truncate hidden sm:inline">
                        · {v.items.map((it: any) => `${it.quantity > 1 ? `${it.quantity}x ` : ""}${it.name}`).join(", ")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {v.donation_given && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "px-2 py-0.5 text-[11px] font-semibold flex items-center gap-1",
                          v.payment_method === "card"
                            ? "border-blue-500/40 bg-blue-50 text-blue-700 dark:bg-blue-950/30"
                            : "border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30"
                        )}
                      >
                        {v.payment_method === "card" ? <CreditCard className="size-3" /> : <Banknote className="size-3" />}
                        {v.donation_amount ? `€${Number(v.donation_amount).toFixed(2)}` : (locale === "sl" ? "Prispevek" : "Donation")}
                        {" "}({v.payment_method === "card" ? (locale === "sl" ? "Kartica" : "Card") : (locale === "sl" ? "Gotovina" : "Cash")})
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* 4. Active session tracking */}
      {isOpen && activeSession && (
        <Card className="space-y-5 p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 className="font-display text-lg font-semibold">{t("admin.cafe.currentSession")}</h2>
              <p className="text-sm text-muted-foreground">
                {locale === "sl" ? "Začeto" : "Started"} {new Date(activeSession.opened_at).toLocaleString(locale === "sl" ? "sl-SI" : "en-US")} · {formatDuration(activeSession.opened_at, null)}
              </p>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-700">LIVE</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="hotDrinks" className="flex items-center gap-1.5">
                <Coffee className="size-3.5" /> {t("admin.cafe.hotDrinks")}
              </Label>
              <Input
                id="hotDrinks"
                type="number"
                inputMode="numeric"
                min={0}
                value={hotDrinks}
                onChange={(e) => setHotDrinks(e.target.value)}
                onFocus={(e) => e.target.select()}
              />
              <p className="mt-1 text-xs text-muted-foreground">{locale === "sl" ? "Kava, čaj, topli napitki" : "Coffee, tea, other hot drinks"}</p>
            </div>
            <div>
              <Label htmlFor="coldDrinks" className="flex items-center gap-1.5">
                <GlassWater className="size-3.5" /> {t("admin.cafe.coldDrinks")}
              </Label>
              <Input
                id="coldDrinks"
                type="number"
                inputMode="numeric"
                min={0}
                value={coldDrinks}
                onChange={(e) => setColdDrinks(e.target.value)}
                onFocus={(e) => e.target.select()}
              />
              <p className="mt-1 text-xs text-muted-foreground">{locale === "sl" ? "Sokovi, brezalkoholne pijače" : "Juices, soft drinks, other cold drinks"}</p>
            </div>
            <div>
              <Label htmlFor="people" className="flex items-center gap-1.5">
                <Users className="size-3.5" /> {t("admin.cafe.peopleServed")}
              </Label>
              <Input
                id="people"
                type="number"
                inputMode="numeric"
                min={0}
                value={people}
                onChange={(e) => setPeople(e.target.value)}
                onFocus={(e) => e.target.select()}
              />
            </div>
            <div>
              <Label htmlFor="sessionNote" className="flex items-center gap-1.5">
                <StickyNote className="size-3.5" /> {t("admin.cafe.internalNote")}
              </Label>
              <Textarea
                id="sessionNote"
                rows={2}
                value={sessionNote}
                onChange={(e) => setSessionNote(e.target.value)}
                placeholder={locale === "sl" ? "Vse, kar si je vredno zapomniti o tej izmeni…" : "Anything worth remembering about this shift…"}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => persistActiveSession()} disabled={savingSession}>
              {t("admin.cafe.saveSession")}
            </Button>
            <span className="self-center text-xs text-muted-foreground">
              {locale === "sl" ? "Vrednosti se shranijo in zaključijo, ko kavarno označite kot ZAPRTO." : "Values are saved with this session and finalized when you mark the café CLOSED."}
            </span>
          </div>
        </Card>
      )}

      {/* 5. Public note */}
      <Card className="space-y-4 p-6">
        <div>
          <h2 className="font-display text-lg font-semibold">{t("admin.cafe.publicNoteTitle")}</h2>
          <p className="text-sm text-muted-foreground">
            {locale === "sl" ? "Kratko sporočilo pod javnim statusom. Pustite prazno za skrivanje." : "Short message shown under the public status. Leave blank to hide."}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="note_en">English</Label>
            <Textarea id="note_en" value={noteEn} onChange={(e) => setNoteEn(e.target.value)} rows={3} maxLength={240} placeholder="e.g. Back after lunch around 14:00." />
          </div>
          <div>
            <Label htmlFor="note_sl">Slovenščina</Label>
            <Textarea id="note_sl" value={noteSl} onChange={(e) => setNoteSl(e.target.value)} rows={3} maxLength={240} placeholder="npr. Vrnemo se po kosilu okoli 14:00." />
          </div>
        </div>
        <div>
          <Button variant="secondary" onClick={saveNoteOnly} disabled={saving}>{t("admin.cafe.saveNote")}</Button>
        </div>
      </Card>

      {/* 6. History grouped */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <History className="size-4 text-muted-foreground" />
          <h2 className="font-display text-lg font-semibold">{t("admin.cafe.sessionHistory")}</h2>
          <span className="text-xs text-muted-foreground">({locale === "sl" ? "samo interno" : "internal only"})</span>
        </div>

        <SessionGroup title={locale === "sl" ? "Danes" : "Today"} rows={today} defaultOpen total locale={locale} />
        <SessionGroup title={locale === "sl" ? "Ta teden" : "This week"} rows={thisWeek} defaultOpen total locale={locale} />
        <SessionGroup title={locale === "sl" ? "Ta mesec" : "This month"} rows={thisMonth} defaultOpen={false} total locale={locale} />
        <SessionGroup title={locale === "sl" ? "Pretekli zapisi" : "Past records"} rows={older} defaultOpen={false} total locale={locale} />
      </Card>

      <LogVisitDialog
        open={logVisitOpen}
        onOpenChange={setLogVisitOpen}
        onSaved={load}
      />
    </div>
  );
}

function SessionGroup({
  title,
  rows,
  defaultOpen,
  total,
  locale = "sl",
}: {
  title: string;
  rows: SessionRow[];
  defaultOpen: boolean;
  total?: boolean;
  locale?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const hotSum = rows.reduce((a, r) => a + (r.hot_drinks_served || 0), 0);
  const coldSum = rows.reduce((a, r) => a + (r.cold_drinks_served || 0), 0);
  const peopleSum = rows.reduce((a, r) => a + (r.people_served || 0), 0);

  const formatSessionCount = (cnt: number) => {
    if (locale === "sl") {
      if (cnt === 1) return "1 izmena";
      if (cnt === 2) return "2 izmeni";
      if (cnt === 3 || cnt === 4) return `${cnt} izmene`;
      return `${cnt} izmen`;
    }
    return `${cnt} session${cnt === 1 ? "" : "s"}`;
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border-t border-border first:border-t-0">
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 py-3 text-left">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-sm font-semibold uppercase tracking-[0.14em]">{title}</span>
          <span className="text-xs text-muted-foreground">
            {formatSessionCount(rows.length)}
            {total && rows.length > 0 && ` · ${hotSum} ${locale === "sl" ? "toplih" : "hot"} · ${coldSum} ${locale === "sl" ? "hladnih" : "cold"} · ${peopleSum} ${locale === "sl" ? "oseb" : "people"}`}
          </span>
        </div>
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        {rows.length === 0 ? (
          <p className="pb-4 text-sm text-muted-foreground">
            {locale === "sl" ? "V tem obdobju ni bilo izmen." : "No sessions in this period."}
          </p>
        ) : (
          <ul className="divide-y divide-border pb-2">
            {rows.map((r) => (
              <li key={r.id} className="grid gap-1 py-3 text-sm sm:grid-cols-[1fr_auto]">
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-medium">
                      {new Date(r.opened_at).toLocaleDateString(locale === "sl" ? "sl-SI" : "en-US")} · {new Date(r.opened_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {r.closed_at && ` → ${new Date(r.closed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatDuration(r.opened_at, r.closed_at)}</span>
                  </div>
                  {(r.opened_by_email || r.closed_by_email) && (
                    <div className="text-xs text-muted-foreground">
                      {r.opened_by_email && <>{locale === "sl" ? "odprl" : "opened by"} {r.opened_by_email}</>}
                      {r.closed_by_email && r.closed_by_email !== r.opened_by_email && <> · {locale === "sl" ? "zaprla" : "closed by"} {r.closed_by_email}</>}
                    </div>
                  )}
                  {r.note && <p className="text-xs italic text-muted-foreground">{r.note}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5" title={locale === "sl" ? "Topli napitki" : "Hot drinks"}>
                    <Coffee className="size-3.5" /> {r.hot_drinks_served}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5" title={locale === "sl" ? "Hladni napitki" : "Cold drinks"}>
                    <GlassWater className="size-3.5" /> {r.cold_drinks_served}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5" title={locale === "sl" ? "Osebe" : "People"}>
                    <Users className="size-3.5" /> {r.people_served}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
