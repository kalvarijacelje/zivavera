import { createServerFn } from "@tanstack/react-start";
import { getRequestIP, getRequestHeader } from "@tanstack/react-start/server";
import { createHash } from "crypto";

export type SubmitPrayerInput = {
  message: string;
  name?: string | null;
  contact?: string | null;
  request_type: "prayer" | "spiritual_question";
  visibility_choice: "private_staff" | "public_if_approved";
  is_anonymous: boolean;
  /** Honeypot — must be empty. Bots fill this hidden field. */
  website?: string;
  /** Time the form was rendered (ms epoch). Submissions faster than 2s are bot-like. */
  rendered_at?: number;
};

const MAX_MESSAGE = 4000;
const MIN_MESSAGE = 2;
const MAX_NAME = 100;
const MAX_CONTACT = 200;

// Per-IP rate limits
const SHORT_WINDOW_SEC = 60;
const SHORT_WINDOW_MAX = 1;
const HOUR_WINDOW_SEC = 60 * 60;
const HOUR_WINDOW_MAX = 5;

function hashIp(ip: string): string {
  const salt = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "zivavera-prayer-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

export const submitPrayerRequest = createServerFn({ method: "POST" })
  .inputValidator((input: SubmitPrayerInput) => input)
  .handler(async ({ data }) => {
    // 1. Honeypot — if the hidden "website" field is filled, silently accept.
    if (data.website && data.website.trim().length > 0) {
      return { ok: true as const };
    }

    // 2. Submission too fast (< 2s after render) — likely bot.
    if (data.rendered_at && Date.now() - data.rendered_at < 2000) {
      return { ok: true as const };
    }

    // 3. Validate payload.
    const message = (data.message ?? "").trim();
    if (message.length < MIN_MESSAGE) {
      throw new Error("Message is required");
    }
    if (message.length > MAX_MESSAGE) {
      throw new Error("Message is too long");
    }
    const name = data.is_anonymous ? null : (data.name ?? "").trim().slice(0, MAX_NAME) || null;
    const contact = data.is_anonymous
      ? null
      : (data.contact ?? "").trim().slice(0, MAX_CONTACT) || null;
    if (!["prayer", "spiritual_question"].includes(data.request_type)) {
      throw new Error("Invalid request type");
    }
    if (!["private_staff", "public_if_approved"].includes(data.visibility_choice)) {
      throw new Error("Invalid visibility");
    }

    // 4. Rate limit by hashed IP.
    const ip =
      getRequestIP({ xForwardedFor: true }) ||
      getRequestHeader("cf-connecting-ip") ||
      "unknown";
    const ipHash = hashIp(ip);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const shortCutoff = new Date(Date.now() - SHORT_WINDOW_SEC * 1000).toISOString();
    const hourCutoff = new Date(Date.now() - HOUR_WINDOW_SEC * 1000).toISOString();

    const { count: recentCount } = await supabaseAdmin
      .from("prayer_requests")
      .select("id", { count: "exact", head: true })
      .eq("submitter_ip_hash", ipHash)
      .gte("created_at", shortCutoff);

    if ((recentCount ?? 0) >= SHORT_WINDOW_MAX) {
      throw new Error(
        "You just submitted a request — please wait a moment before sending another.",
      );
    }

    const { count: hourCount } = await supabaseAdmin
      .from("prayer_requests")
      .select("id", { count: "exact", head: true })
      .eq("submitter_ip_hash", ipHash)
      .gte("created_at", hourCutoff);

    if ((hourCount ?? 0) >= HOUR_WINDOW_MAX) {
      throw new Error(
        "Too many requests from your location today. Please try again later.",
      );
    }

    // 5. Insert (force safe fields).
    const { error } = await supabaseAdmin.from("prayer_requests").insert({
      message,
      name,
      contact,
      request_type: data.request_type,
      visibility_choice: data.visibility_choice,
      is_anonymous: !!data.is_anonymous,
      status: "new",
      moderator_note: null,
      submitter_ip_hash: ipHash,
    } as never);

    if (error) {
      console.error("prayer_requests insert failed", error);
      throw new Error("Could not save your request. Please try again.");
    }

    return { ok: true as const };
  });
