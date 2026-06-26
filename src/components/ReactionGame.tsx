import { useEffect, useRef, useState } from "react";

type State = "idle" | "waiting" | "go" | "result" | "early";

export default function ReactionGame() {
  const [state, setState] = useState<State>("idle");
  const [time, setTime] = useState<number | null>(null);
  const [best, setBest] = useState<number | null>(() => {
    const v = typeof window !== "undefined" ? localStorage.getItem("rt_best") : null;
    return v ? Number(v) : null;
  });
  const startRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const start = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setState("waiting");
    setTime(null);
    const delay = 800 + Math.random() * 2200;
    timerRef.current = window.setTimeout(() => {
      startRef.current = performance.now();
      setState("go");
    }, delay);
  };

  const click = () => {
    if (state === "idle" || state === "result" || state === "early") {
      start();
      return;
    }
    if (state === "waiting") {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      setState("early");
      return;
    }
    if (state === "go") {
      const t = Math.round(performance.now() - startRef.current);
      setTime(t);
      setState("result");
      if (best === null || t < best) {
        setBest(t);
        localStorage.setItem("rt_best", String(t));
      }
    }
  };

  const bg =
    state === "go"
      ? "bg-[#1A1A1A] text-white"
      : state === "waiting"
      ? "bg-[#D97706]/15 text-[#D97706]"
      : state === "early"
      ? "bg-[#D97706]/10 text-[#1A1A1A]"
      : "bg-transparent text-[#1A1A1A]";

  const label =
    state === "idle"
      ? "Click to start"
      : state === "waiting"
      ? "Wait for black…"
      : state === "go"
      ? "CLICK!"
      : state === "early"
      ? "Too soon — click to retry"
      : `${time} ms · click to retry`;

  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-[#D97706] font-light mb-3">
        Reaction Test
      </div>
      <button
        type="button"
        onClick={click}
        className={`w-full h-32 sm:h-40 border border-[#1A1A1A]/15 flex items-center justify-center text-sm sm:text-base font-light tracking-wide transition-colors duration-150 ${bg}`}
      >
        {label}
      </button>
      <div className="mt-2 text-[10px] uppercase tracking-widest text-[#D97706] font-light">
        Best {best !== null ? `${best} ms` : "—"}
      </div>
    </div>
  );
}
