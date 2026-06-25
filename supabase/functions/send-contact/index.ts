import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.24.2";

const Schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(1).max(150),
  message: z.string().trim().min(1).max(1000),
  hp: z.string().optional(), // honeypot
});

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip + "naman-portfolio-salt");
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

// Simple in-memory rate limit per ip-hash (per isolate)
const lastSeen = new Map<string, number>();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { name, email, subject, message, hp } = parsed.data;
    if (hp && hp.trim().length > 0) {
      // honeypot tripped — pretend success
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "0.0.0.0";
    const ipHash = await hashIp(ip);
    const now = Date.now();
    const prev = lastSeen.get(ipHash) ?? 0;
    if (now - prev < 30_000) {
      return new Response(JSON.stringify({ error: "Please wait a moment before sending another message." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    lastSeen.set(ipHash, now);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error } = await supabase.from("contact_messages").insert({
      name, email, subject, message, ip_hash: ipHash,
    });
    if (error) {
      console.error("DB insert failed:", error);
      return new Response(JSON.stringify({ error: "Failed to save message" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
