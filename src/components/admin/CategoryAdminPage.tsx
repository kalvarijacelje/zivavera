import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, ArrowUp, ArrowDown } from "lucide-react";
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
import { CategoryFormDialog, type CategoryRow } from "./CategoryFormDialog";

export function CategoryAdminPage({
  table,
  title,
  description,
}: {
  table: "menu_categories" | "event_categories";
  title: string;
  description: string;
}) {
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("sort_order")
      .order("name_en");
    if (error) toast.error(error.message);
    else setRows((data as CategoryRow[]) ?? []);
    setLoading(false);
  }, [table]);

  useEffect(() => {
    load();
  }, [load]);

  const togglePublished = async (row: CategoryRow) => {
    const { error } = await supabase.from(table).update({ published: !row.published }).eq("id", row.id);
    if (error) toast.error(error.message);
    else load();
  };

  const move = async (row: CategoryRow, dir: -1 | 1) => {
    const idx = rows.findIndex((r) => r.id === row.id);
    const other = rows[idx + dir];
    if (!other) return;
    await Promise.all([
      supabase.from(table).update({ sort_order: other.sort_order }).eq("id", row.id),
      supabase.from(table).update({ sort_order: row.sort_order }).eq("id", other.id),
    ]);
    load();
  };

  const save = async (values: Omit<CategoryRow, "id">) => {
    if (editing) {
      const { error } = await supabase.from(table).update(values).eq("id", editing.id);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Saved");
    } else {
      const { error } = await supabase.from(table).insert(values);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Created");
    }
    load();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from(table).delete().eq("id", deleteId);
    setDeleteId(null);
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
          <h1 className="font-display text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-1.5 size-4" /> New category
        </Button>
      </header>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Order</th>
              <th className="px-3 py-2 font-medium">Name (EN)</th>
              <th className="px-3 py-2 font-medium">Name (SL)</th>
              <th className="px-3 py-2 font-medium">Published</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                  No categories yet.
                </td>
              </tr>
            )}
            {rows.map((row, i) => (
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
                      disabled={i === rows.length - 1}
                      onClick={() => move(row, 1)}
                    >
                      <ArrowDown className="size-3.5" />
                    </Button>
                  </div>
                </td>
                <td className="px-3 py-2 font-medium">{row.name_en}</td>
                <td className="px-3 py-2">{row.name_sl}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Switch checked={row.published} onCheckedChange={() => togglePublished(row)} />
                    {row.published ? <Badge variant="secondary">Live</Badge> : <Badge variant="outline">Draft</Badge>}
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
                  <Button size="icon" variant="ghost" onClick={() => setDeleteId(row.id)}>
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {dialogOpen && (
        <CategoryFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initial={editing}
          title={editing ? "Edit category" : "New category"}
          onSubmit={save}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              Items assigned to it will become uncategorized. This cannot be undone.
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
