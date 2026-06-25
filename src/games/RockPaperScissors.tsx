import { useState } from "react";

type Move = "rock" | "paper" | "scissors";
const EMOJI: Record<Move, string> = { rock: "✊", paper: "✋", scissors: "✌️" };
const COUNTER: Record<Move, Move> = { rock: "paper", paper: "scissors", scissors: "rock" };

export default function RockPaperScissors() {
  const [you, setYou] = useState<Move | null>(null);
  const [cpu, setCpu] = useState<Move | null>(null);
  const [you_s, setYouS] = useState(0);
  const [cpu_s, setCpuS] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [msg, setMsg] = useState("Pick a move. Try to beat the unbeatable.");

  const play = (m: Move) => {
    if (!reveal && you) return;
    setYou(m); setReveal(false); setCpu(null);
    // Tiny "thinking" delay, then CPU plays the perfect counter every single time.
    setTimeout(() => {
      const c = COUNTER[m];
      setCpu(c); setReveal(true);
      setCpuS((s) => s + 1);
      setMsg(`${EMOJI[c]} beats ${EMOJI[m]}. The machine wins again.`);
    }, 450);
  };

  const reset = () => { setYou(null); setCpu(null); setYouS(0); setCpuS(0); setReveal(false); setMsg("Pick a move. Try to beat the unbeatable."); };

  return (
    <div>
      <div className="flex justify-between items-end mb-3">
        <div className="text-xs uppercase tracking-widest text-[#475569]">You {you_s} · CPU {cpu_s}</div>
        <button onClick={reset} className="text-[10px] uppercase tracking-widest text-[#475569] hover:text-[#1A1A1A]">Reset</button>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="h-28 border border-[#1A1A1A]/15 flex flex-col items-center justify-center">
          <div className="text-[10px] uppercase tracking-widest text-[#475569]">You</div>
          <div className="text-5xl">{you ? EMOJI[you] : "·"}</div>
        </div>
        <div className="h-28 border border-[#1A1A1A]/15 flex flex-col items-center justify-center">
          <div className="text-[10px] uppercase tracking-widest text-[#475569]">CPU</div>
          <div className="text-5xl">{reveal && cpu ? EMOJI[cpu] : "?"}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {(["rock","paper","scissors"] as Move[]).map((m) => (
          <button key={m} onClick={() => play(m)} className="h-14 border border-[#1A1A1A]/15 text-2xl hover:bg-[#1A1A1A] hover:text-white transition-colors">
            {EMOJI[m]}
          </button>
        ))}
      </div>
      <div className="mt-2 text-[10px] uppercase tracking-widest text-[#475569]">{msg}</div>
    </div>
  );
}
