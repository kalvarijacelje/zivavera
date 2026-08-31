import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DoorOpen, Moon, History, ChevronDown, Coffee, GlassWater, Users, StickyNote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/cafe-status")({
  component: CafeStatusAdmin,
});

type Status = {
  is_open: boolean;
  note_en: string | null;
  note_sl: string | null;
  updated_at: string;
};

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
  // Monday as start of week
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
  const [status, setStatus] = useState<Status | null>(null);
  const [noteEn, setNoteEn] = useState("");
  const [noteSl, setNoteSl] = useState("");
  const [saving, setSaving] = useState(false);
  const [sessions, setSessions] = useState<SessionRow[]>([]);

  // Active session edits
  const [hotDrinks, setHotDrinks] = useState<string>("0");
  const [coldDrinks, setColdDrinks] = useState<string>("0");
  const [people, setPeople] = useState<string>("0");
  const [sessionNote, setSessionNote] = useState<string>("");
  const [savingSession, setSavingSession] = useState(false);

  const load = async () => {
    const [{ data: s }, { data: rows }] = await Promise.all([
      supabase
        .from("cafe_status")
        .select("is_open,note_en,note_sl,updated_at")
        .maybeSingle(),
      supabase
        .from("cafe_sessions")
        .select("id,opened_at,closed_at,opened_by_email,closed_by_email,hot_drinks_served,cold_drinks_served,people_served,note")
        .order("opened_at", { ascending: false })
        .limit(50),
    ]);
    if (s) {
      setStatus(s as Status);
      setNoteEn(s.note_en ?? "");
      setNoteSl(s.note_sl ?? "");
    }
    if (rows) setSessions(rows as SessionRow[]);
  };

  useEffect(() => {
    load();
  }, []);

  const activeSession = useMemo(
    () => sessions.find((r) => r.closed_at === null) ?? null,
    [sessions],
  );

  // Hydrate active-session inputs whenever the active session changes
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
    toast.success("Session updated");
    load();
  };

  const setStatusOpen = async (nextOpen: boolean) => {
    if (!session) return;
    // If closing, save current session values first so they land in the same row.
    if (!nextOpen && activeSession) {
      await persistActiveSession();
    }
    setSaving(true);
    const { error } = await supabase
      .from("cafe_status")
      .upsert({
        id: true,
        is_open: nextOpen,
        note_en: noteEn.trim() || null,
        note_sl: noteSl.trim() || null,
        updated_at: new Date().toISOString(),
        updated_by: session.user.id,
      });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(nextOpen ? "Café marked OPEN — session started" : "Café marked CLOSED — session finalized");
    load();
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
    toast.success("Public note updated");
  };

  const isOpen = status?.is_open ?? false;

  // Group closed sessions by Today / Week / Month / Older
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
        <h1 className="font-display text-2xl font-semibold">Café status</h1>
        <p className="text-sm text-muted-foreground">
          Mark the café open or closed and track each session's drinks, people and notes.
        </p>
      </header>

      {/* Current status */}
      <Card className="p-6">
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
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current status</div>
              <div className="font-display text-2xl font-semibold">{isOpen ? "OPEN" : "CLOSED"}</div>
              {status?.updated_at && (
                <div className="text-xs text-muted-foreground">
                  Updated {new Date(status.updated_at).toLocaleString()}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setStatusOpen(true)} disabled={saving} className={cn(isOpen && "ring-2 ring-emerald-500/40")}>
              Mark OPEN
            </Button>
            <Button variant="outline" onClick={() => setStatusOpen(false)} disabled={saving} className={cn(!isOpen && "ring-2 ring-amber-500/40")}>
              Mark CLOSED
            </Button>
          </div>
        </div>
      </Card>

      {/* Active session tracking */}
      {isOpen && activeSession && (
        <Card className="space-y-5 p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 className="font-display text-lg font-semibold">Current session</h2>
              <p className="text-sm text-muted-foreground">
                Started {new Date(activeSession.opened_at).toLocaleString()} · running {formatDuration(activeSession.opened_at, null)}
              </p>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-700">LIVE</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="hotDrinks" className="flex items-center gap-1.5">
                <Coffee className="size-3.5" /> Hot drinks served
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
              <p className="mt-1 text-xs text-muted-foreground">Coffee, tea, other hot drinks</p>
            </div>
            <div>
              <Label htmlFor="coldDrinks" className="flex items-center gap-1.5">
                <GlassWater className="size-3.5" /> Cold drinks served
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
              <p className="mt-1 text-xs text-muted-foreground">Juices, soft drinks, other cold drinks</p>
            </div>
            <div>
              <Label htmlFor="people" className="flex items-center gap-1.5">
                <Users className="size-3.5" /> People served
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
                <StickyNote className="size-3.5" /> Internal note
              </Label>
              <Textarea
                id="sessionNote"
                rows={2}
                value={sessionNote}
                onChange={(e) => setSessionNote(e.target.value)}
                placeholder="Anything worth remembering about this shift…"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => persistActiveSession()} disabled={savingSession}>
              Save session
            </Button>
            <span className="self-center text-xs text-muted-foreground">
              Values are saved with this session and finalized when you mark the café CLOSED.
            </span>
          </div>
        </Card>
      )}

      {/* Public note */}
      <Card className="space-y-4 p-6">
        <div>
          <h2 className="font-display text-lg font-semibold">Optional public note</h2>
          <p className="text-sm text-muted-foreground">Short message shown under the public status. Leave blank to hide.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="note_en">English</Label>
            <Textarea id="note_en" value={noteEn} onChange={(e) => setNoteEn(e.target.value)} rows={3} maxLength={240} placeholder="e.g. Back after lunch around 14:00." />
          </div>
          <div>
            <Label htmlFor="note_sl">Slovene</Label>
            <Textarea id="note_sl" value={noteSl} onChange={(e) => setNoteSl(e.target.value)} rows={3} maxLength={240} placeholder="npr. Vrnemo se po kosilu okoli 14:00." />
          </div>
        </div>
        <div>
          <Button variant="secondary" onClick={saveNoteOnly} disabled={saving}>Save note</Button>
        </div>
      </Card>

      {/* History grouped */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <History className="size-4 text-muted-foreground" />
          <h2 className="font-display text-lg font-semibold">Session history</h2>
          <span className="text-xs text-muted-foreground">(internal only)</span>
        </div>

        <SessionGroup title="Today" rows={today} defaultOpen total />
        <SessionGroup title="This week" rows={thisWeek} defaultOpen total />
        <SessionGroup title="This month" rows={thisMonth} defaultOpen={false} total />
        <SessionGroup title="Past records" rows={older} defaultOpen={false} total />
      </Card>
    </div>
  );
}

