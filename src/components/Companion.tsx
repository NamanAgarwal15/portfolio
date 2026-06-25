import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

type Tip = { text: string; cta?: { label: string; to: string } };

const ROUTE_TIPS: Record<string, Tip[]> = {
  "/": [
    { text: "Pssst — there's a party button down there. Nine games and questionable life choices.", cta: { label: "Arcade", to: "/arcade?party=1" } },
    { text: "Scroll for stats, a brainteaser, and an unbeatable RPS. I bet against you, FYI." },
    { text: "Resume's one click away. No login, no newsletter, I promise." },
    { text: "Fun fact: 73% of stats are made up. This one isn't." },
    { text: "If you're a recruiter — hi. If you're not — also hi." },
    { text: "The big N up top isn't just a logo. Okay, it kinda is." },
  ],
  "/about": [
    { text: "Skim the skills. Or don't — I'm a pixel, not a cop." },
    { text: "Naman drinks more chai than coffee. Important context." },
    { text: "He says 'production-ready'. He means it. Probably." },
  ],
  "/work": [
    { text: "Naman got a bit distracted building this portfolio. More projects on the way — meanwhile, fancy a game?", cta: { label: "Arcade", to: "/arcade?party=1" } },
    { text: "Two shipped, more in the oven. Until they're done — arcade?", cta: { label: "Arcade", to: "/arcade" } },
    { text: "Projects load, attention spans don't. Quick game?", cta: { label: "Arcade", to: "/arcade?party=1" } },
  ],
  "/guestbook": [
    { text: "Be nice. The CAPTCHA is watching. So am I." },
    { text: "Drop a line. Even 'hi' counts. Especially 'hi'." },
  ],
  "/contact": [
    { text: "Real form, real inbox. Bots get bounced." },
    { text: "Form locks after sending — that's a feature, not a bug." },
  ],
  "/arcade": [
    { text: "F1 lights = pure reflex. Cricket = timing. RPS = rigged." },
    { text: "Try the unbeatable RPS. Tell me when you win — you won't." },
    { text: "Sudoku has 4, 6, and 8 sizes. 8×8 is humbling." },
  ],
  "/stats": [
    { text: "Spy mode. Don't tell anyone." },
  ],
};

const HOVER_QUIPS = [
  "Ooh, that one. Good taste.",
  "I see you eyeing this.",
  "Click it. I dare you.",
  "Hovering is half of decision-making.",
  "Yep, that's a button. Works like a button.",
];

const FALLBACK: Tip[] = [{ text: "I'm your tiny tour guide. Carry on." }];

export default function Companion() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [tip, setTip] = useState<Tip>(FALLBACK[0]);
  const usedRef = useRef<Set<string>>(new Set());
  const hoverTimer = useRef<number | null>(null);

  const pool = useMemo(() => ROUTE_TIPS[pathname] ?? FALLBACK, [pathname]);

  // Pick a non-repeating tip from the current pool.
  const pickNext = () => {
    const available = pool.filter((t) => !usedRef.current.has(t.text));
    const choice = (available.length ? available : pool)[Math.floor(Math.random() * (available.length || pool.length))];
    if (!available.length) usedRef.current.clear();
    usedRef.current.add(choice.text);
    setTip(choice);
  };

  // Reset on route change and pick first tip.
  useEffect(() => {
    usedRef.current = new Set();
    setOpen(true);
    pickNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Auto-rotate every 6-10s
  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(pickNext, 6500 + Math.random() * 3500);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pathname]);

  // Hover-listener: any element with [data-companion] for 900ms shows its comment.
  useEffect(() => {
    const onOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest?.("[data-companion]") as HTMLElement | null;
      if (!el) return;
      if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
      hoverTimer.current = window.setTimeout(() => {
        const custom = el.getAttribute("data-companion") || "";
        const text = custom && custom !== "auto" ? custom : HOVER_QUIPS[Math.floor(Math.random() * HOVER_QUIPS.length)];
        setOpen(true);
        setTip({ text });
      }, 900);
    };
    const onOut = () => { if (hoverTimer.current) { window.clearTimeout(hoverTimer.current); hoverTimer.current = null; } };
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    return () => {
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    };
  }, []);

  // Special: on /work, after 1.2s nudge to arcade automatically.
  useEffect(() => {
    if (pathname !== "/work") return;
    const id = window.setTimeout(() => {
      setOpen(true);
      setTip({
        text: "Naman got a bit distracted building this portfolio — more work coming soon. Meanwhile, let's party 🪩",
        cta: { label: "Go to Arcade", to: "/arcade?party=1" },
      });
    }, 1400);
    return () => window.clearTimeout(id);
  }, [pathname]);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40 flex items-end gap-2 pointer-events-none">
      <motion.button
        onClick={() => { setOpen((o) => !o); pickNext(); }}
        whileHover={{ scale: 1.08, rotate: -4 }}
        whileTap={{ scale: 0.95 }}
        animate={{ y: [0, -4, 0] }}
        transition={{ y: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }}
        className="pointer-events-auto w-12 h-12 rounded-full bg-[#1A1A1A] text-[#F7F5F2] flex items-center justify-center shadow-lg text-xl select-none"
        aria-label="Companion"
        title="Your tiny guide"
      >
        ◉‿◉
      </motion.button>
      <AnimatePresence mode="wait">
        {open && tip && (
          <motion.div
            key={tip.text}
            initial={{ opacity: 0, x: -8, y: 4 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-auto relative mb-1 max-w-[280px] bg-white border border-[#1A1A1A]/15 px-3 py-2 text-xs font-light text-[#1A1A1A] shadow-md"
          >
            <button
              onClick={() => setDismissed(true)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-[#1A1A1A] text-[#F7F5F2] flex items-center justify-center rounded-full"
              aria-label="Dismiss"
            >
              <X size={10} />
            </button>
            <p className="leading-relaxed">{tip.text}</p>
            {tip.cta && (
              <button
                onClick={() => navigate(tip.cta!.to)}
                className="mt-1 inline-block text-[10px] uppercase tracking-widest underline"
              >
                {tip.cta.label} →
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
