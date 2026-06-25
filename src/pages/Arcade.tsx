import { useState } from "react";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import F1Lights from "@/games/F1Lights";
import PitStop from "@/games/PitStop";
import CricketTiming from "@/games/CricketTiming";
import UFCDodge from "@/games/UFCDodge";
import TicTacToe from "@/games/TicTacToe";
import MiniSudoku from "@/games/MiniSudoku";
import ReactionGame from "@/components/ReactionGame";

type Game = {
  id: string;
  name: string;
  tag: string;
  why: string;
  el: React.ReactNode;
};

const GAMES: Game[] = [
  { id: "f1", name: "F1 Start Lights", tag: "Motorsports", why: "I grew up watching lights-out on Sunday mornings. This is that adrenaline in a button.", el: <F1Lights /> },
  { id: "pit", name: "Pit Stop", tag: "Motorsports", why: "Sub-2-second pit stops are art. Try to tap the sequence cleanly.", el: <PitStop /> },
  { id: "reaction", name: "Reaction Test", tag: "Reflex", why: "The classic. Same instinct a driver uses on the brake pedal.", el: <ReactionGame /> },
  { id: "cricket", name: "Cricket Timing", tag: "Cricket", why: "Time the swing for a six. India in the blood, willow in the hand.", el: <CricketTiming /> },
  { id: "ufc", name: "UFC Slip & Duck", tag: "UFC", why: "Read the strike, slip or duck. Reflex under pressure.", el: <UFCDodge /> },
  { id: "ttt", name: "Tic Tac Toe", tag: "Classic", why: "Coffee-break logic. The AI doesn't lose — can you draw?", el: <TicTacToe /> },
  { id: "sud", name: "Mini Sudoku", tag: "Logic", why: "4×4 warm-up. Pattern recognition is half of data science.", el: <MiniSudoku /> },
];

export default function Arcade() {
  const [active, setActive] = useState<Game>(GAMES[0]);

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <SEO title="Arcade" description="Mini-games by Naman — F1 lights, cricket timing, UFC reflex, sudoku, tic-tac-toe." path="/arcade" />
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-[#475569] font-light">Arcade</div>
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight mt-2">Pick your poison.</h1>
          <p className="mt-3 text-sm font-light text-[#475569] max-w-xl">
            Motorsports reflex, cricket timing, UFC reaction, plus the timeless classics. Built for fun — and because a portfolio shouldn't be boring.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2 mb-8">
        {GAMES.map((g) => (
          <button
            key={g.id}
            onClick={() => setActive(g)}
            className={`px-3 py-3 text-xs font-light border text-left transition-colors ${active.id === g.id ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "border-[#1A1A1A]/15 hover:border-[#1A1A1A]"}`}
          >
            <div className="text-[9px] uppercase tracking-widest opacity-70">{g.tag}</div>
            <div className="mt-1">{g.name}</div>
          </button>
        ))}
      </div>

      <motion.div
        key={active.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid md:grid-cols-[1fr_320px] gap-6"
      >
        <div className="border border-[#1A1A1A]/15 p-6 bg-white/40">
          {active.el}
        </div>
        <aside className="border border-[#1A1A1A]/15 p-6 bg-white/40">
          <div className="text-[10px] uppercase tracking-widest text-[#475569] mb-2">Why this game</div>
          <h2 className="text-xl font-light leading-snug">{active.name}</h2>
          <p className="mt-3 text-sm font-light text-[#475569] leading-relaxed">{active.why}</p>
          <div className="mt-6 text-[10px] uppercase tracking-widest text-[#475569]">Category</div>
          <div className="mt-1 text-sm font-light">{active.tag}</div>
        </aside>
      </motion.div>
    </section>
  );
}
