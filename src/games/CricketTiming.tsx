import { useEffect, useRef, useState } from "react";

export default function CricketTiming() {
  const [pos, setPos] = useState(0); // 0..100
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [last, setLast] = useState<string>("");
  const dirRef = useRef(1);
  const rafRef = useRef<number | null>(null);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const loop = () => {
    setPos((p) => {
      let n = p + dirRef.current * 1.6;
      if (n >= 100) { n = 100; dirRef.current = -1; }
      if (n <= 0) { n = 0; dirRef.current = 1; }
      return n;
    });
    rafRef.current = requestAnimationFrame(loop);
  };

  const start = () => {
    if (running) return;
    setRunning(true);
    rafRef.current = requestAnimationFrame(loop);
  };

  const swing = () => {
    if (!running) { start(); return; }
    const d = Math.abs(pos - 50);
    let runs = 0, msg = "";
    if (d < 3) { runs = 6; msg = "SIX! Maximum 🏏"; }
    else if (d < 8) { runs = 4; msg = "FOUR! Boundary"; }
    else if (d < 15) { runs = 2; msg = "Two runs"; }
    else if (d < 25) { runs = 1; msg = "Single"; }
    else { runs = 0; msg = "Dot ball — mistimed"; }
    setScore((s) => s + runs);
    setLast(msg);
  };

  const reset = () => { setScore(0); setLast(""); };

  return (
    <div>
      <div className="flex items-end justify-between mb-2">
        <div className="text-3xl font-light tabular-nums">{score}</div>
        <button onClick={reset} className="text-[10px] uppercase tracking-widest text-[#475569] hover:text-[#1A1A1A]">Reset</button>
      </div>
      <div className="relative h-3 bg-[#1A1A1A]/10 mb-1">
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[#1A1A1A]" />
        <div className="absolute top-0 bottom-0 left-[47%] w-[6%] bg-[#1A1A1A]/15" />
        <div className="absolute -top-1 -bottom-1 w-1 bg-red-600" style={{ left: `calc(${pos}% - 2px)` }} />
      </div>
      <div className="text-[10px] uppercase tracking-widest text-[#475569] mb-3">Stop the bar in the middle to time the swing</div>
      <button
        onClick={swing}
        className="w-full h-20 border border-[#1A1A1A]/15 text-sm font-light hover:bg-[#1A1A1A] hover:text-white transition-colors"
      >
        {running ? "SWING" : "START"}
      </button>
      <div className="mt-2 text-xs font-light text-[#475569] h-4">{last}</div>
    </div>
  );
}
