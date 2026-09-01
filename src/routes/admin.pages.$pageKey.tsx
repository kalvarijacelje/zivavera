import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowUp, ArrowDown, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { ImageField } from "@/components/admin/ImageField";
import { deleteMedia } from "@/lib/admin/storage";
import {
  SECTION_TYPES,
  type SectionType,
  type SectionItem,
  type StaticPage,
  type StaticPageSection,
  type Bullet,
} from "@/lib/static-pages";

export const Route = createFileRoute("/admin/pages/$pageKey")({
  component: PageEditor,
  errorComponent: ({ error, reset }) => (
    <div className="space-y-4 p-4 sm:p-6">
      <Button asChild size="sm" variant="ghost">
        <Link to="/admin/pages">
          <ArrowLeft className="mr-1.5 size-3.5" /> All pages
        </Link>
      </Button>
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-destructive">
        <h2 className="font-display text-lg font-semibold">Failed to load page editor</h2>
        <p className="mt-1 text-sm opacity-90 font-mono">
          {error instanceof Error ? error.message : String(error)}
        </p>
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={() => reset()}>
            Try again
          </Button>
        </div>
      </div>
    </div>
  ),
});

const BUILT_IN_PAGE_DEFAULTS: Record<
  string,
  {
    internal_label: string;
    title_en: string;
    title_sl: string;
    show_in_navigation: boolean;
    nav_order: number;
  }
> = {
  about: {
    internal_label: "About Us",
    title_sl: "Spoznajte nas",
    title_en: "Get to know us",
    show_in_navigation: true,
    nav_order: 10,
  },
  visit: {
    internal_label: "Visit Us",
    title_sl: "Obiščite nas",
    title_en: "Visit us",
    show_in_navigation: true,
    nav_order: 20,
  },
  hospitality: {
    internal_label: "Hospitality",
    title_sl: "Gostoljubnost",
    title_en: "Hospitality",
    show_in_navigation: true,
    nav_order: 30,
  },
  prayer: {
    internal_label: "Prayer Requests",
    title_sl: "Molitev",
    title_en: "Prayer",
    show_in_navigation: true,
    nav_order: 40,
  },
};

const emptyBullet = (): Bullet => ({ text_en: "", text_sl: "" });
const emptyItem = (): SectionItem => ({});

const defaultLayoutVariant = (type: SectionType): string => {
  if (type === "text_with_image") return "left";
  if (type === "card_grid") return "3";
  return "center";
};

const emptySection = (
  type: SectionType,
  pageId: string,
  sort_order: number,
): Omit<StaticPageSection, "id"> => ({
  page_id: pageId,
  section_type: type,
  internal_label: "",
  sort_order,
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
  button_text_en: "",
  button_text_sl: "",
  button_link: "",
  layout_variant: defaultLayoutVariant(type),
  bullets: type === "policy_section" ? [emptyBullet(), emptyBullet(), emptyBullet()] : [],
  items:
    type === "image_gallery" ||
    type === "card_grid" ||
    type === "faq" ||
    type === "alternating_content" ||
    type === "testimonial"
      ? [emptyItem(), emptyItem()]
      : [],
});

