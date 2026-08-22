import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  CheckCircle2,
  EyeOff,
  Heart,
  HelpCircle,
  Lock,
  Globe,
  Info,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/prayer-requests")({
  component: PrayerRequestsAdmin,
});

type RequestType = "prayer" | "spiritual_question";
type Visibility = "private_staff" | "public_if_approved";
type Status = "new" | "approved_public" | "private_only" | "archived";

type Row = {
  id: string;
  created_at: string;
  name: string | null;
  contact: string | null;
  message: string;
  request_type: RequestType;
  visibility_choice: Visibility;
  is_anonymous: boolean;
  status: Status;
  moderator_note: string | null;
  public_response: string | null;
  public_response_at: string | null;
};

const STATUS_FILTERS: { value: Status | "all"; label: string }[] = [
  { value: "new", label: "New" },
  { value: "approved_public", label: "Approved (public)" },
  { value: "private_only", label: "Private only" },
  { value: "archived", label: "Archived" },
  { value: "all", label: "All" },
];

function statusBadge(s: Status) {
  switch (s) {
    case "new":
      return (
        <Badge className="border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
          New — needs review
        </Badge>
      );
    case "approved_public":
      return (
        <Badge className="border-emerald-300 bg-emerald-100 text-emerald-900 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100">
          Approved · Public
        </Badge>
      );
    case "private_only":
      return (
        <Badge className="border-sky-300 bg-sky-100 text-sky-900 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-100">
          Private only
        </Badge>
      );
    case "archived":
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Archived
        </Badge>
      );
  }
}

function PrayerRequestsAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Status | "all">("new");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [responses, setResponses] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from("prayer_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data, error } = await q;
    if (error) toast.error(error.message);
    const list = (data as unknown as Row[]) ?? [];
    setRows(list);
    setNotes(Object.fromEntries(list.map((r) => [r.id, r.moderator_note ?? ""])));
    setResponses(
      Object.fromEntries(list.map((r) => [r.id, r.public_response ?? ""])),
    );
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    return {
      new: rows.filter((r) => r.status === "new").length,
      total: rows.length,
    };
  }, [rows]);

  const updateRow = async (row: Row, patch: Partial<Row>) => {
    setSavingId(row.id);
    const { error } = await supabase
      .from("prayer_requests")
      .update(patch as never)
      .eq("id", row.id);
    setSavingId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Updated");
    load();
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Prayer requests</h1>
          <p className="text-sm text-muted-foreground">
            Pastoral inbox for prayer requests and spiritual questions submitted
            from the public Prayer page. Nothing is published until you approve it.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="mr-1.5 size-4" />
            Refresh
          </Button>
        </div>
      </header>

      <aside className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">Moderation guidelines (internal)</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5">
              <li>Review every request carefully before approving for the public wall.</li>
              <li>Keep sensitive requests (health, family, finances, safety) private.</li>
              <li>Never publish identifying details that weren't clearly meant to be shared.</li>
              <li>Only requests marked <strong>Public OK</strong> by the submitter can be approved publicly.</li>
              <li>Moderator notes are private — never shown to the public.</li>
            </ul>
          </div>
        </div>
      </aside>

      <div className="text-xs text-muted-foreground">
        {loading ? "Loading…" : `${counts.total} shown · ${counts.new} new`}
      </div>

      <div className="space-y-3">
        {!loading && rows.length === 0 && (
          <div className="rounded-lg border border-dashed border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            No requests in this view.
          </div>
        )}
        {rows.map((row) => {
          const submittedName = row.is_anonymous
            ? "Anonymous"
            : row.name?.trim() || "(no name given)";
          const canGoPublic = row.visibility_choice === "public_if_approved";
          return (
            <article
              key={row.id}
              className="rounded-xl border border-border bg-card p-4 sm:p-5"
            >
              <header className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {row.request_type === "spiritual_question" ? (
                    <HelpCircle className="size-4 text-muted-foreground" />
                  ) : (
                    <Heart className="size-4 text-muted-foreground" />
                  )}
                  <span className="font-medium">{submittedName}</span>
                  {statusBadge(row.status)}
                  {canGoPublic ? (
                    <Badge variant="outline" className="gap-1">
                      <Globe className="size-3" /> Public OK
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <Lock className="size-3" /> Staff only
                    </Badge>
                  )}
                  {row.is_anonymous && (
                    <Badge variant="outline">Anonymous</Badge>
                  )}
                </div>
                <time className="text-xs text-muted-foreground">
                  {new Date(row.created_at).toLocaleString()}
                </time>
              </header>

              {(row.contact || (!row.is_anonymous && row.name)) && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {row.contact && (
                    <span className="mr-3">Contact: {row.contact}</span>
                  )}
                </div>
              )}

              <p className="mt-3 whitespace-pre-line text-pretty leading-relaxed text-foreground/90">
                {row.message}
              </p>

              <div className="mt-4">
                <label className="text-xs font-medium text-muted-foreground">
                  Moderator note (private — staff only)
                </label>
                <Textarea
                  rows={2}
                  value={notes[row.id] ?? ""}
                  onChange={(e) =>
                    setNotes((n) => ({ ...n, [row.id]: e.target.value }))
                  }
                  onBlur={() => {
                    const v = notes[row.id] ?? "";
                    if ((row.moderator_note ?? "") !== v) {
                      updateRow(row, { moderator_note: v || null });
                    }
                  }}
                  placeholder="Internal pastoral notes, follow-up intentions, contact log — never shown publicly."
                  className="mt-1"
                />
              </div>

              {row.request_type === "spiritual_question" && canGoPublic && (
                <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-3">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-primary">
                    <Globe className="size-3.5" />
                    Public response (shown beneath the question on the prayer wall)
                  </label>
                  <Textarea
                    rows={4}
                    value={responses[row.id] ?? ""}
                    onChange={(e) =>
                      setResponses((r) => ({ ...r, [row.id]: e.target.value }))
                    }
                    placeholder="Write a warm, pastoral public response. Only shown once you click Publish response."
                    className="mt-2 bg-background"
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      disabled={
                        savingId === row.id ||
                        !(responses[row.id] ?? "").trim() ||
                        ((responses[row.id] ?? "").trim() === (row.public_response ?? "").trim())
                      }
                      onClick={() =>
                        updateRow(row, {
                          public_response: (responses[row.id] ?? "").trim(),
                          public_response_at: new Date().toISOString(),
                        })
                      }
                    >
                      {row.public_response ? "Update public response" : "Publish response"}
                    </Button>
                    {row.public_response && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={savingId === row.id}
                        onClick={() => {
                          setResponses((r) => ({ ...r, [row.id]: "" }));
                          updateRow(row, {
                            public_response: null,
                            public_response_at: null,
                          });
                        }}
                      >
                        Remove public response
                      </Button>
                    )}
                    {row.public_response_at && (
                      <span className="text-[11px] text-muted-foreground">
                        Published {new Date(row.public_response_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Only appears on the public wall when this question is also Approved for public. Submitter contact details (if shared) remain available above for private follow-up.
                  </p>
                </div>
              )}

              <footer className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  disabled={savingId === row.id || !canGoPublic || row.status === "approved_public"}
                  onClick={() => updateRow(row, { status: "approved_public" })}
                  title={
                    !canGoPublic
                      ? "Submitter chose staff-only; cannot publish."
                      : "Show on the public prayer wall"
                  }
                >
                  <CheckCircle2 className="mr-1.5 size-4" />
                  Approve for public
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={savingId === row.id || row.status === "private_only"}
                  onClick={() => updateRow(row, { status: "private_only" })}
                >
                  <EyeOff className="mr-1.5 size-4" />
                  Keep private
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={savingId === row.id || row.status === "archived"}
                  onClick={() => updateRow(row, { status: "archived" })}
                >
                  <Archive className="mr-1.5 size-4" />
                  Archive
                </Button>
              </footer>
            </article>
          );
        })}
      </div>
    </div>
  );
}
