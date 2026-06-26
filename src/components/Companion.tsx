import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

type Tip = { text: string };

const ROUTE_TIPS: Record<string, Tip[]> = {
  "/": [
    { text: "Trained a computer vision model on 141K+ images. Your Netflix history has more data, but less purpose." },
    { text: "CGPA: 7.93. Not a 10, but neither is anyone who's actually shipped something." },
    { text: "4 internships before final year. Overachiever? Maybe. Unemployed? Not yet." },
    { text: "Scroll down. The stats get better. Or at least more specific." },
    { text: "Built an ADAS system for Indian roads. Yes, including the cows. Especially the cows." },
    { text: "→ Head to Work to see what he's actually built." },
    { text: "→ Hit Contact if you've seen enough. He doesn't bite." },
  ],
  "/about": [
    { text: "Java and Python. One for interviews, one for everything else." },
    { text: "Specialises in Data Science and AI. Also in pretending he understands all of linear algebra." },
    { text: "First Runner-Up at TechSparx out of 80+ teams. The winner probably Googled more." },
    { text: "Co-Chair of Innovation Vertical. Mostly innovated ways to make meetings shorter." },
    { text: "→ Seen enough about him? Check out his actual work — hit Work in the nav." },
    { text: "→ Impressed? Confused? Either way, Contact is right there." },
  ],
  "/work": [
    { text: "DriveSafe-IND detects auto-rickshaws, animals, and chaos — basically trained on Indian roads." },
    { text: "mAP went from 0.157 to 0.648. That's a 312% improvement. His sleep went down 312%." },
    { text: "Built a marketing dashboard tracking 10L+ campaigns. Yes, lakhs. He's bilingual in number formats." },
    { text: "Winlytics predicts IPL outcomes at 65%+ accuracy. Still better than your fantasy team picks." },
    { text: "Sensor fusion on Raspberry Pi. Tiny computer, big feelings." },
    { text: "→ Like what you see? Don't just stare — hit Contact and say something." },
  ],
  "/contact": [
    { text: "You've made it this far. The form takes 30 seconds. Less time than this bubble." },
    { text: "He responds fast. Faster than his model inference times, even." },
    { text: "No cover letter needed. Just say hi. Naman's people." },
    { text: "LinkedIn, GitHub, email, phone — pick your weapon." },
    { text: "Seriously. Just send it. The worst he can say is he's already placed. He's not." },
  ],
};

const FALLBACK: Tip[] = [{ text: "I'm your tiny tour guide. Carry on." }];

export default function Companion() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [tip, setTip] = useState<Tip>(FALLBACK[0]);
  const idxRef = useRef(0);
  const hoverTimer = useRef<number | null>(null);

  const pool = useMemo(() => ROUTE_TIPS[pathname] ?? FALLBACK, [pathname]);

  // Reset on route change and pick first tip.
  useEffect(() => {
    idxRef.current = 0;
    setOpen(true);
    setTip(pool[0]);
  }, [pathname, pool]);

  // Auto-rotate every 8s, sequentially through the pool.
  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => {
      idxRef.current = (idxRef.current + 1) % pool.length;
      setTip(pool[idxRef.current]);
    }, 8000);
    return () => window.clearInterval(id);
  }, [open, pool]);

  // Hover-listener: any element with [data-companion] for 900ms shows its comment.
  useEffect(() => {
    const onOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest?.("[data-companion]") as HTMLElement | null;
      if (!el) return;
      if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
      hoverTimer.current = window.setTimeout(() => {
        const text = el.getAttribute("data-companion") || "";
        if (!text) return;
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

  if (dismissed) return null;

  return (
    <div className="fixed bottom-6 left-4 sm:left-6 z-40 flex items-end gap-2 pointer-events-none max-w-[calc(100vw-5rem)]">
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.08, rotate: -4 }}
        whileTap={{ scale: 0.95 }}
        animate={{ y: [0, -4, 0] }}
        transition={{ y: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }}
        className="pointer-events-auto w-12 h-12 rounded-full bg-[#1A1A1A] text-[#F5F2EA] flex items-center justify-center shadow-lg text-xl select-none"
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
            className="pointer-events-auto relative mb-1 max-w-[85vw] sm:max-w-[280px] bg-white border border-[#1A1A1A]/15 px-3 py-2 text-xs font-light text-[#1A1A1A] shadow-md"
          >
            <button
              onClick={() => setDismissed(true)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-[#1A1A1A] text-[#F5F2EA] flex items-center justify-center rounded-full"
              aria-label="Dismiss"
            >
              <X size={10} />
            </button>
            <p className="leading-relaxed">{tip.text}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
