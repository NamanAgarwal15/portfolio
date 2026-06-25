import { useEffect, useMemo, useState } from "react";

const ICONS = ["★","◆","●","▲","■","✦","♣","✿"];

function shuffle<T>(a: T[]): T[] { return [...a].sort(() => Math.random() - 0.5); }

export default function MemoryMatch() {
  const [seed, setSeed] = useState(0);
  const deck = useMemo(() => shuffle([...ICONS, ...ICONS]), [seed]);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    if (open.length === 2) {
      const [a, b] = open;
      const id = window.setTimeout(() => {
        if (deck[a] === deck[b]) setMatched((m) => new Set([...m, a, b]));
        setOpen([]);
      }, 600);
      return () => window.clearTimeout(id);
    }
  }, [open, deck]);

  const flip = (i: number) => {
    if (open.includes(i) || matched.has(i) || open.length === 2) return;
    setOpen((o) => [...o, i]);
    if (open.length === 1) setMoves((n) => n + 1);
  };

  const done = matched.size === deck.length;
  const reset = () => { setSeed((s)=>s+1); setOpen([]); setMatched(new Set()); setMoves(0); };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div className="text-xs uppercase tracking-widest text-[#475569]">{done ? `Cleared in ${moves} moves` : `${moves} moves`}</div>
        <button onClick={reset} className="text-[10px] uppercase tracking-widest text-[#475569] hover:text-[#1A1A1A]">New</button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {deck.map((sym, i) => {
          const shown = open.includes(i) || matched.has(i);
          return (
            <button key={i} onClick={() => flip(i)} className={`aspect-square text-2xl border ${shown ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "border-[#1A1A1A]/15 hover:border-[#1A1A1A]"}`}>
              {shown ? sym : ""}
            </button>
          );
        })}
      </div>
      <div className="mt-2 text-[10px] uppercase tracking-widest text-[#475569]">Memory Match · 4×4</div>
    </div>
  );
}
