import { useEffect, useRef, useState } from "react";

const SIZE = 9;
const DURATION = 20;

export default function WhackAMole() {
  const [active, setActive] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [best, setBest] = useState<number>(() => Number(localStorage.getItem("mole_best") || 0));
  const moleRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);

  useEffect(() => () => { if (moleRef.current) window.clearTimeout(moleRef.current); if (tickRef.current) window.clearInterval(tickRef.current); }, []);

  const pop = () => {
    setActive(Math.floor(Math.random() * SIZE));
    moleRef.current = window.setTimeout(() => { setActive(null); moleRef.current = window.setTimeout(pop, 200 + Math.random() * 300); }, 600 + Math.random() * 400);
  };

  const start = () => {
    setScore(0); setTime(DURATION); setRunning(true);
    moleRef.current = window.setTimeout(pop, 300);
    tickRef.current = window.setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          if (moleRef.current) window.clearTimeout(moleRef.current);
          if (tickRef.current) window.clearInterval(tickRef.current);
          setRunning(false); setActive(null);
          setScore((s) => { if (s > best) { setBest(s); localStorage.setItem("mole_best", String(s)); } return s; });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const whack = (i: number) => { if (!running) return; if (i === active) { setScore((s) => s + 1); setActive(null); } };

  return (
    <div>
      <div className="flex justify-between items-end mb-3">
        <div className="text-3xl font-light tabular-nums">{score}</div>
        <div className="text-xs uppercase tracking-widest text-[#475569]">{running ? `${time}s` : `Best ${best}`}</div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {Array.from({ length: SIZE }).map((_, i) => (
          <button key={i} onClick={() => whack(i)} className={`aspect-square border text-3xl transition-colors ${active === i ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "border-[#1A1A1A]/15"}`}>
            {active === i ? "●" : ""}
          </button>
        ))}
      </div>
      {!running && (
        <button onClick={start} className="w-full h-12 border border-[#1A1A1A]/15 hover:bg-[#1A1A1A] hover:text-white text-sm">{score ? "PLAY AGAIN" : "START"}</button>
      )}
    </div>
  );
}
