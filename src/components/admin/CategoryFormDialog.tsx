import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export interface CategoryRow {
  id: string;
  name_en: string;
  name_sl: string;
  description_en: string | null;
  description_sl: string | null;
  sort_order: number;
  published: boolean;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  title,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: Partial<CategoryRow> | null;
  onSubmit: (values: Omit<CategoryRow, "id">) => Promise<void>;
  title: string;
}) {
  const [busy, setBusy] = useState(false);
  const [v, setV] = useState({
    name_en: initial?.name_en ?? "",
    name_sl: initial?.name_sl ?? "",
    description_en: initial?.description_en ?? "",
    description_sl: initial?.description_sl ?? "",
    sort_order: initial?.sort_order ?? 0,
    published: initial?.published ?? true,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!v.name_en.trim() || !v.name_sl.trim()) return;
    setBusy(true);
    try {
      await onSubmit({
        name_en: v.name_en.trim(),
        name_sl: v.name_sl.trim(),
        description_en: v.description_en.trim() || null,
        description_sl: v.description_sl.trim() || null,
        sort_order: Number(v.sort_order) || 0,
        published: v.published,
      });
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
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
                rows={2}
                value={v.description_en}
                onChange={(e) => setV({ ...v, description_en: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description (SL)</Label>
              <Textarea
                rows={2}
                value={v.description_sl}
                onChange={(e) => setV({ ...v, description_sl: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Sort order</Label>
              <Input
                type="number"
                value={v.sort_order}
                onChange={(e) => setV({ ...v, sort_order: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch checked={v.published} onCheckedChange={(c) => setV({ ...v, published: c })} />
              <Label>Published</Label>
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
