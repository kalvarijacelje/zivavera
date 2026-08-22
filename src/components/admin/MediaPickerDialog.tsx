import { useEffect, useMemo, useState } from "react";
import { Check, FolderOpen, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { SignedImage } from "./SignedImage";

const BUCKET = "media";

// Folders we expect to scan. New ones added later automatically appear if
// passed via the `folders` prop.
const DEFAULT_FOLDERS = ["homepage", "pages", "menu", "events"];

type MediaItem = {
  path: string;
  folder: string;
  name: string;
  updatedAt: string | null;
};

export function MediaPickerDialog({
  open,
  onOpenChange,
  currentPath,
  onSelect,
  folders = DEFAULT_FOLDERS,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentPath: string | null | undefined;
  onSelect: (path: string) => void;
  folders?: string[];
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [folderFilter, setFolderFilter] = useState<string>("all");
  const [picked, setPicked] = useState<string | null>(currentPath ?? null);

  useEffect(() => {
    if (!open) return;
    setPicked(currentPath ?? null);
    setLoading(true);
    (async () => {
      const all: MediaItem[] = [];
      for (const folder of folders) {
        const { data, error } = await supabase.storage
          .from(BUCKET)
          .list(folder, { limit: 1000, sortBy: { column: "updated_at", order: "desc" } });
        if (error || !data) continue;
        for (const f of data) {
          if (!f.name || f.name.endsWith("/")) continue;
          // Skip folder placeholders Supabase sometimes returns
          if ((f as { id?: string }).id == null && !f.metadata) continue;
          all.push({
            path: `${folder}/${f.name}`,
            folder,
            name: f.name,
            updatedAt: f.updated_at ?? f.created_at ?? null,
          });
        }
      }
      setItems(all);
      setLoading(false);
    })();
  }, [open, currentPath, folders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (folderFilter !== "all" && i.folder !== folderFilter) return false;
      if (!q) return true;
      return i.path.toLowerCase().includes(q);
    });
  }, [items, query, folderFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, MediaItem[]>();
    for (const it of filtered) {
      if (!map.has(it.folder)) map.set(it.folder, []);
      map.get(it.folder)!.push(it);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const confirm = () => {
    if (!picked) return;
    onSelect(picked);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose an existing image</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-48">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by filename or path…"
              className="pl-8"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant={folderFilter === "all" ? "default" : "outline"}
              onClick={() => setFolderFilter("all")}
            >
              All
            </Button>
            {folders.map((f) => (
              <Button
                key={f}
                type="button"
                size="sm"
                variant={folderFilter === f ? "default" : "outline"}
                onClick={() => setFolderFilter(f)}
              >
                <FolderOpen className="mr-1.5 size-3.5" />
                {f}
              </Button>
            ))}
          </div>
        </div>

        <div className="-mx-1 flex-1 overflow-y-auto px-1">
          {loading && (
            <p className="py-10 text-center text-sm text-muted-foreground">Loading library…</p>
          )}
          {!loading && filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No images found. Upload one first.
            </p>
          )}
          {!loading &&
            grouped.map(([folder, list]) => (
              <section key={folder} className="mb-5">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    media / {folder}
                  </h3>
                  <Badge variant="outline">{list.length}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {list.map((it) => {
                    const isSelected = picked === it.path;
                    const isCurrent = currentPath === it.path;
                    return (
                      <button
                        key={it.path}
                        type="button"
                        onClick={() => setPicked(it.path)}
                        className={cn(
                          "group relative overflow-hidden rounded-md border bg-card text-left transition-shadow hover:shadow-md",
                          isSelected
                            ? "border-primary ring-2 ring-primary"
                            : "border-border",
                        )}
                        title={it.path}
                      >
                        <SignedImage
                          path={it.path}
                          alt={it.name}
                          className="aspect-square w-full rounded-none"
                        />
                        {isSelected && (
                          <span className="absolute right-1.5 top-1.5 inline-flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                            <Check className="size-3.5" />
                          </span>
                        )}
                        <div className="space-y-0.5 p-2">
                          <p className="truncate text-xs font-medium" title={it.name}>
                            {it.name}
                          </p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            media/{it.folder}
                          </p>
                          {isCurrent && (
                            <Badge variant="secondary" className="mt-1 text-[10px]">
                              Currently selected
                            </Badge>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
        </div>

        <DialogFooter className="border-t pt-3">
          <p className="mr-auto text-xs text-muted-foreground">
            {picked ? `Selected: ${picked}` : "No image selected"}
          </p>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={confirm} disabled={!picked}>
            Use this image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
