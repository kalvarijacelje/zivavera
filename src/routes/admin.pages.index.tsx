import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Pencil,
  FileText,
  Plus,
  Trash2,
  ExternalLink,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { StaticPage } from "@/lib/static-pages";

export const Route = createFileRoute("/admin/pages/")({
  component: PagesAdmin,
});

// Built-in pages have dedicated public routes (about.tsx, visit.tsx,
// hospitality.tsx). They cannot be deleted, but their content is still
// editable through the section editor like any other page.
const BUILT_IN_KEYS = new Set(["about", "visit", "hospitality", "prayer"]);

// Reserved keys cannot be used for new pages because they collide with
// existing top-level routes or admin paths. The dynamic public renderer
// lives at /p/$pageKey so other top-level routes stay free.
const RESERVED_KEYS = new Set([
  "about",
  "visit",
  "hospitality",
  "prayer",
  "admin",
  "login",
  "menu",
  "events",
  "index",
  "home",
  "sitemap.xml",
  "p",
]);

const KEY_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$/;

function PagesAdmin() {
  const [rows, setRows] = useState<StaticPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteRow, setDeleteRow] = useState<StaticPage | null>(null);

  const load = async () => {
    setLoading(true);
    // Order by navigation order first so the admin list mirrors the public
    // header/footer order. Pages excluded from navigation fall to the end,
    // grouped by their internal label.
    const { data, error } = await supabase
      .from("static_pages")
      .select("id, page_key, internal_label, title_en, title_sl, published, show_in_navigation, nav_order")
      .order("show_in_navigation", { ascending: false })
      .order("nav_order")
      .order("internal_label")
      .limit(50);
    if (error) toast.error(error.message);
    else setRows((data as unknown as StaticPage[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const togglePublished = async (p: StaticPage) => {
    const { error } = await supabase
      .from("static_pages")
      .update({ published: !p.published })
      .eq("id", p.id);
    if (error) toast.error(error.message);
    else load();
  };

  const toggleShowInNav = async (p: StaticPage) => {
    const next = !p.show_in_navigation;
    // When enabling, drop the page at the end of the current nav order so it
    // doesn't silently jump above existing items.
    let nextOrder = p.nav_order;
    if (next) {
      const maxOrder = rows
        .filter((r) => r.show_in_navigation && r.id !== p.id)
        .reduce((m, r) => Math.max(m, r.nav_order), 0);
      nextOrder = maxOrder + 10;
    }
    const { error } = await supabase
      .from("static_pages")
      .update({ show_in_navigation: next, nav_order: nextOrder })
      .eq("id", p.id);
    if (error) toast.error(error.message);
    else load();
  };

  const moveNav = async (p: StaticPage, direction: -1 | 1) => {
    const navRows = rows
      .filter((r) => r.show_in_navigation)
      .sort((a, b) => a.nav_order - b.nav_order);
    const idx = navRows.findIndex((r) => r.id === p.id);
    const swapIdx = idx + direction;
    if (idx < 0 || swapIdx < 0 || swapIdx >= navRows.length) return;
    const other = navRows[swapIdx];
    // Swap nav_order values
    const { error: e1 } = await supabase
      .from("static_pages")
      .update({ nav_order: other.nav_order })
      .eq("id", p.id);
    const { error: e2 } = await supabase
      .from("static_pages")
      .update({ nav_order: p.nav_order })
      .eq("id", other.id);
    if (e1 || e2) toast.error((e1 ?? e2)!.message);
    else load();
  };

  const confirmDelete = async () => {
    if (!deleteRow) return;
    if (BUILT_IN_KEYS.has(deleteRow.page_key)) {
      toast.error("Built-in pages cannot be deleted.");
      setDeleteRow(null);
      return;
    }
    // sections cascade via FK
    const { error } = await supabase
      .from("static_pages")
      .delete()
      .eq("id", deleteRow.id);
    setDeleteRow(null);
    if (error) toast.error(error.message);
    else {
      toast.success("Page deleted");
      load();
    }
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Static pages</h1>
          <p className="text-sm text-muted-foreground">
            Edit the content of public informational pages. Open a page to
            reorder, hide or rewrite its sections. The order below controls
            where each page appears in the public header and footer menus.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1.5 size-4" /> Add page
        </Button>
      </header>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Page</th>
              <th className="px-3 py-2 font-medium">Key</th>
              <th className="px-3 py-2 font-medium">Title (EN)</th>
              <th className="px-3 py-2 font-medium">Visible</th>
              <th className="px-3 py-2 font-medium">In navigation</th>
              <th className="px-3 py-2 font-medium">Order</th>
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
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                  No pages yet.
                </td>
              </tr>
            )}
            {(() => {
              const navRows = rows
                .filter((r) => r.show_in_navigation)
                .sort((a, b) => a.nav_order - b.nav_order);
              return rows.map((p) => {
                const isBuiltIn = BUILT_IN_KEYS.has(p.page_key);
                const publicHref = isBuiltIn ? `/${p.page_key}` : `/p/${p.page_key}`;
                const navIdx = navRows.findIndex((r) => r.id === p.id);
                const inNav = navIdx >= 0;
                return (
                  <tr key={p.id}>
                    <td className="px-3 py-2 font-medium">
                      <span className="inline-flex items-center gap-2">
                        <FileText className="size-4 text-muted-foreground" />
                        {p.internal_label}
                        {isBuiltIn && (
                          <Badge variant="outline" className="text-[10px]">
                            built-in
                          </Badge>
                        )}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant="outline">{p.page_key}</Badge>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{p.title_en}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={p.published}
                          onCheckedChange={() => togglePublished(p)}
                        />
                        {p.published ? (
                          <Badge variant="secondary">Live</Badge>
                        ) : (
                          <Badge variant="outline">Hidden</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={p.show_in_navigation}
                          onCheckedChange={() => toggleShowInNav(p)}
                          disabled={!p.published && !p.show_in_navigation}
                          title={
                            !p.published
                              ? "Page must be Live before it can appear in navigation"
                              : "Show in header and footer menus"
                          }
                        />
                        {inNav && p.published ? (
                          <Badge variant="secondary">In menus</Badge>
                        ) : (
                          <Badge variant="outline">Off</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={!inNav || navIdx === 0}
                          onClick={() => moveNav(p, -1)}
                          title="Move up in navigation"
                        >
                          <ArrowUp className="size-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={!inNav || navIdx === navRows.length - 1}
                          onClick={() => moveNav(p, 1)}
                          title="Move down in navigation"
                        >
                          <ArrowDown className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button asChild size="sm" variant="ghost" title="View public page">
                          <a href={publicHref} target="_blank" rel="noreferrer">
                            <ExternalLink className="size-3.5" />
                          </a>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link
                            to="/admin/pages/$pageKey"
                            params={{ pageKey: p.page_key }}
                          >
                            <Pencil className="mr-1.5 size-3.5" />
                            Edit sections
                          </Link>
                        </Button>
                        {!isBuiltIn && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteRow(p)}
                            title="Delete page"
                          >
                            <Trash2 className="size-3.5 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        The page key (e.g. <code>about</code>) is the stable internal routing key
        and is not editable after creation. <strong>Live</strong> controls public
        availability — <code>/&lt;built-in&gt;</code> for built-in pages and{" "}
        <code>/p/&lt;page-key&gt;</code> for custom pages. <strong>In
        navigation</strong> controls whether the page appears in the public
        header and footer menus; both menus share the same order set here.
        Section reordering inside a page lives in the page editor.
      </p>

      <CreatePageDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        existingKeys={rows.map((r) => r.page_key)}
        onCreated={load}
      />

      <AlertDialog open={!!deleteRow} onOpenChange={(o) => !o && setDeleteRow(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this page?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the page and all of its sections. This cannot be undone.
            </AlertDialogDescription>
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

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function CreatePageDialog({
  open,
  onOpenChange,
  existingKeys,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existingKeys: string[];
  onCreated: () => void;
}) {
  const [label, setLabel] = useState("");
  const [pageKey, setPageKey] = useState("");
  const [keyTouched, setKeyTouched] = useState(false);
  const [titleEn, setTitleEn] = useState("");
  const [titleSl, setTitleSl] = useState("");
  const [published, setPublished] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      setLabel("");
      setPageKey("");
      setKeyTouched(false);
      setTitleEn("");
      setTitleSl("");
      setPublished(false);
      setBusy(false);
    }
  }, [open]);

  const handleLabelChange = (v: string) => {
    setLabel(v);
    if (!keyTouched) setPageKey(slugify(v));
  };

  const keyError = (() => {
    if (!pageKey) return null;
    if (!KEY_REGEX.test(pageKey)) {
      return "Use lowercase letters, numbers and hyphens (2–60 chars).";
    }
    if (RESERVED_KEYS.has(pageKey)) return "This key is reserved.";
    if (existingKeys.includes(pageKey)) return "This key is already used.";
    return null;
  })();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return toast.error("Internal label is required");
    if (!pageKey || keyError) return toast.error(keyError ?? "Invalid page key");
    if (!titleEn.trim() || !titleSl.trim()) {
      return toast.error("Both EN and SL titles are required");
    }
    setBusy(true);
    const { error } = await supabase.from("static_pages").insert({
      page_key: pageKey,
      internal_label: label.trim(),
      title_en: titleEn.trim(),
      title_sl: titleSl.trim(),
      published,
    } as never);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Page created");
    onOpenChange(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a new page</DialogTitle>
          <DialogDescription>
            Creates an empty page you can fill with sections in the editor. The page
            key becomes the stable URL at <code>/p/&lt;page-key&gt;</code> and cannot
            be changed later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Internal label</Label>
            <Input
              value={label}
              onChange={(e) => handleLabelChange(e.target.value)}
              placeholder="e.g. Volunteer with us"
            />
          </div>
          <div>
            <Label>Page key / slug</Label>
            <Input
              value={pageKey}
              onChange={(e) => {
                setKeyTouched(true);
                setPageKey(e.target.value.toLowerCase().replace(/\s+/g, "-"));
              }}
              placeholder="volunteer"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Lowercase letters, numbers and hyphens. Public URL:{" "}
              <code>/p/{pageKey || "<page-key>"}</code>
            </p>
            {keyError && <p className="mt-1 text-xs text-destructive">{keyError}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Title (EN)</Label>
              <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
            </div>
            <div>
              <Label>Title (SL)</Label>
              <Input value={titleSl} onChange={(e) => setTitleSl(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={published} onCheckedChange={setPublished} />
            <span className="text-sm text-muted-foreground">
              {published ? "Visible immediately" : "Create as hidden (recommended)"}
            </span>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !!keyError}>
              Create page
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
