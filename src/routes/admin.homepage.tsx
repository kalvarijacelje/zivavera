import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
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
import { deleteMedia } from "@/lib/admin/storage";

export const Route = createFileRoute("/admin/homepage")({
  component: HomepagePage,
});

export type SectionType =
  | "hero"
  | "text_with_image"
  | "call_to_action"
  | "simple_text_block"
  | "featured_menu"
  | "featured_events"
  | "values_grid";

const SECTION_TYPES: { value: SectionType; label: string; hint: string }[] = [
  { value: "hero", label: "Hero", hint: "Big intro with background image and two CTAs" },
  { value: "text_with_image", label: "Text with image", hint: "Two-column block with image and text" },
  { value: "call_to_action", label: "Call to action", hint: "Wide image banner with overlay text + button" },
  { value: "simple_text_block", label: "Simple text block", hint: "Centered title + body, no image" },
  { value: "featured_menu", label: "Featured menu items", hint: "Grid of selected menu items" },
  { value: "featured_events", label: "Featured events", hint: "List of selected events" },
  { value: "values_grid", label: "Values grid (3 cards)", hint: "Three editable cards: title, body and icon for each" },
];

export type ValueCard = {
  icon: string;
  title_en: string;
  title_sl: string;
  body_en: string;
  body_sl: string;
};

export const ICON_CHOICES = [
  "Users",
  "HandHeart",
  "Coffee",
  "Heart",
  "Star",
  "Sun",
  "Leaf",
  "Church",
  "BookOpen",
  "Cross",
  "Smile",
  "Music",
  "Gift",
  "Sparkles",
];

export type HomepageSection = {
  id: string;
  section_type: SectionType;
  internal_label: string;
  sort_order: number;
  published: boolean;
  eyebrow_en: string | null;
  eyebrow_sl: string | null;
  title_en: string | null;
  title_sl: string | null;
  subtitle_en: string | null;
  subtitle_sl: string | null;
  body_en: string | null;
  body_sl: string | null;
  image_path: string | null;
  default_image_key: string | null;
  image_alignment: "left" | "right";
  button_text_en: string | null;
  button_text_sl: string | null;
  button_link: string | null;
  secondary_button_text_en: string | null;
  secondary_button_text_sl: string | null;
  secondary_button_link: string | null;
  featured_menu_item_ids: string[];
  featured_event_ids: string[];
  value_cards: ValueCard[];
};

const emptyCard = (): ValueCard => ({
  icon: "Sparkles",
  title_en: "",
  title_sl: "",
  body_en: "",
  body_sl: "",
});

const emptyOf = (type: SectionType): Omit<HomepageSection, "id"> => ({
  section_type: type,
  internal_label: "",
  sort_order: 0,
  published: true,
  eyebrow_en: "",
  eyebrow_sl: "",
  title_en: "",
  title_sl: "",
  subtitle_en: "",
  subtitle_sl: "",
  body_en: "",
  body_sl: "",
  image_path: null,
  default_image_key: null,
  image_alignment: "left",
  button_text_en: "",
  button_text_sl: "",
  button_link: "",
  secondary_button_text_en: "",
  secondary_button_text_sl: "",
  secondary_button_link: "",
  featured_menu_item_ids: [],
  featured_event_ids: [],
  value_cards:
    type === "values_grid" ? [emptyCard(), emptyCard(), emptyCard()] : [],
});


