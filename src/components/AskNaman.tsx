import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, ArrowUp, RotateCcw, Copy, Check, Square } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import Logo from "@/components/Logo";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "What's Naman's tech stack?",
  "Summarize his internship experience.",
  "Tell me about DriveSafe-IND.",
];

const FOLLOWUPS: { match: RegExp; suggest: string[] }[] = [
  { match: /drivesafe/i, suggest: ["How does DriveSafe work?", "What tech stack did you use?"] },
  { match: /winlytics/i, suggest: ["How accurate is Winlytics?", "How did you scrape the data?"] },
  { match: /arista|internship/i, suggest: ["What did you build at Arista?", "How can I contact Naman?"] },
  { match: /skill|python/i, suggest: ["What projects use Python?", "What's Naman's strongest skill?"] },
];
const DEFAULT_FOLLOWUPS = ["Tell me about DriveSafe", "How can I contact him?"];

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ask-naman`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const LS_KEY = "an_chat_v2";

function newSid() {
  try { return crypto.randomUUID(); } catch { return `s_${Date.now()}`; }
}

function loadSaved(): { sid: string; messages: Msg[] } {
  if (typeof window === "undefined") return { sid: "anon", messages: [] };
  try {
    const raw = sessionStorage.getItem(LS_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && typeof p.sid === "string" && Array.isArray(p.messages)) return p;
    }
  } catch { /* ignore */ }
  return { sid: newSid(), messages: [] };
}

function suggestionsFor(lastAssistant: string, lastUser: string): string[] {
  const text = `${lastUser} ${lastAssistant}`;
  for (const f of FOLLOWUPS) if (f.match.test(text)) return f.suggest;
  return DEFAULT_FOLLOWUPS;
}

export default function AskNaman() {
  const [open, setOpen] = useState(false);
  const initial = useRef(loadSaved());
  const [messages, setMessages] = useState<Msg[]>(initial.current.messages);
  const [sid, setSid] = useState(initial.current.sid);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try { sessionStorage.setItem(LS_KEY, JSON.stringify({ sid, messages })); } catch { /* ignore */ }
  }, [sid, messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  // Auto-grow textarea
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  function resetChat() {
    abortRef.current?.abort();
    setMessages([]);
    setSid(newSid());
    setInput("");
    try { sessionStorage.removeItem(LS_KEY); } catch { /* ignore */ }
  }

  function stop() {
    abortRef.current?.abort();
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    if (trimmed.length > 1000) {
      toast.error("Keep messages under 1000 characters.");
      return;
    }
    const newMessages: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch(FN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ANON}`,
          apikey: ANON,
        },
        body: JSON.stringify({ messages: newMessages, sessionId: sid }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        const msg = j.error || "Something went wrong.";
        toast.error(msg);
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: `⚠️ ${msg}` };
          return copy;
        });
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          const t = line.trim();
          if (!t.startsWith("data:")) continue;
          const payload = t.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              acc += delta;
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: acc };
                return copy;
              });
            }
          } catch { /* skip */ }
        }
      }
    } catch (e: any) {
      if (e?.name === "AbortError") {
        setMessages((m) => {
          const copy = [...m];
          const last = copy[copy.length - 1];
          if (last?.role === "assistant" && !last.content) copy.pop();
          else if (last?.role === "assistant") copy[copy.length - 1] = { ...last, content: last.content + "\n\n_(stopped)_" };
          return copy;
        });
      } else {
        toast.error("Network error.");
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: "⚠️ Network error." };
          return copy;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
      requestAnimationFrame(() => taRef.current?.focus());
    }
  }

  function copyMsg(i: number, content: string) {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedIdx(i);
      setTimeout(() => setCopiedIdx(null), 1200);
    });
  }

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant" && m.content);
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const showFollowups =
    !streaming && messages.length > 0 && lastAssistant && lastUser && !lastAssistant.content.startsWith("⚠️");
  const followups = showFollowups ? suggestionsFor(lastAssistant!.content, lastUser!.content) : [];

  return (
    <>
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#1A1A1A] text-[#F5F2EA] rounded-full px-5 py-3 shadow-lg"
        aria-label="Ask Naman"
      >
        {open ? <X size={18} /> : <Logo size={18} />}
        <span className="text-sm font-light">{open ? "Close" : "Ask Naman"}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 w-[min(92vw,380px)] h-[min(70vh,560px)] bg-[#F5F2EA] border border-[#1A1A1A]/15 shadow-2xl flex flex-col"
          >
            <div className="px-4 py-3 border-b border-[#1A1A1A]/10 flex items-center gap-2">
              <MessageCircle size={16} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">Ask Naman</div>
                <div className="text-[10px] uppercase tracking-widest text-[#D97706]">
                  Trained on Naman's portfolio · may be wrong
                </div>
              </div>
              {messages.length > 0 && (
                <button
                  onClick={resetChat}
                  className="p-1.5 text-[#666666] hover:text-[#1A1A1A] transition-colors"
                  aria-label="Reset conversation"
                  title="Reset conversation"
                >
                  <RotateCcw size={14} />
                </button>
              )}
            </div>

            <div ref={scrollRef} data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-3">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-light text-[#D97706]">
                    Hey! I'm an AI that knows Naman well. Ask me anything.
                  </p>
                  <div className="flex flex-col gap-2">
                    {STARTERS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="text-left text-sm font-light border border-[#1A1A1A]/15 px-3 py-2 hover:bg-[#1A1A1A] hover:text-[#F5F2EA] transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "text-right" : ""}>
                  <div
                    className={`inline-block max-w-[85%] text-sm font-light leading-relaxed px-3 py-2 ${
                      m.role === "user"
                        ? "bg-[#1A1A1A] text-[#F5F2EA]"
                        : "bg-white border border-[#1A1A1A]/10 prose prose-sm"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      m.content ? <ReactMarkdown>{m.content}</ReactMarkdown> : <span className="opacity-50">…</span>
                    ) : (
                      m.content
                    )}
                  </div>
                  {m.role === "assistant" && m.content && !m.content.startsWith("⚠️") && (
                    <div className="mt-1">
                      <button
                        onClick={() => copyMsg(i, m.content)}
                        className="text-[10px] uppercase tracking-widest text-[#888888] hover:text-[#1A1A1A] inline-flex items-center gap-1 transition-colors"
                        aria-label="Copy reply"
                      >
                        {copiedIdx === i ? <Check size={10} /> : <Copy size={10} />}
                        {copiedIdx === i ? "Copied" : "Copy"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {followups.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {followups.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-xs font-light border border-[#D97706]/60 text-[#1A1A1A] rounded-full px-3 py-1 hover:bg-[#D97706] hover:text-white transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="border-t border-[#1A1A1A]/10 p-3 flex items-end gap-2"
            >
              <textarea
                ref={taRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Ask something… (Shift+Enter for newline)"
                rows={1}
                maxLength={1000}
                className="flex-1 bg-transparent text-sm font-light focus:outline-none px-2 py-2 resize-none max-h-[120px]"
              />
              {streaming ? (
                <button
                  type="button"
                  onClick={stop}
                  className="bg-[#1A1A1A] text-[#F5F2EA] p-2"
                  aria-label="Stop"
                  title="Stop"
                >
                  <Square size={14} fill="currentColor" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="bg-[#1A1A1A] text-[#F5F2EA] p-2 disabled:opacity-30"
                  aria-label="Send"
                >
                  <ArrowUp size={16} />
                </button>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
