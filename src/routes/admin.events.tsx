import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Plus, ArrowUp, ArrowDown, Repeat, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ImageField } from "@/components/admin/ImageField";
import { SignedImage } from "@/components/admin/SignedImage";
import { deleteMedia } from "@/lib/admin/storage";
import { getEffectiveEventDate, formatRecurrenceLabel, parseDateYMD, type RecurrenceInterval } from "@/lib/events";

export const Route = createFileRoute("/admin/events")({
  component: EventsPage,
});

type Cat = { id: string; name_en: string };
type Ev = {
  id: string;
  category_id: string | null;
  title_en: string;
  title_sl: string;
  description_en: string | null;
  description_sl: string | null;
  event_date: string;
  event_time: string | null;
  location_or_note_en: string | null;
  location_or_note_sl: string | null;
  image_path: string | null;
  image_alignment: "left" | "right";
  featured: boolean;
  sort_order: number;
  published: boolean;
  is_recurring: boolean;
  recurrence_interval: RecurrenceInterval;
};

const today = () => new Date().toISOString().slice(0, 10);
const empty: Omit<Ev, "id"> = {
  category_id: null,
  title_en: "",
  title_sl: "",
  description_en: "",
  description_sl: "",
  event_date: today(),
  event_time: null,
  location_or_note_en: "",
  location_or_note_sl: "",
  image_path: null,
  image_alignment: "left",
  featured: false,
  sort_order: 0,
  published: true,
  is_recurring: false,
  recurrence_interval: "weekly",
};

