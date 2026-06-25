import { useEffect, useRef, useState } from "react";

type Cue = "left" | "right" | "duck" | null;
const CUES: Exclude<Cue, null>[] = ["left", "right", "duck"];

export default function UFCDodge() {
  const [cue, setCue] = useState<Cue>(null);
  const [score, setScore] = useState(0);
  const [hp, setHp] = useState(3);
  const [running, setRunning] = useState(false);
  const [best, setBest] = useState<number | null>(() => {
    const v = typeof window !== "undefined" ? localStorage.getItem("ufc_best") : null;
    return v ? Number(v) : null;
  });
  const timeoutRef = useRef<number | null>(null);
  const speedRef = useRef(1400);
  const cueRef = useRef<Cue>(null);

  const clear = () => { if (timeoutRef.current) window.clearTimeout(timeoutRef.current); };
  useEffect(() => () => clear(), []);

  const lose = () => {
    clear(); setRunning(false); setCue(null);
    if (best === null || score > best) { setBest(score); localStorage.setItem("ufc_best", String(score)); }
  };

  const nextCue = () => {
    const c = CUES[Math.floor(Math.random() * CUES.length)];
    setCue(c); cueRef.current = c;
    timeoutRef.current = window.setTimeout(() => {
      // missed
      setHp((h) => {
        const nh = h - 1;
        if (nh <= 0) lose();
        return nh;
      });
      setCue(null); cueRef.current = null;
      if (cueRef.current === null) {
        timeoutRef.current = window.setTimeout(nextCue, 400);
      }
    }, speedRef.current);
  };

  const start = () => {
    clear();
    setScore(0); setHp(3); speedRef.current = 1400; setRunning(true);
    timeoutRef.current = window.setTimeout(nextCue, 500);
  };

  const respond = (r: Exclude<Cue, null>) => {
    if (!running || !cueRef.current) return;
    if (r === cueRef.current) {
      clear();
      setScore((s) => s + 1);
      speedRef.current = Math.max(450, speedRef.current - 40);
      setCue(null); cueRef.current = null;
      timeoutRef.current = window.setTimeout(nextCue, 350);
    } else {
      clear();
      setHp((h) => {
        const nh = h - 1;
        if (nh <= 0) { lose(); return 0; }
        return nh;
      });
      setCue(null); cueRef.current = null;
      timeoutRef.current = window.setTimeout(nextCue, 350);
    }
  };

  const arrow = cue === "left" ? "←" : cue === "right" ? "→" : cue === "duck" ? "↓" : "—";

  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <div className="text-3xl font-light tabular-nums">{score}</div>
        <div className="text-xs uppercase tracking-widest text-[#475569]">HP {"♥".repeat(hp)}{"♡".repeat(Math.max(0,3-hp))}</div>
      </div>
      <div className="h-24 border border-[#1A1A1A]/15 flex items-center justify-center text-5xl font-light mb-3">
        {running ? arrow : "FIGHT"}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => running ? respond("left") : start()} className="h-12 border border-[#1A1A1A]/15 hover:bg-[#1A1A1A] hover:text-white text-sm">Slip ←</button>
        <button onClick={() => running ? respond("duck") : start()} className="h-12 border border-[#1A1A1A]/15 hover:bg-[#1A1A1A] hover:text-white text-sm">Duck ↓</button>
        <button onClick={() => running ? respond("right") : start()} className="h-12 border border-[#1A1A1A]/15 hover:bg-[#1A1A1A] hover:text-white text-sm">Slip →</button>
      </div>
      <div className="mt-2 text-[10px] uppercase tracking-widest text-[#475569]">
        UFC Reaction · Best {best ?? "—"}
      </div>
    </div>
  );
}
