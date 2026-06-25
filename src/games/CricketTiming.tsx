import { useEffect, useRef, useState } from "react";

// Proper mini-cricket: 2 innings, 2 overs (12 balls) each, 3 wickets.
// Use the timing bar to swing. Center = SIX. Outside = WICKET.

const OVERS = 2;
const BALLS_PER_OVER = 6;
const WICKETS = 3;

type Phase = "ready" | "batting" | "innings-break" | "over";
type Inning = { runs: number; balls: number; wickets: number; events: string[] };

function emptyInning(): Inning { return { runs: 0, balls: 0, wickets: 0, events: [] }; }

function evalSwing(pos: number): { runs: number; out: boolean; label: string } {
  const d = Math.abs(pos - 50);
  if (d < 3) return { runs: 6, out: false, label: "SIX!" };
  if (d < 7) return { runs: 4, out: false, label: "FOUR" };
  if (d < 14) return { runs: 2, out: false, label: "2 runs" };
  if (d < 22) return { runs: 1, out: false, label: "1 run" };
  if (d < 32) return { runs: 0, out: false, label: "dot ball" };
  return { runs: 0, out: true, label: "OUT — bowled" };
}

export default function CricketTiming() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [pos, setPos] = useState(0);
  const [first, setFirst] = useState<Inning>(emptyInning());
  const [second, setSecond] = useState<Inning>(emptyInning());
  const [inningIdx, setInningIdx] = useState<0 | 1>(0);
  const [lastBall, setLastBall] = useState("");
  const dirRef = useRef(1);
  const rafRef = useRef<number | null>(null);
  const speedRef = useRef(1.7);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const loop = () => {
    setPos((p) => {
      let n = p + dirRef.current * speedRef.current;
      if (n >= 100) { n = 100; dirRef.current = -1; }
      if (n <= 0) { n = 0; dirRef.current = 1; }
      return n;
    });
    rafRef.current = requestAnimationFrame(loop);
  };

  const startBatting = () => {
    if (phase === "batting") return;
    speedRef.current = 1.5 + Math.random() * 0.9;
    dirRef.current = Math.random() < 0.5 ? 1 : -1;
    setPos(Math.random() * 100);
    setPhase("batting");
    rafRef.current = requestAnimationFrame(loop);
  };

  const stopLoop = () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current = null; };

  const current = inningIdx === 0 ? first : second;
  const setCurrent = inningIdx === 0 ? setFirst : setSecond;
  const target = inningIdx === 1 ? first.runs + 1 : null;

  const checkInningsEnd = (c: Inning): boolean => {
    if (c.wickets >= WICKETS) return true;
    if (c.balls >= OVERS * BALLS_PER_OVER) return true;
    if (target !== null && c.runs >= target) return true;
    return false;
  };

  const swing = () => {
    if (phase !== "batting") return;
    stopLoop();
    const r = evalSwing(pos);
    const next: Inning = {
      runs: current.runs + r.runs,
      balls: current.balls + 1,
      wickets: current.wickets + (r.out ? 1 : 0),
      events: [...current.events, `${current.balls + 1}: ${r.label}`].slice(-6),
    };
    setCurrent(next);
    setLastBall(r.label);

    if (checkInningsEnd(next)) {
      if (inningIdx === 0) {
        setPhase("innings-break");
      } else {
        setPhase("over");
      }
    } else {
      // small gap before next ball
      setTimeout(() => startBatting(), 600);
    }
  };

  const startChase = () => { setInningIdx(1); setPhase("ready"); setLastBall(""); };
  const reset = () => {
    stopLoop();
    setFirst(emptyInning()); setSecond(emptyInning());
    setInningIdx(0); setPhase("ready"); setLastBall("");
  };

  const overStr = (c: Inning) => `${Math.floor(c.balls / 6)}.${c.balls % 6}`;
  let resultLine = "";
  if (phase === "over") {
    if (second.runs > first.runs) resultLine = `You won by ${WICKETS - second.wickets} wickets`;
    else if (second.runs === first.runs) resultLine = "Match tied";
    else resultLine = `You lost by ${first.runs - second.runs} runs`;
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-1">
        <div className="text-[10px] uppercase tracking-widest text-[#475569]">
          {inningIdx === 0 ? "Innings 1 · Batting" : `Innings 2 · Target ${target}`}
        </div>
        <button onClick={reset} className="text-[10px] uppercase tracking-widest text-[#475569] hover:text-[#1A1A1A]">Reset</button>
      </div>
      <div className="flex items-baseline gap-3 mb-3">
        <div className="text-3xl font-light tabular-nums">{current.runs}/{current.wickets}</div>
        <div className="text-xs font-light text-[#475569]">({overStr(current)} ov)</div>
        {inningIdx === 1 && (
          <div className="text-xs font-light text-[#475569] ml-auto">
            need {Math.max(0, (target ?? 0) - current.runs)} in {OVERS * BALLS_PER_OVER - current.balls}
          </div>
        )}
      </div>

      <div className="relative h-3 bg-[#1A1A1A]/10 mb-1">
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[#1A1A1A]" />
        <div className="absolute top-0 bottom-0 left-[47%] w-[6%] bg-green-500/30" />
        <div className="absolute top-0 bottom-0 left-[43%] w-[14%] bg-[#1A1A1A]/10" />
        <div className="absolute -top-1 -bottom-1 w-1 bg-red-600" style={{ left: `calc(${pos}% - 2px)` }} />
      </div>
      <div className="text-[10px] uppercase tracking-widest text-[#475569] mb-3">Center = SIX · edges = OUT</div>

      {phase === "ready" && (
        <button onClick={startBatting} className="w-full h-20 border border-[#1A1A1A]/15 text-sm font-light hover:bg-[#1A1A1A] hover:text-white transition-colors">
          {inningIdx === 0 ? "START INNINGS" : "START CHASE"}
        </button>
      )}
      {phase === "batting" && (
        <button onClick={swing} className="w-full h-20 border border-[#1A1A1A] bg-[#1A1A1A] text-white text-sm font-light">SWING</button>
      )}
      {phase === "innings-break" && (
        <button onClick={startChase} className="w-full h-20 border border-[#1A1A1A]/15 text-sm font-light hover:bg-[#1A1A1A] hover:text-white transition-colors">
          Innings 1: {first.runs}/{first.wickets} ({overStr(first)}). Tap to chase {first.runs + 1}.
        </button>
      )}
      {phase === "over" && (
        <button onClick={reset} className="w-full h-20 border border-[#1A1A1A]/15 text-sm font-light hover:bg-[#1A1A1A] hover:text-white transition-colors">
          {resultLine} · Tap to replay
        </button>
      )}

      <div className="mt-3 flex items-start justify-between gap-4">
        <div className="text-xs font-light text-[#475569] min-h-[1rem]">{lastBall}</div>
        <div className="text-[10px] uppercase tracking-widest text-[#475569] text-right">
          {current.events.slice().reverse().map((e, i) => <div key={i}>{e}</div>)}
        </div>
      </div>
    </div>
  );
}
