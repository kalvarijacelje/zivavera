import { supabase } from "@/integrations/supabase/client";

const BUCKET = "media";

export type MediaFolder = "menu" | "events" | "homepage" | "pages";

export async function uploadMedia(file: File, folder: MediaFolder): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  return path;
}

export async function deleteMedia(path: string | null | undefined) {
  if (!path) return;
  await supabase.storage.from(BUCKET).remove([path]);
}

const signedCache = new Map<string, { url: string; expires: number }>();

export async function getSignedMediaUrl(path: string | null | undefined): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    return path;
  }
  const now = Date.now();
  const cached = signedCache.get(path);
  if (cached && cached.expires > now + 60_000) return cached.url;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
  if (error || !data) {
    signedCache.delete(path);
    return null;
  }
  signedCache.set(path, { url: data.signedUrl, expires: now + 55 * 60_000 });
  return data.signedUrl;
}

export function invalidateSignedMediaUrl(path: string | null | undefined) {
  if (!path) return;
  signedCache.delete(path);
}
