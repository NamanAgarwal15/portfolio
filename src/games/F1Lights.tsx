import { useEffect, useRef, useState } from "react";

type State = "idle" | "sequence" | "go" | "jumped" | "result";

export default function F1Lights() {
  const [state, setState] = useState<State>("idle");
  const [lit, setLit] = useState(0);
  const [time, setTime] = useState<number | null>(null);
  const [best, setBest] = useState<number | null>(() => {
    const v = typeof window !== "undefined" ? localStorage.getItem("f1_best") : null;
    return v ? Number(v) : null;
  });
  const startRef = useRef<number>(0);
  const timers = useRef<number[]>([]);

  const clearTimers = () => { timers.current.forEach(window.clearTimeout); timers.current = []; };
  useEffect(() => () => clearTimers(), []);

  const start = () => {
    clearTimers();
    setTime(null);
    setLit(0);
    setState("sequence");
    for (let i = 1; i <= 5; i++) {
      timers.current.push(window.setTimeout(() => setLit(i), i * 900));
    }
    const offDelay = 5 * 900 + 400 + Math.random() * 1800;
    timers.current.push(window.setTimeout(() => {
      setLit(0);
      startRef.current = performance.now();
      setState("go");
    }, offDelay));
  };

  const click = () => {
    if (state === "idle" || state === "result" || state === "jumped") { start(); return; }
    if (state === "sequence") { clearTimers(); setState("jumped"); return; }
    if (state === "go") {
      const t = Math.round(performance.now() - startRef.current);
      setTime(t); setState("result");
      if (best === null || t < best) { setBest(t); localStorage.setItem("f1_best", String(t)); }
    }
  };

  const label =
    state === "idle" ? "Click — wait for lights out"
    : state === "sequence" ? "Hold steady…"
    : state === "go" ? "GO GO GO"
    : state === "jumped" ? "Jump start! Click to retry"
    : `${time} ms · click to retry`;

  return (
    <div>
      <div className="flex gap-2 justify-center mb-4">
        {[1,2,3,4,5].map((i) => (
          <div key={i} className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 ${lit >= i ? "bg-red-600 border-red-700 shadow-[0_0_24px_rgba(220,38,38,0.7)]" : "bg-[#1A1A1A]/10 border-[#1A1A1A]/20"}`} />
        ))}
      </div>
      <button
        type="button"
        onClick={click}
        className={`w-full h-32 border border-[#1A1A1A]/15 flex items-center justify-center text-sm font-light tracking-wide transition-colors duration-150 ${state === "go" ? "bg-[#1A1A1A] text-white" : "bg-transparent"}`}
      >
        {label}
      </button>
      <div className="mt-2 text-[10px] uppercase tracking-widest text-[#D97706]">
        F1 Start Lights · Best {best ? `${best} ms` : "—"}
      </div>
    </div>
  );
}
