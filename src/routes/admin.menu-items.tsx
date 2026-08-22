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

export const Route = createFileRoute("/admin/menu-items")({
  component: MenuItemsPage,
});

type Cat = { id: string; name_en: string };
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
  published: boolean;
};

const empty: Omit<Item, "id"> = {
  category_id: null,
  name_en: "",
  name_sl: "",
  description_en: "",
  description_sl: "",
  image_path: null,
  featured: false,
  available: true,
  sort_order: 0,
  published: true,
};

function MenuItemsPage() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Item | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteRow, setDeleteRow] = useState<Item | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [cRes, iRes] = await Promise.all([
      supabase.from("menu_categories").select("id, name_en").order("sort_order"),
      supabase.from("menu_items").select("*").order("sort_order").order("name_en"),
    ]);
    if (cRes.error) toast.error(cRes.error.message);
    if (iRes.error) toast.error(iRes.error.message);
    setCats((cRes.data as Cat[]) ?? []);
    setItems((iRes.data as Item[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = filter === "all" ? items : items.filter((i) => i.category_id === filter);

  const move = async (row: Item, dir: -1 | 1) => {
    const list = filtered;
    const idx = list.findIndex((r) => r.id === row.id);
    const other = list[idx + dir];
    if (!other) return;
    await Promise.all([
      supabase.from("menu_items").update({ sort_order: other.sort_order }).eq("id", row.id),
      supabase.from("menu_items").update({ sort_order: row.sort_order }).eq("id", other.id),
    ]);
    load();
  };

  const toggle = async (row: Item, field: "published" | "available" | "featured") => {
    const patch =
      field === "published" ? { published: !row.published } :
      field === "available" ? { available: !row.available } :
      { featured: !row.featured };
    const { error } = await supabase.from("menu_items").update(patch).eq("id", row.id);
    if (error) toast.error(error.message);
    else load();
  };

  const confirmDelete = async () => {
    if (!deleteRow) return;
    await deleteMedia(deleteRow.image_path).catch(() => {});
    const { error } = await supabase.from("menu_items").delete().eq("id", deleteRow.id);
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
          <h1 className="font-display text-2xl font-semibold">Menu items</h1>
          <p className="text-sm text-muted-foreground">
            Drinks and food sold at the café. Each item belongs to one category.
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
            <Plus className="mr-1.5 size-4" /> New item
          </Button>
        </div>
      </header>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Order</th>
              <th className="px-3 py-2 font-medium">Image</th>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Category</th>
              <th className="px-3 py-2 font-medium">Flags</th>
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
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                  No items.
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
                    <div className="font-medium">{row.name_en}</div>
                    <div className="text-xs text-muted-foreground">{row.name_sl}</div>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{cat?.name_en ?? "—"}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button onClick={() => toggle(row, "published")}>
                        {row.published ? <Badge variant="secondary">Live</Badge> : <Badge variant="outline">Draft</Badge>}
                      </button>
                      <button onClick={() => toggle(row, "available")}>
                        <Badge variant={row.available ? "default" : "outline"}>
                          {row.available ? "Available" : "Off"}
                        </Badge>
                      </button>
                      {row.featured && (
                        <button onClick={() => toggle(row, "featured")}>
                          <Badge>★ Featured</Badge>
                        </button>
                      )}
                      {!row.featured && (
                        <button onClick={() => toggle(row, "featured")}>
                          <Badge variant="outline">Feature</Badge>
                        </button>
                      )}
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
        <MenuItemDialog
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
            <AlertDialogTitle>Delete this menu item?</AlertDialogTitle>
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

function MenuItemDialog({
  open,
  onOpenChange,
  initial,
  cats,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: Item | null;
  cats: Cat[];
  onSaved: () => void;
}) {
  const [v, setV] = useState<Omit<Item, "id">>(initial ? { ...initial } : empty);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!v.name_en.trim() || !v.name_sl.trim()) {
      toast.error("Name (EN) and (SL) required");
      return;
    }
    setBusy(true);
    const payload = {
      ...v,
      name_en: v.name_en.trim(),
      name_sl: v.name_sl.trim(),
      description_en: v.description_en?.trim() || null,
      description_sl: v.description_sl?.trim() || null,
      sort_order: Number(v.sort_order) || 0,
    };
    const res = initial
      ? await supabase.from("menu_items").update(payload).eq("id", initial.id)
      : await supabase.from("menu_items").insert(payload);
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit menu item" : "New menu item"}</DialogTitle>
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
              <Label>Name (EN) *</Label>
              <Input value={v.name_en} onChange={(e) => setV({ ...v, name_en: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Name (SL) *</Label>
              <Input value={v.name_sl} onChange={(e) => setV({ ...v, name_sl: e.target.value })} required />
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
          </div>
          <div className="space-y-1.5">
            <Label>Image</Label>
            <ImageField value={v.image_path} onChange={(p) => setV({ ...v, image_path: p })} folder="menu" />
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
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
              <Switch checked={v.available} onCheckedChange={(c) => setV({ ...v, available: c })} />
              <Label>Available</Label>
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
