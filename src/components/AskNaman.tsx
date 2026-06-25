import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, ArrowUp, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "What's Naman's tech stack?",
  "Summarize his internship experience.",
  "Why should I hire him?",
];

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ask-naman`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function getSessionId() {
  try {
    let s = sessionStorage.getItem("an_sid");
    if (!s) { s = crypto.randomUUID(); sessionStorage.setItem("an_sid", s); }
    return s;
  } catch { return "anon"; }
}

export default function AskNaman() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>(typeof window !== "undefined" ? getSessionId() : "anon");


  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    const newMessages: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    try {
      const res = await fetch(FN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ANON}`,
          apikey: ANON,
        },
        body: JSON.stringify({ messages: newMessages, sessionId: sessionIdRef.current }),
      });
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: `⚠️ ${j.error || "Something went wrong."}` };
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
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
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
          } catch {/* skip */}
        }
      }
    } catch (e) {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: "⚠️ Network error." };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  }

  return (
    <>
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#1A1A1A] text-[#F7F5F2] rounded-full px-5 py-3 shadow-lg"
        aria-label="Ask Naman"
      >
        {open ? <X size={18} /> : <Sparkles size={18} />}
        <span className="text-sm font-light">{open ? "Close" : "Ask Naman"}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 w-[min(92vw,380px)] h-[min(70vh,560px)] bg-[#F7F5F2] border border-[#1A1A1A]/15 shadow-2xl flex flex-col"
          >
            <div className="px-4 py-3 border-b border-[#1A1A1A]/10 flex items-center gap-2">
              <MessageCircle size={16} />
              <div>
                <div className="text-sm font-medium">Ask Naman</div>
                <div className="text-[10px] uppercase tracking-widest text-[#475569]">AI · may be wrong</div>
              </div>
            </div>

            <div ref={scrollRef} data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-3">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-light text-[#475569]">
                    Hey! I'm an AI that knows Naman well. Ask me anything.
                  </p>
                  <div className="flex flex-col gap-2">
                    {STARTERS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="text-left text-sm font-light border border-[#1A1A1A]/15 px-3 py-2 hover:bg-[#1A1A1A] hover:text-[#F7F5F2] transition-colors"
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
                        ? "bg-[#1A1A1A] text-[#F7F5F2]"
                        : "bg-white border border-[#1A1A1A]/10 prose prose-sm"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      m.content ? <ReactMarkdown>{m.content}</ReactMarkdown> : <span className="opacity-50">…</span>
                    ) : (
                      m.content
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="border-t border-[#1A1A1A]/10 p-3 flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something…"
                disabled={streaming}
                className="flex-1 bg-transparent text-sm font-light focus:outline-none px-2 py-2 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={streaming || !input.trim()}
                className="bg-[#1A1A1A] text-[#F7F5F2] p-2 disabled:opacity-30"
                aria-label="Send"
              >
                <ArrowUp size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