function SessionGroup({
  title,
  rows,
  defaultOpen,
  total,
}: {
  title: string;
  rows: SessionRow[];
  defaultOpen: boolean;
  total?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const hotSum = rows.reduce((a, r) => a + (r.hot_drinks_served || 0), 0);
  const coldSum = rows.reduce((a, r) => a + (r.cold_drinks_served || 0), 0);
  const peopleSum = rows.reduce((a, r) => a + (r.people_served || 0), 0);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border-t border-border first:border-t-0">
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 py-3 text-left">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-sm font-semibold uppercase tracking-[0.14em]">{title}</span>
          <span className="text-xs text-muted-foreground">
            {rows.length} session{rows.length === 1 ? "" : "s"}
            {total && rows.length > 0 && ` · ${hotSum} hot · ${coldSum} cold · ${peopleSum} people`}
          </span>
        </div>
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        {rows.length === 0 ? (
          <p className="pb-4 text-sm text-muted-foreground">No sessions in this period.</p>
        ) : (
          <ul className="divide-y divide-border pb-2">
            {rows.map((r) => (
              <li key={r.id} className="grid gap-1 py-3 text-sm sm:grid-cols-[1fr_auto]">
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-medium">
                      {new Date(r.opened_at).toLocaleDateString()} · {new Date(r.opened_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {r.closed_at && ` → ${new Date(r.closed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatDuration(r.opened_at, r.closed_at)}</span>
                  </div>
                  {(r.opened_by_email || r.closed_by_email) && (
                    <div className="text-xs text-muted-foreground">
                      {r.opened_by_email && <>opened by {r.opened_by_email}</>}
                      {r.closed_by_email && r.closed_by_email !== r.opened_by_email && <> · closed by {r.closed_by_email}</>}
                    </div>
                  )}
                  {r.note && <p className="text-xs italic text-muted-foreground">{r.note}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5" title="Hot drinks">
                    <Coffee className="size-3.5" /> {r.hot_drinks_served}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5" title="Cold drinks">
                    <GlassWater className="size-3.5" /> {r.cold_drinks_served}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5" title="People">
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