function EventsPage() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [rows, setRows] = useState<Ev[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Ev | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteRow, setDeleteRow] = useState<Ev | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [cRes, eRes] = await Promise.all([
      supabase.from("event_categories").select("id, name_en").order("sort_order").limit(100),
      supabase
        .from("events")
        .select("*")
        .order("sort_order")
        .order("event_date")
        .limit(150),
    ]);
    if (cRes.error) toast.error(cRes.error.message);
    if (eRes.error) toast.error(eRes.error.message);
    setCats((cRes.data as Cat[]) ?? []);

    const rawRows = (eRes.data as any[]) ?? [];
    const normalized: Ev[] = rawRows.map((r) => {
      // Default to recurring if explicitly marked or if youth gathering
      const isYouth =
        r.title_en?.toLowerCase().includes("youth") ||
        r.title_sl?.toLowerCase().includes("mlade");
      const isRec =
        r.is_recurring !== undefined && r.is_recurring !== null
          ? Boolean(r.is_recurring)
          : isYouth;

      return {
        ...r,
        is_recurring: isRec,
        recurrence_interval: (r.recurrence_interval as RecurrenceInterval) || "weekly",
      };
    });

    // Auto-advance any recurring events whose stored date expired
    const expiredRecurring = normalized.filter((ev) => {
      if (!ev.is_recurring) return false;
      const eff = getEffectiveEventDate(ev);
      return eff.effectiveDate !== ev.event_date;
    });

    if (expiredRecurring.length > 0) {
      Promise.all(
        expiredRecurring.map(async (ev) => {
          const eff = getEffectiveEventDate(ev);
          try {
            await supabase
              .from("events")
              .update({
                event_date: eff.effectiveDate,
                published: true,
                is_recurring: true,
                recurrence_interval: ev.recurrence_interval || "weekly",
              })
              .eq("id", ev.id);
          } catch {
            // ignore if columns not in DB yet
          }
        })
      ).catch(() => {});
    }

    setRows(normalized);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = filter === "all" ? rows : rows.filter((r) => r.category_id === filter);

  const move = async (row: Ev, dir: -1 | 1) => {
    const idx = filtered.findIndex((r) => r.id === row.id);
    const other = filtered[idx + dir];
    if (!other) return;
    await Promise.all([
      supabase.from("events").update({ sort_order: other.sort_order }).eq("id", row.id),
      supabase.from("events").update({ sort_order: row.sort_order }).eq("id", other.id),
    ]);
    load();
  };

  const toggle = async (row: Ev, field: "published" | "featured") => {
    const patch = field === "published" ? { published: !row.published } : { featured: !row.featured };
    const { error } = await supabase.from("events").update(patch).eq("id", row.id);
    if (error) toast.error(error.message);
    else load();
  };

  const confirmDelete = async () => {
    if (!deleteRow) return;
    await deleteMedia(deleteRow.image_path).catch(() => {});
    const { error } = await supabase.from("events").delete().eq("id", deleteRow.id);
    setDeleteRow(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Events</h1>
          <p className="text-sm text-muted-foreground">
            Gatherings, tastings, conversations. Image alignment controls how the photo sits on the public page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {cats.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-1.5 size-4" /> New event
          </Button>
        </div>
      </header>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Order</th>
              <th className="px-3 py-2 font-medium">Image</th>
              <th className="px-3 py-2 font-medium">Title</th>
              <th className="px-3 py-2 font-medium">When</th>
              <th className="px-3 py-2 font-medium">Category</th>
              <th className="px-3 py-2 font-medium">Flags</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                  No events.
                </td>
              </tr>
            )}
            {filtered.map((row, i) => {
              const cat = cats.find((c) => c.id === row.category_id);
              const effective = getEffectiveEventDate(row);
              return (
                <tr key={row.id}>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <span className="w-6 tabular-nums">{row.sort_order}</span>
                      <Button size="icon" variant="ghost" disabled={i === 0} onClick={() => move(row, -1)}>
                        <ArrowUp className="size-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={i === filtered.length - 1}
                        onClick={() => move(row, 1)}
                      >
                        <ArrowDown className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <SignedImage path={row.image_path} className="size-12" />
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{row.title_en}</div>
                    <div className="text-xs text-muted-foreground">{row.title_sl}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-foreground">
                      {effective.effectiveDate}
                      {row.event_time ? ` · ${row.event_time.slice(0, 5)}` : ""}
                    </div>
                    {effective.isRecurring ? (
                      <div className="flex items-center gap-1 text-[11px] text-primary mt-0.5">
                        <Repeat className="size-3 shrink-0" />
                        <span>{formatRecurrenceLabel(row.recurrence_interval, effective.dayOfWeek, "en", row.event_time)}</span>
                      </div>
                    ) : (
                      effective.isPast && <span className="text-[11px] text-muted-foreground italic">(past)</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{cat?.name_en ?? "—"}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button onClick={() => toggle(row, "published")}>
                        {row.published ? <Badge variant="secondary">Live</Badge> : <Badge variant="outline">Draft</Badge>}
                      </button>
                      <button onClick={() => toggle(row, "featured")}>
                        <Badge variant={row.featured ? "default" : "outline"}>
                          {row.featured ? "★ Featured" : "Feature"}
                        </Badge>
                      </button>
                      {effective.isRecurring && (
                        <Badge variant="outline" className="border-primary/40 text-primary">
                          🔄 Weekly
                        </Badge>
                      )}
                      <Badge variant="outline">img: {row.image_alignment}</Badge>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditing(row);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeleteRow(row)}>
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {dialogOpen && (
        <EventDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initial={editing}
          cats={cats}
          onSaved={load}
        />
      )}

      <AlertDialog open={!!deleteRow} onOpenChange={(o) => !o && setDeleteRow(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this event?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EventDialog({
  open,
  onOpenChange,
  initial,
  cats,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: Ev | null;
  cats: Cat[];
  onSaved: () => void;
}) {
  const [v, setV] = useState<Omit<Ev, "id">>(
    initial
      ? {
          ...initial,
          event_time: initial.event_time ? initial.event_time.slice(0, 5) : null,
          is_recurring: Boolean(initial.is_recurring),
          recurrence_interval: initial.recurrence_interval || "weekly",
        }
      : empty,
  );
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!v.title_en.trim() || !v.title_sl.trim() || !v.event_date) {
      toast.error("Title (EN), Title (SL), and date are required");
      return;
    }
    setBusy(true);
    const payload = {
      ...v,
      title_en: v.title_en.trim(),
      title_sl: v.title_sl.trim(),
      description_en: v.description_en?.trim() || null,
      description_sl: v.description_sl?.trim() || null,
      location_or_note_en: v.location_or_note_en?.trim() || null,
      location_or_note_sl: v.location_or_note_sl?.trim() || null,
      event_time: v.event_time ? v.event_time : null,
      sort_order: Number(v.sort_order) || 0,
      is_recurring: Boolean(v.is_recurring),
      recurrence_interval: v.recurrence_interval || "weekly",
    };

    let res = initial
      ? await supabase.from("events").update(payload).eq("id", initial.id)
      : await supabase.from("events").insert(payload);

    // Fallback if DB columns have not yet been migrated in Supabase
    if (res.error && res.error.message.includes("is_recurring")) {
      const { is_recurring, recurrence_interval, ...fallbackPayload } = payload;
      res = initial
        ? await supabase.from("events").update(fallbackPayload).eq("id", initial.id)
        : await supabase.from("events").insert(fallbackPayload);
      if (!res.error) {
        toast.info("Saved! Remember to execute the SQL migration in Supabase SQL editor to enable the database columns.");
      }
    }

    setBusy(false);
    if (res.error) {
      toast.error(res.error.message);
      return;
    }
    toast.success(initial ? "Saved" : "Created");
    onOpenChange(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit event" : "New event"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={v.category_id ?? "none"}
              onValueChange={(val) => setV({ ...v, category_id: val === "none" ? null : val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Uncategorized</SelectItem>
                {cats.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Title (EN) *</Label>
              <Input value={v.title_en} onChange={(e) => setV({ ...v, title_en: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Title (SL) *</Label>
              <Input value={v.title_sl} onChange={(e) => setV({ ...v, title_sl: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Description (EN)</Label>
                <span className="text-[11px] text-muted-foreground">Enter = new line · &lt;br&gt;</span>
              </div>
              <Textarea
                rows={5}
                className="font-sans leading-relaxed"
                placeholder="Event description...&#10;&#10;• Bullet points&#10;• Highlights&#10;&#10;Details..."
                value={v.description_en ?? ""}
                onChange={(e) => setV({ ...v, description_en: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Description (SL)</Label>
                <span className="text-[11px] text-muted-foreground">Enter = nova vrstica · &lt;br&gt;</span>
              </div>
              <Textarea
                rows={5}
                className="font-sans leading-relaxed"
                placeholder="Opis dogodka...&#10;&#10;• Točke programa&#10;• Poudarki&#10;&#10;Podrobnosti..."
                value={v.description_sl ?? ""}
                onChange={(e) => setV({ ...v, description_sl: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input
                type="date"
                value={v.event_date}
                onChange={(e) => setV({ ...v, event_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Time</Label>
              <Input
                type="time"
                value={v.event_time ?? ""}
                onChange={(e) => setV({ ...v, event_time: e.target.value || null })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Location / note (EN)</Label>
              <Input
                value={v.location_or_note_en ?? ""}
                onChange={(e) => setV({ ...v, location_or_note_en: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Location / note (SL)</Label>
              <Input
                value={v.location_or_note_sl ?? ""}
                onChange={(e) => setV({ ...v, location_or_note_sl: e.target.value })}
              />
            </div>
          </div>

          {/* Recurrence Settings */}
          <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Repeat className="size-4 text-primary" />
                  <span>Recurring event</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Automatically repeats each week, stays published, and advances date when expired.
                </p>
              </div>
              <Switch
                checked={v.is_recurring}
                onCheckedChange={(c) => setV({ ...v, is_recurring: c })}
              />
            </div>

            {v.is_recurring && (
              <div className="grid gap-3 pt-2 sm:grid-cols-2 border-t border-border/60">
                <div className="space-y-1.5">
                  <Label className="text-xs">Repeat frequency</Label>
                  <Select
                    value={v.recurrence_interval}
                    onValueChange={(val) =>
                      setV({ ...v, recurrence_interval: val as RecurrenceInterval })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly (every week)</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly (every 2 weeks)</SelectItem>
                      <SelectItem value="monthly">Monthly (every month)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Schedule preview</Label>
                  <div className="rounded-md bg-background px-3 py-2 text-xs text-foreground border border-input flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-primary shrink-0" />
                    <span className="font-medium">
                      {formatRecurrenceLabel(
                        v.recurrence_interval,
                        parseDateYMD(v.event_date || today()).getDay(),
                        "en",
                        v.event_time
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Image</Label>
            <ImageField value={v.image_path} onChange={(p) => setV({ ...v, image_path: p })} folder="events" />
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label>Image align</Label>
              <Select
                value={v.image_alignment}
                onValueChange={(val) => setV({ ...v, image_alignment: val as "left" | "right" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Sort order</Label>
              <Input
                type="number"
                value={v.sort_order}
                onChange={(e) => setV({ ...v, sort_order: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch checked={v.published} onCheckedChange={(c) => setV({ ...v, published: c })} />
              <Label>Published</Label>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch checked={v.featured} onCheckedChange={(c) => setV({ ...v, featured: c })} />
              <Label>Featured</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
