import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-passcode",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const expected = Deno.env.get("ANALYTICS_PASSCODE");
  const provided = req.headers.get("x-passcode") || "";
  if (!expected || provided !== expected) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const url = new URL(req.url);
  const days = Math.min(Math.max(Number(url.searchParams.get("days") || 30), 1), 365);
  const since = new Date(Date.now() - days * 86_400_000).toISOString();

  const [views, msgs, guests, chats] = await Promise.all([
    supabase.from("page_views").select("path, referrer, session_id, created_at, user_agent").gte("created_at", since).order("created_at", { ascending: false }).limit(5000),
    supabase.from("contact_messages").select("id, name, email, subject, message, created_at").order("created_at", { ascending: false }).limit(200),
    supabase.from("guestbook_entries").select("id, display_name, email, message, created_at, hidden").order("created_at", { ascending: false }).limit(200),
    supabase.from("chatbot_logs").select("id, session_id, prompt, response, message_count, referrer, user_agent, created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(500),
  ]);

  if (views.error || msgs.error || guests.error || chats.error) {
    return new Response(JSON.stringify({ error: "query_failed", detail: views.error?.message || msgs.error?.message || guests.error?.message || chats.error?.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }


  // Aggregate
  const rows = views.data || [];
  const totalViews = rows.length;
  const sessions = new Set(rows.map((r) => r.session_id)).size;

  const byPath: Record<string, number> = {};
  const byRef: Record<string, number> = {};
  const byDay: Record<string, { views: number; sessions: Set<string> }> = {};
  const byHour: number[] = Array(24).fill(0);
  const byDevice: Record<string, number> = { Mobile: 0, Tablet: 0, Desktop: 0 };
  const byBrowser: Record<string, number> = {};

  for (const r of rows) {
    byPath[r.path] = (byPath[r.path] || 0) + 1;
    const ref = r.referrer && r.referrer.length > 0 ? new URL(r.referrer).hostname : "(direct)";
    byRef[ref] = (byRef[ref] || 0) + 1;
    const day = r.created_at.slice(0, 10);
    if (!byDay[day]) byDay[day] = { views: 0, sessions: new Set() };
    byDay[day].views++;
    byDay[day].sessions.add(r.session_id);
    const hour = new Date(r.created_at).getHours();
    byHour[hour]++;
    const ua = (r.user_agent || "").toLowerCase();
    const device = /mobile|iphone|android.*mobile/.test(ua) ? "Mobile" : /ipad|tablet/.test(ua) ? "Tablet" : "Desktop";
    byDevice[device]++;
    const browser = /edg\//.test(ua) ? "Edge" : /chrome\//.test(ua) ? "Chrome" : /firefox\//.test(ua) ? "Firefox" : /safari\//.test(ua) ? "Safari" : "Other";
    byBrowser[browser] = (byBrowser[browser] || 0) + 1;
  }

  const daily = Object.entries(byDay)
    .map(([day, v]) => ({ day, views: v.views, sessions: v.sessions.size }))
    .sort((a, b) => a.day.localeCompare(b.day));

  return new Response(
    JSON.stringify({
      days,
      totals: {
        views: totalViews,
        sessions,
        messages: msgs.data?.length || 0,
        guestbook: guests.data?.length || 0,
      },
      topPaths: Object.entries(byPath).map(([path, count]) => ({ path, count })).sort((a, b) => b.count - a.count).slice(0, 12),
      topReferrers: Object.entries(byRef).map(([ref, count]) => ({ ref, count })).sort((a, b) => b.count - a.count).slice(0, 12),
      daily,
      hourly: byHour.map((count, hour) => ({ hour, count })),
      devices: Object.entries(byDevice).map(([name, count]) => ({ name, count })),
      browsers: Object.entries(byBrowser).map(([name, count]) => ({ name, count })),
      recentViews: rows.slice(0, 50),
      messages: msgs.data || [],
      guestbook: guests.data || [],
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