function HomepagePage() {
  const [rows, setRows] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<HomepageSection | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creatingType, setCreatingType] = useState<SectionType | null>(null);
  const [deleteRow, setDeleteRow] = useState<HomepageSection | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("id, section_type, internal_label, sort_order, published, eyebrow_en, eyebrow_sl, title_en, title_sl, subtitle_en, subtitle_sl, body_en, body_sl, image_path, default_image_key, image_alignment, button_text_en, button_text_sl, button_link, secondary_button_text_en, secondary_button_text_sl, secondary_button_link, featured_menu_item_ids, featured_event_ids, value_cards")
      .order("sort_order")
      .limit(50);
    if (error) toast.error(error.message);
    else setRows((data as unknown as HomepageSection[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const togglePublished = async (row: HomepageSection) => {
    const { error } = await supabase
      .from("homepage_sections")
      .update({ published: !row.published })
      .eq("id", row.id);
    if (error) toast.error(error.message);
    else load();
  };

  const move = async (row: HomepageSection, dir: -1 | 1) => {
    const idx = rows.findIndex((r) => r.id === row.id);
    const other = rows[idx + dir];
    if (!other) return;
    await Promise.all([
      supabase.from("homepage_sections").update({ sort_order: other.sort_order }).eq("id", row.id),
      supabase.from("homepage_sections").update({ sort_order: row.sort_order }).eq("id", other.id),
    ]);
    load();
  };

  const confirmDelete = async () => {
    if (!deleteRow) return;
    await deleteMedia(deleteRow.image_path).catch(() => {});
    const { error } = await supabase.from("homepage_sections").delete().eq("id", deleteRow.id);
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
          <h1 className="font-display text-2xl font-semibold">Homepage</h1>
          <p className="text-sm text-muted-foreground">
            Edit, reorder, hide or add sections on the public homepage. Sections render in sort
            order.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value=""
            onValueChange={(v) => {
              setCreatingType(v as SectionType);
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder="+ Add section…" />
            </SelectTrigger>
            <SelectContent>
              {SECTION_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{t.label}</span>
                    <span className="text-xs text-muted-foreground">{t.hint}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Order</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Label</th>
              <th className="px-3 py-2 font-medium">Title (EN)</th>
              <th className="px-3 py-2 font-medium">Visible</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                  No homepage sections yet.
                </td>
              </tr>
            )}
            {rows.map((row, i) => (
              <tr key={row.id}>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <span className="w-6 tabular-nums">{row.sort_order}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={i === 0}
                      onClick={() => move(row, -1)}
                    >
                      <ArrowUp className="size-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={i === rows.length - 1}
                      onClick={() => move(row, 1)}
                    >
                      <ArrowDown className="size-3.5" />
                    </Button>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <Badge variant="outline">{row.section_type}</Badge>
                </td>
                <td className="px-3 py-2 font-medium">{row.internal_label}</td>
                <td className="px-3 py-2 text-muted-foreground">{row.title_en ?? "—"}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Switch checked={row.published} onCheckedChange={() => togglePublished(row)} />
                    {row.published ? (
                      <Badge variant="secondary">Live</Badge>
                    ) : (
                      <Badge variant="outline">Hidden</Badge>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 text-right">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditing(row);
                      setCreatingType(null);
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
            ))}
          </tbody>
        </table>
      </div>

      {dialogOpen && (
        <SectionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initial={editing}
          createType={creatingType}
          existingRows={rows}
          onSaved={load}
        />
      )}

      <AlertDialog open={!!deleteRow} onOpenChange={(o) => !o && setDeleteRow(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this section?</AlertDialogTitle>
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

type MenuItemOpt = { id: string; name_en: string };
type EventOpt = { id: string; title_en: string };

function SectionDialog({
  open,
  onOpenChange,
  initial,
  createType,
  existingRows,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: HomepageSection | null;
  createType: SectionType | null;
  existingRows: HomepageSection[];
  onSaved: () => void;
}) {
  const startType: SectionType = initial?.section_type ?? createType ?? "simple_text_block";
  const [v, setV] = useState<Omit<HomepageSection, "id">>(
    initial
      ? { ...initial }
      : {
          ...emptyOf(startType),
          sort_order:
            existingRows.length > 0
              ? Math.max(...existingRows.map((r) => r.sort_order)) + 10
              : 10,
        },
  );
  const [busy, setBusy] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItemOpt[]>([]);
  const [events, setEvents] = useState<EventOpt[]>([]);

  useEffect(() => {
    if (v.section_type === "featured_menu") {
      supabase
        .from("menu_items")
        .select("id, name_en")
        .order("name_en")
        .then(({ data }) => setMenuItems((data as MenuItemOpt[]) ?? []));
    }
    if (v.section_type === "featured_events") {
      supabase
        .from("events")
        .select("id, title_en")
        .order("event_date", { ascending: false })
        .then(({ data }) => setEvents((data as EventOpt[]) ?? []));
    }
  }, [v.section_type]);

  const t = v.section_type;
  const showEyebrow = t === "hero" || t === "text_with_image";
  const showSubtitle = t === "hero";
  const showBody =
    t === "text_with_image" ||
    t === "call_to_action" ||
    t === "simple_text_block" ||
    t === "featured_menu" ||
    t === "featured_events";
  const showImage = t === "hero" || t === "text_with_image" || t === "call_to_action";
  const showAlignment = t === "text_with_image";
  const showPrimaryButton =
    t === "hero" || t === "text_with_image" || t === "call_to_action";
  const showSecondaryButton = t === "hero";
  const showMenuPicker = t === "featured_menu";
  const showEventPicker = t === "featured_events";
  const showValueCards = t === "values_grid";

  const setCard = (idx: number, patch: Partial<ValueCard>) => {
    const next = [...(v.value_cards ?? [])];
    while (next.length < 3) next.push(emptyCard());
    next[idx] = { ...next[idx], ...patch };
    setV({ ...v, value_cards: next });
  };

  // Ensure exactly 3 cards exist when editing a values_grid section
  useEffect(() => {
    if (v.section_type !== "values_grid") return;
    const cards = Array.isArray(v.value_cards) ? v.value_cards : [];
    if (cards.length !== 3) {
      const filled = [...cards];
      while (filled.length < 3) filled.push(emptyCard());
      setV({ ...v, value_cards: filled.slice(0, 3) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v.section_type]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!v.internal_label.trim()) {
      toast.error("Internal label is required");
      return;
    }
    setBusy(true);
    const trim = (s: string | null | undefined) => (s && s.trim() ? s.trim() : null);
    const payload = {
      ...v,
      internal_label: v.internal_label.trim(),
      eyebrow_en: trim(v.eyebrow_en),
      eyebrow_sl: trim(v.eyebrow_sl),
      title_en: trim(v.title_en),
      title_sl: trim(v.title_sl),
      subtitle_en: trim(v.subtitle_en),
      subtitle_sl: trim(v.subtitle_sl),
      body_en: trim(v.body_en),
      body_sl: trim(v.body_sl),
      button_text_en: trim(v.button_text_en),
      button_text_sl: trim(v.button_text_sl),
      button_link: trim(v.button_link),
      secondary_button_text_en: trim(v.secondary_button_text_en),
      secondary_button_text_sl: trim(v.secondary_button_text_sl),
      secondary_button_link: trim(v.secondary_button_link),
      sort_order: Number(v.sort_order) || 0,
    };
    const res = initial
      ? await supabase
          .from("homepage_sections")
          .update(payload as never)
          .eq("id", initial.id)
      : await supabase.from("homepage_sections").insert(payload as never);
    setBusy(false);
    if (res.error) {
      toast.error(res.error.message);
      return;
    }
    toast.success(initial ? "Saved" : "Created");
    onOpenChange(false);
    onSaved();
  };

  const toggleId = (arr: string[], id: string) =>
    arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit section" : "New section"} ·{" "}
            <span className="text-muted-foreground font-normal">{t}</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Internal label *</Label>
              <Input
                value={v.internal_label}
                onChange={(e) => setV({ ...v, internal_label: e.target.value })}
                placeholder="e.g. Hero, Menu teaser"
                required
              />
              <p className="text-xs text-muted-foreground">Admin-only name. Not shown publicly.</p>
            </div>

            {showEyebrow && (
              <>
                <div className="space-y-1.5">
                  <Label>Eyebrow (EN)</Label>
                  <Input value={v.eyebrow_en ?? ""} onChange={(e) => setV({ ...v, eyebrow_en: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Eyebrow (SL)</Label>
                  <Input value={v.eyebrow_sl ?? ""} onChange={(e) => setV({ ...v, eyebrow_sl: e.target.value })} />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label>Title (EN)</Label>
              <Input value={v.title_en ?? ""} onChange={(e) => setV({ ...v, title_en: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Title (SL)</Label>
              <Input value={v.title_sl ?? ""} onChange={(e) => setV({ ...v, title_sl: e.target.value })} />
            </div>

            {showSubtitle && (
              <>
                <div className="space-y-1.5">
                  <Label>Subtitle (EN)</Label>
                  <Textarea rows={2} value={v.subtitle_en ?? ""} onChange={(e) => setV({ ...v, subtitle_en: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Subtitle (SL)</Label>
                  <Textarea rows={2} value={v.subtitle_sl ?? ""} onChange={(e) => setV({ ...v, subtitle_sl: e.target.value })} />
                </div>
              </>
            )}

            {showBody && (
              <>
                <div className="space-y-1.5">
                  <Label>Body (EN)</Label>
                  <Textarea rows={3} value={v.body_en ?? ""} onChange={(e) => setV({ ...v, body_en: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Body (SL)</Label>
                  <Textarea rows={3} value={v.body_sl ?? ""} onChange={(e) => setV({ ...v, body_sl: e.target.value })} />
                </div>
              </>
            )}
          </div>

          {showImage && (
            <div className="space-y-1.5">
              <Label>Image {v.default_image_key && !v.image_path ? <span className="text-xs text-muted-foreground">(using built-in default: {v.default_image_key})</span> : null}</Label>
              <ImageField
                value={v.image_path}
                onChange={(p) => setV({ ...v, image_path: p })}
                folder="events"
              />
            </div>
          )}

          {showPrimaryButton && (
            <div className="grid gap-3 sm:grid-cols-3 rounded-md border border-border p-3">
              <div className="space-y-1.5">
                <Label>Button (EN)</Label>
                <Input value={v.button_text_en ?? ""} onChange={(e) => setV({ ...v, button_text_en: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Button (SL)</Label>
                <Input value={v.button_text_sl ?? ""} onChange={(e) => setV({ ...v, button_text_sl: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Link</Label>
                <Input value={v.button_link ?? ""} onChange={(e) => setV({ ...v, button_link: e.target.value })} placeholder="/menu or https://…" />
              </div>
            </div>
          )}

          {showSecondaryButton && (
            <div className="grid gap-3 sm:grid-cols-3 rounded-md border border-border p-3">
              <div className="space-y-1.5">
                <Label>2nd button (EN)</Label>
                <Input value={v.secondary_button_text_en ?? ""} onChange={(e) => setV({ ...v, secondary_button_text_en: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>2nd button (SL)</Label>
                <Input value={v.secondary_button_text_sl ?? ""} onChange={(e) => setV({ ...v, secondary_button_text_sl: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Link</Label>
                <Input value={v.secondary_button_link ?? ""} onChange={(e) => setV({ ...v, secondary_button_link: e.target.value })} />
              </div>
            </div>
          )}

          {showMenuPicker && (
            <div className="space-y-2 rounded-md border border-border p-3">
              <Label>Featured menu items</Label>
              <div className="max-h-48 space-y-1 overflow-y-auto">
                {menuItems.length === 0 && <p className="text-xs text-muted-foreground">No menu items.</p>}
                {menuItems.map((m) => (
                  <label key={m.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={v.featured_menu_item_ids.includes(m.id)}
                      onChange={() =>
                        setV({ ...v, featured_menu_item_ids: toggleId(v.featured_menu_item_ids, m.id) })
                      }
                    />
                    {m.name_en}
                  </label>
                ))}
              </div>
            </div>
          )}

          {showEventPicker && (
            <div className="space-y-2 rounded-md border border-border p-3">
              <Label>Featured events</Label>
              <div className="max-h-48 space-y-1 overflow-y-auto">
                {events.length === 0 && <p className="text-xs text-muted-foreground">No events.</p>}
                {events.map((ev) => (
                  <label key={ev.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={v.featured_event_ids.includes(ev.id)}
                      onChange={() =>
                        setV({ ...v, featured_event_ids: toggleId(v.featured_event_ids, ev.id) })
                      }
                    />
                    {ev.title_en}
                  </label>
                ))}
              </div>
            </div>
          )}

          {showValueCards && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Value cards (3)</Label>
                <p className="text-xs text-muted-foreground">
                  Edit title, body and icon for each of the three cards.
                </p>
              </div>
              {[0, 1, 2].map((idx) => {
                const card = (v.value_cards ?? [])[idx] ?? emptyCard();
                return (
                  <div key={idx} className="space-y-3 rounded-md border border-border p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Card {idx + 1}</p>
                      <div className="w-44">
                        <Select
                          value={card.icon}
                          onValueChange={(val) => setCard(idx, { icon: val })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Icon" />
                          </SelectTrigger>
                          <SelectContent>
                            {ICON_CHOICES.map((name) => (
                              <SelectItem key={name} value={name}>
                                {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>Title (EN)</Label>
                        <Input
                          value={card.title_en}
                          onChange={(e) => setCard(idx, { title_en: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Title (SL)</Label>
                        <Input
                          value={card.title_sl}
                          onChange={(e) => setCard(idx, { title_sl: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Body (EN)</Label>
                        <Textarea
                          rows={2}
                          value={card.body_en}
                          onChange={(e) => setCard(idx, { body_en: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Body (SL)</Label>
                        <Textarea
                          rows={2}
                          value={card.body_sl}
                          onChange={(e) => setCard(idx, { body_sl: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}



          <div className="grid gap-3 sm:grid-cols-3">
            {showAlignment && (
              <div className="space-y-1.5">
                <Label>Image align</Label>
                <Select
                  value={v.image_alignment}
                  onValueChange={(val) =>
                    setV({ ...v, image_alignment: val as "left" | "right" })
                  }
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
            )}
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
              <Label>Visible</Label>
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
