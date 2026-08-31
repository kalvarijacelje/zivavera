import { useEffect, useState } from "react";
import { getSignedMediaUrl } from "@/lib/admin/storage";
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
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    getSignedMediaUrl(path, { width, quality }).then((u) => active && setUrl(u));
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
  if (!url) return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
  return <img src={url} alt={alt} className={cn("rounded-md object-cover", className)} />;
}
