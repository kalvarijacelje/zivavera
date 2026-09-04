import { useState, useEffect } from "react";
import { Upload, X, Images, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignedImage } from "./SignedImage";
import { MediaPickerDialog } from "./MediaPickerDialog";
import { uploadMedia, deleteMedia, resolveMediaUrl, type MediaFolder } from "@/lib/admin/storage";
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
  const [statusText, setStatusText] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Clean up object URL when unmounted or changed
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Image must be under 20 MB");
      return;
    }

    // Instant local preview for immediate visual feedback
    const localUrl = URL.createObjectURL(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(localUrl);
    setBusy(true);

    try {
      const newPath = await uploadMedia(file, folder, (status) => setStatusText(status));
      if (value) await deleteMedia(value).catch(() => {});
      onChange(newPath);
      setPreviewUrl(null);
    } catch (err) {
      setPreviewUrl(null);
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      setStatusText("");
    }
  };

  const handleRemove = async () => {
    if (!value && !previewUrl) return;
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setBusy(true);
    onChange(null);
    setBusy(false);
  };

  const handlePickExisting = (path: string) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    onChange(path);
  };

  return (
    <div className="flex items-start gap-4">
      {previewUrl ? (
        <div className="relative size-24 shrink-0 rounded-md overflow-hidden border border-border bg-muted">
          <img src={previewUrl} alt="Preview" className="size-full object-cover" />
          {busy && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center p-1 text-center">
              <Loader2 className="size-4 animate-spin text-white mb-1" />
              <span className="text-[10px] text-white font-medium leading-tight">
                {statusText || "Uploading..."}
              </span>
            </div>
          )}
        </div>
      ) : (
        <SignedImage path={value} className="size-24 shrink-0" />
      )}
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
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Cloudflare R2
              </span>
              <a
                href={resolveMediaUrl(value) || "#"}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground hover:underline font-mono break-all inline-flex items-center gap-1"
                title="View directly on Cloudflare R2 CDN"
              >
                <span>{value}</span>
                <ExternalLink className="size-3 shrink-0 opacity-60" />
              </a>
            </div>
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
