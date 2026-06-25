import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

type Tip = { text: string; cta?: { label: string; to: string } };

const TIPS: Record<string, Tip[]> = {
  "/": [
    { text: "Pssst — there's an arcade up top. I'm legally obligated to mention the F1 lights game.", cta: { label: "Arcade", to: "/arcade" } },
    { text: "Scroll for stats, a brainteaser, and a reaction test. Pretend you're impressed." },
    { text: "Resume's one click away. No login, no newsletter, I promise." },
  ],
  "/about": [
    { text: "Skim the skills. Or don't — I'm a pixel, not a cop." },
  ],
  "/work": [
    { text: "Projects below. Naman built them, I just hype them." },
  ],
  "/guestbook": [
    { text: "Be nice. The CAPTCHA is watching. So am I." },
  ],
  "/contact": [
    { text: "Real form, real inbox. Bots get bounced." },
  ],
  "/arcade": [
    { text: "F1 lights = pure reflex. Cricket = timing. Tic-Tac-Toe = humility." },
  ],
  "/stats": [
    { text: "Spy mode. Don't tell anyone." },
  ],
};

const FALLBACK: Tip[] = [{ text: "I'm your tiny tour guide. Carry on." }];

export default function Companion() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(true);
  const [idx, setIdx] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const tips = useMemo(() => TIPS[pathname] ?? FALLBACK, [pathname]);

  useEffect(() => { setIdx(0); setOpen(true); }, [pathname]);

  useEffect(() => {
    if (!open || tips.length < 2) return;
    const t = window.setInterval(() => setIdx((p) => (p + 1) % tips.length), 7000);
    return () => window.clearInterval(t);
  }, [open, tips.length]);

  if (dismissed) return null;
  const tip = tips[idx];

  return (
    <div className="fixed bottom-6 left-6 z-40 flex items-end gap-2 pointer-events-none">
      <motion.button
        onClick={() => setOpen((o) => !o)}
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
            key={pathname + idx}
            initial={{ opacity: 0, x: -8, y: 4 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-auto relative mb-1 max-w-[260px] bg-white border border-[#1A1A1A]/15 px-3 py-2 text-xs font-light text-[#1A1A1A] shadow-md"
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
              <Link to={tip.cta.to} className="mt-1 inline-block text-[10px] uppercase tracking-widest underline">
                {tip.cta.label} →
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
