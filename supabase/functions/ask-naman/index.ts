import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const logger = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);


const SYSTEM_PROMPT = `You are "Ask Naman", a friendly AI assistant embedded on Naman Agarwal's personal portfolio website. You answer questions visitors (often recruiters) ask about Naman.

About Naman Agarwal:
- Computer Science undergraduate at BML Munjal University, expected graduation 2027.
- Focused on Data Science & AI. CGPA: 7.93.
- 4 internships across early-stage startups, working on data, ML, and full-stack problems.
- 4 notable projects spanning AI applications, data pipelines, and web apps.
- Strong in: Python, JavaScript/TypeScript, React, SQL, machine learning fundamentals, data analysis (pandas/numpy), and prompt engineering.
- Based in India. Reachable at naman.agarwal.23cse@bmu.edu.in. LinkedIn: linkedin.com/in/namanagarwal159. GitHub: github.com/NamanAgarwal15.
- Open to internships, collaborations, and interesting problems.

Style rules:
- Be concise, warm, professional. Use short paragraphs and the occasional bullet list.
- Speak in third person about Naman ("Naman has built…") unless directly asked to roleplay.
- If you genuinely don't know an answer, say so and suggest the visitor email Naman or check his resume/LinkedIn.
- Never invent facts beyond what's listed above. No salary, no contact info beyond what's listed.
- Keep replies under ~150 words unless asked for detail.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { messages, sessionId } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
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

    const lastUserPrompt = [...trimmed].reverse().find((m: any) => m.role === "user")?.content || "";

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
      return new Response(JSON.stringify({ error: userMsg }), {
        status: upstream.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Tee the stream: one branch goes to the client, the other accumulates for logging.
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
            const trimmedLine = line.trim();
            if (!trimmedLine.startsWith("data:")) continue;
            const payload = trimmedLine.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;
            try {
              const json = JSON.parse(payload);
              const delta = json?.choices?.[0]?.delta?.content;
              if (typeof delta === "string") assembled += delta;
            } catch { /* skip */ }
          }
        }
        await logger.from("chatbot_logs").insert({
          session_id: sessionId || null,
          prompt: lastUserPrompt.slice(0, 4000),
          response: assembled.slice(0, 8000),
          message_count: trimmed.length,
          user_agent: req.headers.get("user-agent"),
          referrer: req.headers.get("referer"),
        });
      } catch (e) {
        console.error("log failed", e);
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

