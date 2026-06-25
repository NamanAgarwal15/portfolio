import { useEffect, useState } from "react";

type Cell = "X" | "O" | null;
const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function winner(b: Cell[]): Cell | "draw" | null {
  for (const [a,c,d] of LINES) if (b[a] && b[a]===b[c] && b[a]===b[d]) return b[a];
  return b.every(Boolean) ? "draw" : null;
}

function aiMove(b: Cell[]): number {
  // Try win
  for (let i=0;i<9;i++) if (!b[i]) { const t=[...b]; t[i]="O"; if (winner(t)==="O") return i; }
  // Block
  for (let i=0;i<9;i++) if (!b[i]) { const t=[...b]; t[i]="X"; if (winner(t)==="X") return i; }
  if (!b[4]) return 4;
  const corners=[0,2,6,8].filter(i=>!b[i]); if (corners.length) return corners[Math.floor(Math.random()*corners.length)];
  const open=b.map((v,i)=>v?-1:i).filter(i=>i>=0); return open[Math.floor(Math.random()*open.length)];
}

export default function TicTacToe() {
  const [b, setB] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<"X"|"O">("X");
  const w = winner(b);

  useEffect(() => {
    if (turn === "O" && !w) {
      const t = window.setTimeout(() => {
        const i = aiMove(b);
        if (i != null) {
          const nb = [...b]; nb[i] = "O"; setB(nb); setTurn("X");
        }
      }, 350);
      return () => window.clearTimeout(t);
    }
  }, [turn, b, w]);

  const click = (i: number) => {
    if (w || b[i] || turn !== "X") return;
    const nb = [...b]; nb[i] = "X"; setB(nb); setTurn("O");
  };
  const reset = () => { setB(Array(9).fill(null)); setTurn("X"); };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div className="text-xs uppercase tracking-widest text-[#475569]">
          {w === "X" ? "You win" : w === "O" ? "AI wins" : w === "draw" ? "Draw" : turn === "X" ? "Your turn (X)" : "AI thinking…"}
        </div>
        <button onClick={reset} className="text-[10px] uppercase tracking-widest text-[#475569] hover:text-[#1A1A1A]">Reset</button>
      </div>
      <div className="grid grid-cols-3 gap-1 max-w-[240px] mx-auto">
        {b.map((c, i) => (
          <button key={i} onClick={() => click(i)} className="aspect-square border border-[#1A1A1A]/20 text-3xl font-light hover:bg-[#1A1A1A]/5">
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
