import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { z } from "zod";
import { Reveal } from "@/components/Section";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";

type Entry = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  message: string;
  created_at: string;
};

const schema = z.object({
  display_name: z.string().trim().min(1, "Name required").max(60, "Max 60 chars"),
  email: z.string().trim().email("Invalid email").max(255),
  message: z.string().trim().min(1, "Say something").max(140, "Max 140 chars"),
});

const RL_KEY = "gb_last_post_at";
const RL_MS = 60_000;

function makeCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { a, b, answer: a + b };
}

export default function Guestbook() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [form, setForm] = useState({ display_name: "", email: "", message: "" });
  const [posting, setPosting] = useState(false);
  const [captcha, setCaptcha] = useState(makeCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");
  const [hp, setHp] = useState(""); // honeypot
  const [mountedAt] = useState(() => Date.now());

  async function load() {
    const { data, error } = await supabase
      .from("guestbook_public")
      .select("id, display_name, avatar_url, message, created_at")
      .eq("hidden", false)
      .order("created_at", { ascending: false })
      .limit(100);
    if (!error && data) setEntries(data as Entry[]);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const channel = supabase
      .channel("guestbook")
      .on("postgres_changes", { event: "*", schema: "public", table: "guestbook_entries" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function post(e: React.FormEvent) {
    e.preventDefault();
    // Honeypot: bots fill hidden fields
    if (hp) return;
    // Time trap: submissions under 2s are almost certainly bots
    if (Date.now() - mountedAt < 2000) {
      toast.error("Whoa, slow down.");
      return;
    }
    // Math CAPTCHA
    if (Number(captchaInput) !== captcha.answer) {
      toast.error("Captcha incorrect — try again.");
      setCaptcha(makeCaptcha());
      setCaptchaInput("");
      return;
    }
    const last = Number(localStorage.getItem(RL_KEY) || 0);
    if (Date.now() - last < RL_MS) {
      toast.error("Slow down — wait a minute between notes.");
      return;
    }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setPosting(true);
    const { error } = await supabase.from("guestbook_entries").insert({
      user_id: null,
      display_name: parsed.data.display_name,
      email: parsed.data.email,
      message: parsed.data.message,
      avatar_url: null,
    });
    setPosting(false);
    if (error) {
      toast.error("Couldn't post — try again");
      setCaptcha(makeCaptcha());
      setCaptchaInput("");
      return;
    }
    localStorage.setItem(RL_KEY, String(Date.now()));
    setForm({ display_name: "", email: "", message: "" });
    setCaptcha(makeCaptcha());
    setCaptchaInput("");
    toast.success("Signed!");
    load();
  }

  return (
    <section className="max-w-3xl mx-auto px-6 py-20">
      <SEO title="Guestbook" description="Leave a note on Naman Agarwal's portfolio guestbook." path="/#/guestbook" />
      <Reveal>
        <h2 className="text-4xl sm:text-5xl font-light tracking-tight">Guestbook</h2>
      </Reveal>
      <Reveal delay={0.05}>
        <p className="mt-5 font-light text-[#475569]">
          Drop a note. Say hi. Roast my code. (Max 140 chars.)
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <form onSubmit={post} className="mt-10 border border-[#1A1A1A]/15 p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest font-light text-[#475569]">Name</label>
              <input
                type="text"
                value={form.display_name}
                onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                maxLength={60}
                required
                placeholder="Your name"
                className="mt-1 w-full bg-transparent border-b border-[#475569]/30 py-2 text-sm font-light focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest font-light text-[#475569]">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                maxLength={255}
                required
                placeholder="you@example.com"
                className="mt-1 w-full bg-transparent border-b border-[#475569]/30 py-2 text-sm font-light focus:outline-none focus:border-[#1A1A1A]"
              />
              <p className="mt-1 text-[10px] text-[#475569]/70">Kept private — never shown publicly.</p>
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest font-light text-[#475569]">Message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              maxLength={140}
              rows={2}
              required
              placeholder="Leave your mark…"
              className="mt-1 w-full bg-transparent border-b border-[#475569]/30 py-2 text-sm font-light focus:outline-none focus:border-[#1A1A1A] resize-none"
            />
          </div>

          {/* Honeypot — hidden from humans, catnip for bots */}
          <div aria-hidden="true" className="absolute -left-[9999px] opacity-0 pointer-events-none">
            <label>
              Website
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
              />
            </label>
          </div>

          {/* Math CAPTCHA */}
          <div>
            <label className="text-xs uppercase tracking-widest font-light text-[#475569]">
              Quick check — what's {captcha.a} + {captcha.b}?
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                maxLength={3}
                required
                placeholder="Answer"
                className="mt-1 w-32 bg-transparent border-b border-[#475569]/30 py-2 text-sm font-light focus:outline-none focus:border-[#1A1A1A]"
              />
              <button
                type="button"
                onClick={() => { setCaptcha(makeCaptcha()); setCaptchaInput(""); }}
                className="mt-1 text-[10px] uppercase tracking-widest text-[#475569] hover:text-[#1A1A1A] transition-colors"
              >
                ↻ New
              </button>
            </div>
          </div>


          <div className="flex items-center justify-between">
            <span className="text-xs font-light text-[#475569]">{form.message.length}/140</span>
            <button
              type="submit"
              disabled={posting}
              className="border border-[#1A1A1A] px-5 py-2 text-sm font-medium hover:bg-[#1A1A1A] hover:text-[#F7F5F2] transition-colors disabled:opacity-40"
            >
              {posting ? "Signing…" : "Sign"}
            </button>
          </div>
        </form>
      </Reveal>

      <ul className="mt-12 space-y-6">
        <AnimatePresence>
          {entries.map((e, i) => (
            <motion.li
              key={e.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.4 }}
              className="border-b border-[#475569]/15 pb-5"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1A1A1A]/10 mt-1 flex items-center justify-center text-xs font-light text-[#475569]">
                  {e.display_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-light text-[#475569]">
                    <span>{e.display_name}</span>
                    <span>·</span>
                    <span>{new Date(e.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-1 font-light text-[#1A1A1A]">{e.message}</p>
                </div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
        {entries.length === 0 && (
          <p className="text-sm font-light text-[#475569]">No entries yet. Be the first.</p>
        )}
      </ul>
    </section>
  );
}
