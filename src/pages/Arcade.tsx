import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import F1Lights from "@/games/F1Lights";

export default function Arcade() {
  return (
    <section className="max-w-3xl mx-auto px-6 py-10">
      <SEO fullTitle="F1 Reaction Test — Naman Agarwal" title="F1 Reaction Test" description="Test your F1 reflexes — lights out and away we go." path="/#/arcade" />
      <div className="mb-8">
        <div className="text-[10px] uppercase tracking-widest text-[#D97706] font-light">Arcade</div>
        <h1 className="text-4xl sm:text-5xl font-light tracking-tight mt-2">F1 Reaction Test</h1>
        <p className="mt-3 text-sm font-light text-[#D97706] max-w-xl">
          How fast are your reflexes? Lights out and away we go.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="border border-[#1A1A1A]/15 p-6 bg-white/40"
      >
        <F1Lights />
      </motion.div>
    </section>
  );
}
