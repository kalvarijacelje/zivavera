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
import { Pencil, Trash2, Plus, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { ImageField } from "@/components/admin/ImageField";
import { SignedImage } from "@/components/admin/SignedImage";
import { deleteMedia } from "@/lib/admin/storage";

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
      supabase.from("event_categories").select("id, name_en").order("sort_order"),
      supabase.from("events").select("*").order("sort_order").order("event_date"),
    ]);
    if (cRes.error) toast.error(cRes.error.message);
    if (eRes.error) toast.error(eRes.error.message);
    setCats((cRes.data as Cat[]) ?? []);
    setRows((eRes.data as Ev[]) ?? []);
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
                  <td className="px-3 py-2 text-muted-foreground">
                    {row.event_date}
                    {row.event_time ? ` · ${row.event_time.slice(0, 5)}` : ""}
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
      ? { ...initial, event_time: initial.event_time ? initial.event_time.slice(0, 5) : null }
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
    };
    const res = initial
      ? await supabase.from("events").update(payload).eq("id", initial.id)
      : await supabase.from("events").insert(payload);
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
              <Label>Description (EN)</Label>
              <Textarea
                rows={3}
                value={v.description_en ?? ""}
                onChange={(e) => setV({ ...v, description_en: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description (SL)</Label>
              <Textarea
                rows={3}
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