function PageEditor() {
  const params = useParams({ strict: false }) as { pageKey?: string };
  const routeParams = (() => {
    try {
      return Route.useParams();
    } catch {
      return undefined;
    }
  })();
  const pageKey = routeParams?.pageKey || params?.pageKey || "about";

  const [page, setPage] = useState<StaticPage | null>(null);
  const [sections, setSections] = useState<StaticPageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<StaticPageSection | null>(null);
  const [creatingType, setCreatingType] = useState<SectionType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteRow, setDeleteRow] = useState<StaticPageSection | null>(null);

  // Page-level editable fields
  const [pageTitleEn, setPageTitleEn] = useState("");
  const [pageTitleSl, setPageTitleSl] = useState("");
  const [pageLabel, setPageLabel] = useState("");
  const [pagePublished, setPagePublished] = useState(true);
  const [pageBusy, setPageBusy] = useState(false);

  const load = useCallback(async () => {
    if (!pageKey) {
      setLoading(false);
      return;
    }
    setLoading(true);
    let { data: p, error: pErr } = await supabase
      .from("static_pages")
      .select("id, page_key, internal_label, title_en, title_sl, published, show_in_navigation, nav_order")
      .eq("page_key", pageKey)
      .maybeSingle();

    // Auto-provision built-in pages if missing from static_pages table
    if ((!p || pErr) && BUILT_IN_PAGE_DEFAULTS[pageKey]) {
      const def = BUILT_IN_PAGE_DEFAULTS[pageKey];
      const { data: created, error: createErr } = await supabase
        .from("static_pages")
        .upsert(
          {
            page_key: pageKey,
            internal_label: def.internal_label,
            title_en: def.title_en,
            title_sl: def.title_sl,
            published: true,
            show_in_navigation: def.show_in_navigation ?? true,
            nav_order: def.nav_order ?? 10,
          },
          { onConflict: "page_key" }
        )
        .select("id, page_key, internal_label, title_en, title_sl, published, show_in_navigation, nav_order")
        .maybeSingle();

      if (!createErr && created) {
        p = created;
        pErr = null;
      }
    }

    if (pErr || !p) {
      toast.error(pErr?.message ?? `Page "${pageKey}" not found`);
      setPage(null);
      setLoading(false);
      return;
    }
    const pageRow = p as unknown as StaticPage;
    setPage(pageRow);
    setPageTitleEn(pageRow.title_en ?? "");
    setPageTitleSl(pageRow.title_sl ?? "");
    setPageLabel(pageRow.internal_label ?? "");
    setPagePublished(pageRow.published ?? true);

    const { data: s, error: sErr } = await supabase
      .from("static_page_sections")
      .select("id, page_id, section_type, internal_label, sort_order, published, eyebrow_en, eyebrow_sl, title_en, title_sl, subtitle_en, subtitle_sl, body_en, body_sl, image_path, button_text_en, button_text_sl, button_link, layout_variant, bullets, items")
      .eq("page_id", pageRow.id)
      .order("sort_order")
      .limit(50);
    if (sErr) {
      toast.error(sErr.message);
    }
    setSections(
      ((s ?? []) as unknown as StaticPageSection[]).map((row) => ({
        ...row,
        bullets: Array.isArray(row.bullets) ? row.bullets : [],
        items: Array.isArray((row as unknown as { items?: unknown }).items)
          ? ((row as unknown as { items: SectionItem[] }).items)
          : [],
      })),
    );
    setLoading(false);
  }, [pageKey]);

  useEffect(() => {
    load();
  }, [load]);

  const savePageFields = async () => {
    if (!page) return;
    if (!pageTitleEn.trim() || !pageTitleSl.trim()) {
      toast.error("Both EN and SL titles are required");
      return;
    }
    setPageBusy(true);
    const { error } = await supabase
      .from("static_pages")
      .update({
        title_en: pageTitleEn.trim(),
        title_sl: pageTitleSl.trim(),
        internal_label: pageLabel.trim() || page.internal_label,
        published: pagePublished,
      })
      .eq("id", page.id);
    setPageBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Page saved");
      load();
    }
  };

  const togglePublished = async (row: StaticPageSection) => {
    const { error } = await supabase
      .from("static_page_sections")
      .update({ published: !row.published })
      .eq("id", row.id);
    if (error) toast.error(error.message);
    else load();
  };

  const move = async (row: StaticPageSection, dir: -1 | 1) => {
    const idx = sections.findIndex((r) => r.id === row.id);
    const other = sections[idx + dir];
    if (!other) return;
    await Promise.all([
      supabase.from("static_page_sections").update({ sort_order: other.sort_order }).eq("id", row.id),
      supabase.from("static_page_sections").update({ sort_order: row.sort_order }).eq("id", other.id),
    ]);
    load();
  };

  const confirmDelete = async () => {
    if (!deleteRow) return;
    await deleteMedia(deleteRow.image_path).catch(() => {});
    const { error } = await supabase
      .from("static_page_sections")
      .delete()
      .eq("id", deleteRow.id);
    setDeleteRow(null);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      load();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Loading page editor…
      </div>
    );
  }
  if (!page) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <Button asChild size="sm" variant="ghost">
          <Link to="/admin/pages">
            <ArrowLeft className="mr-1.5 size-3.5" /> All pages
          </Link>
        </Button>
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-destructive">
          <h2 className="font-display text-lg font-semibold">Page not found</h2>
          <p className="mt-1 text-sm">
            Could not find static page with key &ldquo;{pageKey}&rdquo;.
          </p>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => load()}>
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button asChild size="sm" variant="ghost">
          <Link to="/admin/pages">
            <ArrowLeft className="mr-1.5 size-3.5" /> All pages
          </Link>
        </Button>
      </div>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <span>Editing page</span>
            <Badge variant="outline">{page.page_key}</Badge>
          </div>
          <h1 className="font-display text-2xl font-semibold">{page.internal_label}</h1>
        </div>
      </header>

      {/* Page-level fields */}
      <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <h2 className="font-display text-base font-semibold">Page settings</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Title (EN)</Label>
            <Input value={pageTitleEn} onChange={(e) => setPageTitleEn(e.target.value)} />
          </div>
          <div>
            <Label>Title (SL)</Label>
            <Input value={pageTitleSl} onChange={(e) => setPageTitleSl(e.target.value)} />
          </div>
          <div>
            <Label>Internal label</Label>
            <Input value={pageLabel} onChange={(e) => setPageLabel(e.target.value)} />
          </div>
          <div>
            <Label className="block">Visibility</Label>
            <div className="mt-2 flex items-center gap-2">
              <Switch checked={pagePublished} onCheckedChange={setPagePublished} />
              <span className="text-sm text-muted-foreground">
                {pagePublished ? "Visible to the public" : "Hidden from the public"}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={savePageFields} disabled={pageBusy}>
            Save page settings
          </Button>
        </div>
      </section>

      {/* Sections list */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">Sections</h2>
            <p className="text-sm text-muted-foreground">
              Sections render top to bottom in the order shown.
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-64 justify-between">
                <span>+ Add section…</span>
                <Plus className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 max-h-80 overflow-y-auto">
              {SECTION_TYPES.map((t) => (
                <DropdownMenuItem
                  key={t.value}
                  onClick={() => {
                    setCreatingType(t.value);
                    setEditing(null);
                    setDialogOpen(true);
                  }}
                  className="flex flex-col items-start cursor-pointer py-2"
                >
                  <span className="font-medium text-foreground">{t.label}</span>
                  <span className="text-xs text-muted-foreground">{t.hint}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

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
              {sections.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                    No sections yet. Add one to get started.
                  </td>
                </tr>
              )}
              {sections.map((row, i) => (
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
                        disabled={i === sections.length - 1}
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
                      <Switch
                        checked={row.published}
                        onCheckedChange={() => togglePublished(row)}
                      />
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
      </section>

      {dialogOpen && (
        <SectionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          page={page}
          initial={editing}
          createType={creatingType}
          existingRows={sections}
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

function SectionDialog({
  open,
  onOpenChange,
  page,
  initial,
  createType,
  existingRows,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  page: StaticPage;
  initial: StaticPageSection | null;
  createType: SectionType | null;
  existingRows: StaticPageSection[];
  onSaved: () => void;
}) {
  const startType: SectionType = initial?.section_type ?? createType ?? "simple_text_block";
  const nextOrder =
    existingRows.length > 0
      ? Math.max(...existingRows.map((r) => r.sort_order)) + 10
      : 10;

  const [v, setV] = useState<Omit<StaticPageSection, "id">>(
    initial
      ? {
          ...initial,
          bullets: Array.isArray(initial.bullets) ? initial.bullets : [],
          items: Array.isArray(initial.items) ? initial.items : [],
        }
      : emptySection(startType, page.id, nextOrder),
  );
  const [busy, setBusy] = useState(false);

  const t = v.section_type;
  const showEyebrow = t === "hero";
  const showTitle =
    t === "hero" ||
    t === "simple_text_block" ||
    t === "text_with_image" ||
    t === "quote_or_highlight" ||
    t === "call_to_action" ||
    t === "policy_section" ||
    t === "image_gallery" ||
    t === "card_grid" ||
    t === "faq" ||
    t === "video" ||
    t === "alternating_content" ||
    t === "testimonial";
  const showSubtitle = t === "hero" || t === "call_to_action";
  const showBody =
    t === "simple_text_block" ||
    t === "text_with_image" ||
    t === "quote_or_highlight" ||
    t === "call_to_action" ||
    t === "policy_section" ||
    t === "image_gallery" ||
    t === "card_grid" ||
    t === "faq" ||
    t === "video";
  const showImage = t === "hero" || t === "text_with_image" || t === "image_block" || t === "video";
  const showAlignment = t === "text_with_image";
  const showCardCols = t === "card_grid";
  const showButton = t === "hero" || t === "text_with_image" || t === "call_to_action";
  const showVideoUrl = t === "video";
  const showBullets = t === "policy_section";
  const showItems =
    t === "image_gallery" ||
    t === "card_grid" ||
    t === "faq" ||
    t === "alternating_content" ||
    t === "testimonial";

  const subtitleHint =
    t === "call_to_action"
      ? "Small note shown beneath the button"
      : "Short tagline beneath the title";

  const setBullet = (idx: number, patch: Partial<Bullet>) => {
    const next = [...v.bullets];
    next[idx] = { ...next[idx], ...patch };
    setV({ ...v, bullets: next });
  };
  const addBullet = () => setV({ ...v, bullets: [...v.bullets, emptyBullet()] });
  const removeBullet = (idx: number) =>
    setV({ ...v, bullets: v.bullets.filter((_, i) => i !== idx) });

  const setItem = (idx: number, patch: Partial<SectionItem>) => {
    const next = [...v.items];
    next[idx] = { ...next[idx], ...patch };
    setV({ ...v, items: next });
  };
  const addItem = () => setV({ ...v, items: [...v.items, emptyItem()] });
  const removeItem = (idx: number) =>
    setV({ ...v, items: v.items.filter((_, i) => i !== idx) });
  const moveItem = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= v.items.length) return;
    const next = [...v.items];
    [next[idx], next[j]] = [next[j], next[idx]];
    setV({ ...v, items: next });
  };

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
      sort_order: Number(v.sort_order) || 0,
      bullets: v.bullets.filter((b) => b.text_en.trim() || b.text_sl.trim()),
      items: v.items.filter((it) => {
        const vals = Object.values(it);
        return vals.some((x) => {
          if (typeof x === "string") return x.trim() !== "";
          return x != null && x !== "";
        });
      }),
    };
    const res = initial
      ? await supabase
          .from("static_page_sections")
          .update(payload as never)
          .eq("id", initial.id)
      : await supabase.from("static_page_sections").insert(payload as never);
    setBusy(false);
    if (res.error) {
      toast.error(res.error.message);
      return;
    }
    toast.success(initial ? "Saved" : "Created");
    onOpenChange(false);
    onSaved();
  };

  const sectionLabel = SECTION_TYPES.find((s) => s.value === t)?.label ?? t;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit section" : "New section"} ·{" "}
            <span className="text-muted-foreground font-normal">
              {page.internal_label} → {sectionLabel}
            </span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Internal label *</Label>
              <Input
                value={v.internal_label}
                onChange={(e) => setV({ ...v, internal_label: e.target.value })}
                placeholder="Only shown in admin"
                required
              />
            </div>
            <div>
              <Label>Sort order</Label>
              <Input
                type="number"
                value={v.sort_order}
                onChange={(e) => setV({ ...v, sort_order: Number(e.target.value) })}
              />
            </div>
          </div>

          {showEyebrow && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Eyebrow (EN)</Label>
                <Input
                  value={v.eyebrow_en ?? ""}
                  onChange={(e) => setV({ ...v, eyebrow_en: e.target.value })}
                />
              </div>
              <div>
                <Label>Eyebrow (SL)</Label>
                <Input
                  value={v.eyebrow_sl ?? ""}
                  onChange={(e) => setV({ ...v, eyebrow_sl: e.target.value })}
                />
              </div>
            </div>
          )}

          {showTitle && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Title (EN)</Label>
                <Input
                  value={v.title_en ?? ""}
                  onChange={(e) => setV({ ...v, title_en: e.target.value })}
                />
              </div>
              <div>
                <Label>Title (SL)</Label>
                <Input
                  value={v.title_sl ?? ""}
                  onChange={(e) => setV({ ...v, title_sl: e.target.value })}
                />
              </div>
            </div>
          )}

          {showSubtitle && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Subtitle (EN)</Label>
                <Input
                  value={v.subtitle_en ?? ""}
                  onChange={(e) => setV({ ...v, subtitle_en: e.target.value })}
                  placeholder={subtitleHint}
                />
              </div>
              <div>
                <Label>Subtitle (SL)</Label>
                <Input
                  value={v.subtitle_sl ?? ""}
                  onChange={(e) => setV({ ...v, subtitle_sl: e.target.value })}
                  placeholder={subtitleHint}
                />
              </div>
            </div>
          )}

          {showBody && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Body (EN)</Label>
                <Textarea
                  rows={5}
                  value={v.body_en ?? ""}
                  onChange={(e) => setV({ ...v, body_en: e.target.value })}
                />
              </div>
              <div>
                <Label>Body (SL)</Label>
                <Textarea
                  rows={5}
                  value={v.body_sl ?? ""}
                  onChange={(e) => setV({ ...v, body_sl: e.target.value })}
                />
              </div>
            </div>
          )}

          {showImage && (
            <div>
              <Label className="block">Image</Label>
              <div className="mt-2">
                <ImageField
                  value={v.image_path}
                  onChange={(p) => setV({ ...v, image_path: p })}
                  folder="pages"
                />
              </div>
            </div>
          )}

          {showAlignment && (
            <div>
              <Label>Image position</Label>
              <Select
                value={v.layout_variant}
                onValueChange={(val) => setV({ ...v, layout_variant: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Image on the left</SelectItem>
                  <SelectItem value="right">Image on the right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {showCardCols && (
            <div>
              <Label>Columns</Label>
              <Select
                value={v.layout_variant}
                onValueChange={(val) => setV({ ...v, layout_variant: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 columns</SelectItem>
                  <SelectItem value="3">3 columns (default)</SelectItem>
                  <SelectItem value="4">4 columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {showVideoUrl && (
            <div className="space-y-3 rounded-md border border-border bg-muted/30 p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Video
              </p>
              <div>
                <Label>Video URL</Label>
                <Input
                  value={v.button_link ?? ""}
                  onChange={(e) => setV({ ...v, button_link: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=…  or  https://vimeo.com/…"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  YouTube or Vimeo link. The image (above) is shown as a fallback if no URL is set.
                </p>
              </div>
            </div>
          )}

          {showButton && (
            <div className="space-y-3 rounded-md border border-border bg-muted/30 p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Button (optional)
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Button text (EN)</Label>
                  <Input
                    value={v.button_text_en ?? ""}
                    onChange={(e) => setV({ ...v, button_text_en: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Button text (SL)</Label>
                  <Input
                    value={v.button_text_sl ?? ""}
                    onChange={(e) => setV({ ...v, button_text_sl: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Button link</Label>
                <Input
                  value={v.button_link ?? ""}
                  onChange={(e) => setV({ ...v, button_link: e.target.value })}
                  placeholder="/visit  or  https://…"
                />
              </div>
            </div>
          )}

          {showBullets && (
            <div className="space-y-3 rounded-md border border-border bg-muted/30 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Bullet list
                </p>
                <Button type="button" size="sm" variant="outline" onClick={addBullet}>
                  <Plus className="mr-1 size-3.5" /> Add bullet
                </Button>
              </div>
              {v.bullets.length === 0 && (
                <p className="text-xs text-muted-foreground">No bullets yet.</p>
              )}
              {v.bullets.map((b, i) => (
                <div key={i} className="rounded-md border border-border bg-card p-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs">Bullet {i + 1} (EN)</Label>
                      <Input
                        value={b.text_en}
                        onChange={(e) => setBullet(i, { text_en: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Bullet {i + 1} (SL)</Label>
                      <Input
                        value={b.text_sl}
                        onChange={(e) => setBullet(i, { text_sl: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeBullet(i)}
                    >
                      <Trash2 className="mr-1 size-3.5 text-destructive" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showItems && <ItemsEditor type={t} items={v.items} setItem={setItem} addItem={addItem} removeItem={removeItem} moveItem={moveItem} />}

          <div className="flex items-center gap-2 pt-2">
            <Switch
              checked={v.published}
              onCheckedChange={(checked) => setV({ ...v, published: checked })}
            />
            <span className="text-sm text-muted-foreground">
              {v.published ? "Visible on the public page" : "Hidden"}
            </span>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {initial ? "Save changes" : "Create section"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ItemsEditor({
  type,
  items,
  setItem,
  addItem,
  removeItem,
  moveItem,
}: {
  type: SectionType;
  items: SectionItem[];
  setItem: (idx: number, patch: Partial<SectionItem>) => void;
  addItem: () => void;
  removeItem: (idx: number) => void;
  moveItem: (idx: number, dir: -1 | 1) => void;
}) {
  const labels: Record<string, { heading: string; addLabel: string; itemNoun: string }> = {
    image_gallery: { heading: "Gallery images", addLabel: "Add image", itemNoun: "Image" },
    card_grid: { heading: "Cards", addLabel: "Add card", itemNoun: "Card" },
    faq: { heading: "Questions", addLabel: "Add question", itemNoun: "Question" },
    alternating_content: { heading: "Content rows", addLabel: "Add row", itemNoun: "Row" },
    testimonial: { heading: "Testimonials", addLabel: "Add testimonial", itemNoun: "Testimonial" },
  };
  const cfg = labels[type] ?? { heading: "Items", addLabel: "Add item", itemNoun: "Item" };

  return (
    <div className="space-y-3 rounded-md border border-border bg-muted/30 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {cfg.heading}
        </p>
        <Button type="button" size="sm" variant="outline" onClick={addItem}>
          <Plus className="mr-1 size-3.5" /> {cfg.addLabel}
        </Button>
      </div>
      {items.length === 0 && (
        <p className="text-xs text-muted-foreground">No {cfg.heading.toLowerCase()} yet.</p>
      )}
      {items.map((it, i) => (
        <div key={i} className="space-y-3 rounded-md border border-border bg-card p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              {cfg.itemNoun} {i + 1}
            </p>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={i === 0}
                onClick={() => moveItem(i, -1)}
              >
                <ArrowUp className="size-3.5" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={i === items.length - 1}
                onClick={() => moveItem(i, 1)}
              >
                <ArrowDown className="size-3.5" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => removeItem(i)}
              >
                <Trash2 className="size-3.5 text-destructive" />
              </Button>
            </div>
          </div>

          {type === "image_gallery" && (
            <>
              <div>
                <Label className="text-xs">Image</Label>
                <div className="mt-1">
                  <ImageField
                    value={it.image_path ?? null}
                    onChange={(p) => setItem(i, { image_path: p })}
                    folder="pages"
                  />
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Caption (EN)</Label>
                  <Input
                    value={it.caption_en ?? ""}
                    onChange={(e) => setItem(i, { caption_en: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Caption (SL)</Label>
                  <Input
                    value={it.caption_sl ?? ""}
                    onChange={(e) => setItem(i, { caption_sl: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          {type === "card_grid" && (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Title (EN)</Label>
                  <Input
                    value={it.title_en ?? ""}
                    onChange={(e) => setItem(i, { title_en: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Title (SL)</Label>
                  <Input
                    value={it.title_sl ?? ""}
                    onChange={(e) => setItem(i, { title_sl: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Body (EN)</Label>
                  <Textarea
                    rows={3}
                    value={it.body_en ?? ""}
                    onChange={(e) => setItem(i, { body_en: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Body (SL)</Label>
                  <Textarea
                    rows={3}
                    value={it.body_sl ?? ""}
                    onChange={(e) => setItem(i, { body_sl: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Image (optional)</Label>
                <div className="mt-1">
                  <ImageField
                    value={it.image_path ?? null}
                    onChange={(p) => setItem(i, { image_path: p })}
                    folder="pages"
                  />
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Icon (emoji, used if no image)</Label>
                  <Input
                    value={it.icon ?? ""}
                    onChange={(e) => setItem(i, { icon: e.target.value })}
                    placeholder="☕  ✝  ❤"
                  />
                </div>
                <div>
                  <Label className="text-xs">Link (optional)</Label>
                  <Input
                    value={it.link ?? ""}
                    onChange={(e) => setItem(i, { link: e.target.value })}
                    placeholder="/visit or https://…"
                  />
                </div>
              </div>
            </>
          )}

          {type === "faq" && (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Question (EN)</Label>
                  <Input
                    value={it.q_en ?? ""}
                    onChange={(e) => setItem(i, { q_en: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Question (SL)</Label>
                  <Input
                    value={it.q_sl ?? ""}
                    onChange={(e) => setItem(i, { q_sl: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Answer (EN)</Label>
                  <Textarea
                    rows={3}
                    value={it.a_en ?? ""}
                    onChange={(e) => setItem(i, { a_en: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Answer (SL)</Label>
                  <Textarea
                    rows={3}
                    value={it.a_sl ?? ""}
                    onChange={(e) => setItem(i, { a_sl: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          {type === "alternating_content" && (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Title (EN)</Label>
                  <Input
                    value={it.title_en ?? ""}
                    onChange={(e) => setItem(i, { title_en: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Title (SL)</Label>
                  <Input
                    value={it.title_sl ?? ""}
                    onChange={(e) => setItem(i, { title_sl: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Body (EN)</Label>
                  <Textarea
                    rows={4}
                    value={it.body_en ?? ""}
                    onChange={(e) => setItem(i, { body_en: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Body (SL)</Label>
                  <Textarea
                    rows={4}
                    value={it.body_sl ?? ""}
                    onChange={(e) => setItem(i, { body_sl: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Image</Label>
                <div className="mt-1">
                  <ImageField
                    value={it.image_path ?? null}
                    onChange={(p) => setItem(i, { image_path: p })}
                    folder="pages"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Image side</Label>
                <Select
                  value={it.variant ?? (i % 2 === 0 ? "left" : "right")}
                  onValueChange={(val) => setItem(i, { variant: val as "left" | "right" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Image on the left</SelectItem>
                    <SelectItem value="right">Image on the right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {type === "testimonial" && (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Quote (EN)</Label>
                  <Textarea
                    rows={3}
                    value={it.quote_en ?? ""}
                    onChange={(e) => setItem(i, { quote_en: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Quote (SL)</Label>
                  <Textarea
                    rows={3}
                    value={it.quote_sl ?? ""}
                    onChange={(e) => setItem(i, { quote_sl: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <div>
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={it.name ?? ""}
                    onChange={(e) => setItem(i, { name: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Role (EN)</Label>
                  <Input
                    value={it.role_en ?? ""}
                    onChange={(e) => setItem(i, { role_en: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Role (SL)</Label>
                  <Input
                    value={it.role_sl ?? ""}
                    onChange={(e) => setItem(i, { role_sl: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Photo (optional)</Label>
                <div className="mt-1">
                  <ImageField
                    value={it.image_path ?? null}
                    onChange={(p) => setItem(i, { image_path: p })}
                    folder="pages"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
