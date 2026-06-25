import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import F1Lights from "@/games/F1Lights";
import CricketTiming from "@/games/CricketTiming";
import UFCDodge from "@/games/UFCDodge";
import TicTacToe from "@/games/TicTacToe";
import MiniSudoku from "@/games/MiniSudoku";
import RockPaperScissors from "@/games/RockPaperScissors";
import MemoryMatch from "@/games/MemoryMatch";
import WhackAMole from "@/games/WhackAMole";
import ReactionGame from "@/components/ReactionGame";

type Game = { id: string; name: string; tag: string; why: string; el: React.ReactNode };

const GAMES: Game[] = [
  { id: "f1", name: "F1 Start Lights", tag: "Motorsports", why: "I grew up watching lights-out on Sunday mornings. This is that adrenaline in a button.", el: <F1Lights /> },
  { id: "reaction", name: "Reaction Test", tag: "Reflex", why: "The classic. Same instinct a driver uses on the brake pedal.", el: <ReactionGame /> },
  { id: "cricket", name: "Cricket Match", tag: "Cricket", why: "Two innings, three wickets, swing for the fences. India in the blood.", el: <CricketTiming /> },
  { id: "ufc", name: "UFC Slip & Duck", tag: "UFC", why: "Read the strike, slip or duck. Reflex under pressure.", el: <UFCDodge /> },
  { id: "rps", name: "Rock · Paper · Scissors", tag: "Unbeatable", why: "I trained the AI to cheat. Let me know when you win — you won't.", el: <RockPaperScissors /> },
  { id: "ttt", name: "Tic Tac Toe", tag: "Classic", why: "Coffee-break logic. The AI doesn't lose — can you draw?", el: <TicTacToe /> },
  { id: "sud", name: "Sudoku 4·6·8", tag: "Logic", why: "Pattern recognition is half of data science. Pick your difficulty.", el: <MiniSudoku /> },
  { id: "mem", name: "Memory Match", tag: "Focus", why: "Eight pairs. Less coffee = more moves.", el: <MemoryMatch /> },
  { id: "mole", name: "Whack-a-Mole", tag: "Speed", why: "Twenty seconds. Pure hand-eye chaos.", el: <WhackAMole /> },
];

export default function Arcade() {
  const [params, setParams] = useSearchParams();
  const partyFromUrl = params.get("party") === "1";
  const [party, setParty] = useState<boolean>(() => partyFromUrl || localStorage.getItem("party_mode") === "1");
  const [active, setActive] = useState<Game>(GAMES[0]);

  useEffect(() => {
    document.documentElement.classList.toggle("party", party);
    localStorage.setItem("party_mode", party ? "1" : "0");
    return () => { document.documentElement.classList.remove("party"); };
  }, [party]);

  useEffect(() => { if (partyFromUrl) setParty(true); }, [partyFromUrl]);

  const toggleParty = () => {
    const next = !party; setParty(next);
    const p = new URLSearchParams(params); if (next) p.set("party","1"); else p.delete("party"); setParams(p, { replace: true });
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <SEO title="Arcade" description="Mini-games by Naman — F1 lights, cricket, UFC reflex, RPS, sudoku, memory, and more." path="/arcade" />
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-[#475569] font-light">Arcade</div>
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight mt-2">Pick your poison.</h1>
          <p className="mt-3 text-sm font-light text-[#475569] max-w-xl">
            Motorsports reflex, cricket innings, UFC reaction, classics, and a few cheats. Built for fun — and because a portfolio shouldn't be boring.
          </p>
        </div>
        <button
          onClick={toggleParty}
          className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${party ? "bg-pink-500 text-white border-pink-500" : "border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white"}`}
        >
          {party ? "🪩 Party: on" : "🎉 Party mode"}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-8">
        {GAMES.map((g) => (
          <button
            key={g.id}
            data-companion={`Try ${g.name} — ${g.why}`}
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
        <div className="border border-[#1A1A1A]/15 p-6 bg-white/40 party-card">
          {active.el}
        </div>
        <aside className="border border-[#1A1A1A]/15 p-6 bg-white/40 party-card">
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
