const SUPABASE_URL = "https://ptdvcobgplmngnhkjqag.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0ZHZjb2JncGxtbmduaGtqcWFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzQxMjA3NywiZXhwIjoyMTAyOTg4MDc3fQ.y5RMRpSgkP582zNwbzwGxcSRQ2gFyhA82oDjA13Trvg";

async function run() {
  const sql = `
    ALTER TABLE public.events
      ADD COLUMN IF NOT EXISTS is_recurring boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS recurrence_interval text NOT NULL DEFAULT 'weekly';

    UPDATE public.events
    SET is_recurring = true,
        recurrence_interval = 'weekly'
    WHERE title_en ILIKE '%youth%' OR title_sl ILIKE '%mlade%';
  `;

  // Try pg / sql query endpoint
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      "apikey": SERVICE_KEY,
      "Authorization": `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query: sql })
  });

  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text);
}

run().catch(console.error);
