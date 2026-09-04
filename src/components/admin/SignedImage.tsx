import { useEffect, useState } from "react";
import { getSignedMediaUrl, resolveMediaUrl } from "@/lib/admin/storage";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export function SignedImage({
  path,
  className,
  alt = "",
  width = 800,
  quality = 80,
}: {
  path: string | null | undefined;
  className?: string;
  alt?: string;
  width?: number;
  quality?: number;
}) {
  const [url, setUrl] = useState<string | null>(() => resolveMediaUrl(path));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    let active = true;
    const direct = resolveMediaUrl(path);
    if (direct) {
      setUrl(direct);
    }
    getSignedMediaUrl(path, { width, quality }).then((u) => {
      if (active && u) setUrl(u);
    });
    return () => {
      active = false;
    };
  }, [path, width, quality]);

  if (!path) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-md bg-muted text-xs text-muted-foreground",
          className,
        )}
      >
        No image
      </div>
    );
  }

  if (hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-md bg-muted text-xs text-muted-foreground p-1 text-center",
          className,
        )}
      >
        Image unavailable
      </div>
    );
  }

  if (!url) return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;

  const handleImgError = () => {
    if (path && !path.startsWith("http://") && !path.startsWith("https://") && !path.startsWith("data:")) {
      const clean = path.startsWith("media/") ? path.slice(6) : path;
      const fallbackUrl = supabase.storage.from("media").getPublicUrl(clean).data.publicUrl;
      if (url !== fallbackUrl) {
        setUrl(fallbackUrl);
        return;
      }
    }
    setHasError(true);
  };

  return (
    <img
      src={url}
      alt={alt}
      className={cn("rounded-md object-cover", className)}
      onError={handleImgError}
    />
  );
}
