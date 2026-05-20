import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_PLAYER_NAME_LENGTH = 24;
const RATE_LIMIT_SECONDS = 30;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function cleanPlayerName(value: unknown) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function cleanInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Leaderboard is not configured" }, 500);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const playerName = cleanPlayerName(body.player_name);
  const score = cleanInteger(body.score);
  const passengers = cleanInteger(body.passengers);
  const revenue = cleanInteger(body.revenue);
  const daysOperated = cleanInteger(body.days_operated);

  if (!playerName || playerName.length > MAX_PLAYER_NAME_LENGTH) {
    return jsonResponse({ error: "Invalid player name" }, 400);
  }

  if (
    score === null || score < 0 ||
    passengers === null || passengers < 0 ||
    revenue === null || revenue < 0 ||
    daysOperated === null || daysOperated < 0
  ) {
    return jsonResponse({ error: "Invalid score" }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const forwardedFor = req.headers.get("x-forwarded-for") || "";
  const ip = forwardedFor.split(",")[0]?.trim() || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  const submitterKey = await sha256(`${ip}|${userAgent.slice(0, 120)}`);

  const { data: rateLimitRow, error: rateLimitReadError } = await supabase
    .from("leaderboard_submission_limits")
    .select("last_submitted_at")
    .eq("submitter_key", submitterKey)
    .maybeSingle();

  if (rateLimitReadError) {
    return jsonResponse({ error: "Rate limit check failed" }, 500);
  }

  if (rateLimitRow?.last_submitted_at) {
    const lastSubmitted = new Date(rateLimitRow.last_submitted_at).getTime();
    if (Date.now() - lastSubmitted < RATE_LIMIT_SECONDS * 1000) {
      return jsonResponse({ error: "Too many submissions" }, 429);
    }
  }

  const { error: insertError } = await supabase
    .from("leaderboard_entries")
    .insert({
      player_name: playerName,
      score,
      passengers,
      revenue,
      days_operated: daysOperated,
    });

  if (insertError) {
    return jsonResponse({ error: "Could not save score" }, 500);
  }

  await supabase
    .from("leaderboard_submission_limits")
    .upsert({
      submitter_key: submitterKey,
      last_submitted_at: new Date().toISOString(),
    });

  return jsonResponse({ ok: true });
});
