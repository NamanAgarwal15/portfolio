import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { brainteasers } from "@/data/brainteasers";
import { Lightbulb, RefreshCw, Eye } from "lucide-react";

export default function Brainteaser() {
  const [i, setI] = useState(() => Math.floor(Math.random() * brainteasers.length));
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = window.setInterval(() => {
      setShow(false);
      setI((p) => (p + 1) % brainteasers.length);
    }, 12000);
    return () => window.clearInterval(t);
  }, []);

  const next = () => { setShow(false); setI((p) => (p + 1) % brainteasers.length); };
  const t = brainteasers[i];

  return (
    <div className="border border-[#1A1A1A]/15 p-5 bg-white/40">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] uppercase tracking-widest text-[#475569] font-light flex items-center gap-2">
          <Lightbulb size={12} /> Brainteaser · {i + 1}/{brainteasers.length}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShow((s) => !s)} className="text-[10px] uppercase tracking-widest text-[#475569] hover:text-[#1A1A1A] flex items-center gap-1">
            <Eye size={12} /> {show ? "Hide" : "Reveal"}
          </button>
          <button onClick={next} className="text-[10px] uppercase tracking-widest text-[#475569] hover:text-[#1A1A1A] flex items-center gap-1">
            <RefreshCw size={12} /> Next
          </button>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-base sm:text-lg font-light leading-relaxed text-[#1A1A1A]">{t.q}</p>
          {show && (
            <p className="mt-3 text-sm font-light text-[#475569] italic border-l-2 border-[#1A1A1A]/30 pl-3">
              {t.a}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
