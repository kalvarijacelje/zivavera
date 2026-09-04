import { supabase } from "@/integrations/supabase/client";
import { optimizeImageFile } from "@/lib/imageOptimizer";
import { getMediaUrl } from "@/lib/cdn";
import { directUploadToR2 } from "./r2DirectUpload";

const BUCKET = "media";

export type MediaFolder = "menu" | "events" | "homepage" | "pages";

export async function uploadMedia(
  file: File,
  folder: MediaFolder,
  onProgress?: (status: string) => void
): Promise<string> {
  let fileToUpload = file;
  
  onProgress?.("Shrinking and optimizing...");
  // Automatically optimize images client-side before upload (<400KB, max 1920px, WebP)
  if (file.type.startsWith("image/") && !file.type.includes("svg") && !file.type.includes("gif")) {
    try {
      fileToUpload = await optimizeImageFile(file, {
        maxWidthOrHeight: 1920,
        maxSizeMB: 0.4,
        mimeType: "image/webp",
      });
    } catch (err) {
      console.warn("Client-side optimization fallback to original:", err);
      fileToUpload = file;
    }
  }

  const ext = fileToUpload.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  onProgress?.("Uploading to Cloudflare R2...");
  // 1. Upload to Cloudflare R2 bucket (kck-media)
  try {
    const r2Ok = await directUploadToR2(fileToUpload, path, fileToUpload.type);
    if (r2Ok) {
      await directUploadToR2(fileToUpload, `media/${path}`, fileToUpload.type);
    }
  } catch (r2Err) {
    console.warn("Direct R2 upload background warning:", r2Err);
  }

  onProgress?.("Saving backup...");
  // 2. Upload to Supabase Storage (maintains 100% full compatibility)
  const { error } = await supabase.storage.from(BUCKET).upload(path, fileToUpload, {
    cacheControl: "3600",
    upsert: false,
    contentType: fileToUpload.type,
  });
  if (error) {
    console.warn("Supabase storage fallback error:", error);
  }

  return path;
}

export async function deleteMedia(path: string | null | undefined) {
  if (!path) return;
  await supabase.storage.from(BUCKET).remove([path]);
}

const signedCache = new Map<string, { url: string; expires: number }>();

export interface MediaUrlOptions {
  width?: number;
  quality?: number;
  resize?: 'cover' | 'contain';
}

/**
 * Synchronously resolves a media path to a full public URL without any network delay.
 * Uses Cloudflare R2 CDN with automatic fallback.
 */
export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/") || path.startsWith("data:")) {
    return path;
  }
  
  // Return Cloudflare R2 CDN URL
  const cdnUrl = getMediaUrl(path);
  if (cdnUrl) return cdnUrl;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function getSignedMediaUrl(
  path: string | null | undefined,
  options?: MediaUrlOptions
): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    return path;
  }
  return resolveMediaUrl(path);
}

export function invalidateSignedMediaUrl(path: string | null | undefined) {
  if (!path) return;
  for (const k of signedCache.keys()) {
    if (k === path || k.startsWith(`${path}?`)) {
      signedCache.delete(k);
    }
  }
}
