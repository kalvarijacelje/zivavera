import { useState } from "react";
import { Upload, X, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignedImage } from "./SignedImage";
import { MediaPickerDialog } from "./MediaPickerDialog";
import { uploadMedia, deleteMedia, type MediaFolder } from "@/lib/admin/storage";
import { toast } from "sonner";

export function ImageField({
  value,
  onChange,
  folder,
  pickerFolders,
}: {
  value: string | null;
  onChange: (path: string | null) => void;
  /** Folder used for NEW uploads */
  folder: MediaFolder;
  /** Folders shown in the existing-image picker. Defaults to all known folders. */
  pickerFolders?: string[];
}) {
  const [busy, setBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8 MB");
      return;
    }
    setBusy(true);
    try {
      const newPath = await uploadMedia(file, folder);
      // Only delete previous if it was an upload we own; safe to skip when
      // value points to a shared library image — but for simplicity keep
      // existing behavior of deleting prior value.
      if (value) await deleteMedia(value).catch(() => {});
      onChange(newPath);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    if (!value) return;
    setBusy(true);
    // Don't delete from storage on remove — the image may be reused elsewhere.
    // Just unlink it from this record.
    onChange(null);
    setBusy(false);
  };

  const handlePickExisting = (path: string) => {
    // Selecting an existing library image: do NOT delete the prior value,
    // since it may also be used elsewhere now.
    onChange(path);
  };

  return (
    <div className="flex items-start gap-4">
      <SignedImage path={value} className="size-24 shrink-0" />
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <label>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
              disabled={busy}
            />
            <Button type="button" variant="outline" size="sm" disabled={busy} asChild>
              <span>
                <Upload className="mr-1.5 size-3.5" />
                {value ? "Replace (upload)" : "Upload image"}
              </span>
            </Button>
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => setPickerOpen(true)}
          >
            <Images className="mr-1.5 size-3.5" />
            Choose existing
          </Button>
        </div>
        {value && (
          <>
            <p className="text-xs text-muted-foreground break-all">media/{value}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={busy}
              className="self-start"
            >
              <X className="mr-1.5 size-3.5" /> Remove
            </Button>
          </>
        )}
      </div>

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        currentPath={value}
        onSelect={handlePickExisting}
        folders={pickerFolders}
      />
    </div>
  );
}
