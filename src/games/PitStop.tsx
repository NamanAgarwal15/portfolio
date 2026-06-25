import { useEffect, useRef, useState } from "react";

const STEPS = ["Jack up", "Front-left", "Front-right", "Rear-left", "Rear-right", "Jack down"];

export default function PitStop() {
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [best, setBest] = useState<number | null>(() => {
    const v = typeof window !== "undefined" ? localStorage.getItem("pit_best") : null;
    return v ? Number(v) : null;
  });
  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const tick = () => {
    setTime((performance.now() - startRef.current) / 1000);
    rafRef.current = requestAnimationFrame(tick);
  };

  const start = () => {
    setStep(0); setTime(0); setRunning(true);
    startRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  };

  const click = () => {
    if (!running) { start(); return; }
    const next = step + 1;
    if (next >= STEPS.length) {
      const final = (performance.now() - startRef.current) / 1000;
      setTime(final);
      setRunning(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (best === null || final < best) { setBest(final); localStorage.setItem("pit_best", final.toFixed(3)); }
      setStep(STEPS.length);
    } else {
      setStep(next);
    }
  };

  return (
    <div>
      <div className="text-3xl font-light tabular-nums mb-2">{time.toFixed(2)}s</div>
      <div className="text-sm font-light text-[#475569] mb-3">
        {running ? `Tap: ${STEPS[step]}` : step >= STEPS.length ? "Stop complete — tap to retry" : "Tap to start the stop"}
      </div>
      <button
        onClick={click}
        className="w-full h-24 border border-[#1A1A1A]/15 text-sm font-light tracking-wide hover:bg-[#1A1A1A] hover:text-white transition-colors"
      >
        {running ? "TAP" : "START"}
      </button>
      <div className="mt-2 text-[10px] uppercase tracking-widest text-[#475569]">
        Pit Stop · Best {best ? `${best.toFixed(2)}s` : "—"}
      </div>
    </div>
  );
}
