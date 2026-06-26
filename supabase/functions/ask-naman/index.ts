import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { SYSTEM_PROMPT } from "./knowledge.ts";

const logger = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// In-memory rate limiter (per edge instance). Good enough for portfolio traffic.
const RL_WINDOW_MS = 10 * 60 * 1000; // 10 min
const RL_MAX = 8;
const rl = new Map<string, number[]>();

function rateLimited(sid: string): boolean {
  const now = Date.now();
  const arr = (rl.get(sid) || []).filter((t) => now - t < RL_WINDOW_MS);
  if (arr.length >= RL_MAX) {
    rl.set(sid, arr);
    return true;
  }
  arr.push(now);
  rl.set(sid, arr);
  return false;
}

async function logCall(opts: {
  sessionId: string | null;
  prompt: string;
  response: string;
  count: number;
  ua: string | null;
  referrer: string | null;
  error?: string | null;
}) {
  try {
    await logger.from("chatbot_logs").insert({
      session_id: opts.sessionId,
      prompt: opts.prompt.slice(0, 4000),
      response: opts.response.slice(0, 8000),
      message_count: opts.count,
      user_agent: opts.ua,
      referrer: opts.referrer,
      error: opts.error || null,
    });
  } catch (e) {
    console.error("log failed", e);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const ua = req.headers.get("user-agent");
  const referrer = req.headers.get("referer");

  try {
    const { messages, sessionId } = await req.json();
    const sid = typeof sessionId === "string" ? sessionId : "anon";

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lastUser = [...messages].reverse().find((m: any) => m?.role === "user")?.content || "";
    if (typeof lastUser !== "string" || lastUser.length > 1000) {
      return new Response(JSON.stringify({ error: "That's a long one. Keep it under 1000 characters." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (rateLimited(sid)) {
      await logCall({ sessionId: sid, prompt: lastUser, response: "", count: messages.length, ua, referrer, error: "rate_limited" });
      return new Response(JSON.stringify({ error: "Too many questions — Naman's AI needs a breather. Try again in a few minutes." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const trimmed = messages
      .filter((m: any) => m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant"))
      .slice(-12)
      .map((m: any) => ({ role: m.role, content: m.content.slice(0, 2000) }));

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "raw-fetch",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...trimmed],
        stream: true,
      }),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      console.error("Gateway error", upstream.status, text);
      const userMsg =
        upstream.status === 429 ? "Too many requests — try again in a minute."
        : upstream.status === 402 ? "AI credits exhausted — Naman needs to top up."
        : "AI is unavailable right now.";
      await logCall({ sessionId: sid, prompt: lastUser, response: "", count: trimmed.length, ua, referrer, error: `gateway_${upstream.status}` });
      return new Response(JSON.stringify({ error: userMsg }), {
        status: upstream.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [clientStream, logStream] = upstream.body!.tee();

    (async () => {
      try {
        const reader = logStream.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let assembled = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            const t = line.trim();
            if (!t.startsWith("data:")) continue;
            const payload = t.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;
            try {
              const json = JSON.parse(payload);
              const delta = json?.choices?.[0]?.delta?.content;
              if (typeof delta === "string") assembled += delta;
            } catch { /* skip */ }
          }
        }
        await logCall({ sessionId: sid, prompt: lastUser, response: assembled, count: trimmed.length, ua, referrer });
      } catch (e) {
        console.error("log stream failed", e);
      }
    })();

    return new Response(clientStream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
