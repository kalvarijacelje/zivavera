import { useEffect, useState } from "react";
import { getSignedMediaUrl } from "@/lib/admin/storage";
import { cn } from "@/lib/utils";

export function SignedImage({
  path,
  className,
  alt = "",
}: {
  path: string | null | undefined;
  className?: string;
  alt?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    getSignedMediaUrl(path).then((u) => active && setUrl(u));
    return () => {
      active = false;
    };
  }, [path]);

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
