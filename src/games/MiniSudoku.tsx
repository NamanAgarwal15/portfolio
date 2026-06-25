import { useMemo, useState } from "react";

// 4x4 sudoku with 2x2 boxes, digits 1..4
const SOLVED = [
  [1,2,3,4],
  [3,4,1,2],
  [2,1,4,3],
  [4,3,2,1],
];

function makePuzzle(holes = 8): (number|null)[][] {
  const g = SOLVED.map(r => [...r]) as (number|null)[][];
  const idx = Array.from({length:16},(_,i)=>i).sort(()=>Math.random()-0.5).slice(0, holes);
  idx.forEach(k => { g[Math.floor(k/4)][k%4] = null; });
  return g;
}

function isValid(g: (number|null)[][]) {
  for (let i=0;i<4;i++) {
    const r = new Set<number>(), c = new Set<number>();
    for (let j=0;j<4;j++) {
      const a = g[i][j], b = g[j][i];
      if (a) { if (r.has(a)) return false; r.add(a); }
      if (b) { if (c.has(b)) return false; c.add(b); }
    }
  }
  for (let br=0;br<2;br++) for (let bc=0;bc<2;bc++) {
    const s = new Set<number>();
    for (let i=0;i<2;i++) for (let j=0;j<2;j++) {
      const v = g[br*2+i][bc*2+j]; if (v) { if (s.has(v)) return false; s.add(v); }
    }
  }
  return true;
}

export default function MiniSudoku() {
  const [seed, setSeed] = useState(0);
  const initial = useMemo(() => makePuzzle(8), [seed]);
  const [grid, setGrid] = useState<(number|null)[][]>(initial.map(r=>[...r]));
  const [fixed, setFixed] = useState<boolean[][]>(initial.map(r => r.map(c => c !== null)));

  const fillable = grid.flat().every(Boolean);
  const valid = isValid(grid);
  const solved = fillable && valid;

  const set = (r: number, c: number, v: string) => {
    if (fixed[r][c]) return;
    const n = parseInt(v); const val = n>=1&&n<=4 ? n : null;
    const ng = grid.map(row => [...row]); ng[r][c] = val; setGrid(ng);
  };

  const newGame = () => { setSeed(s => s+1); const p = makePuzzle(8); setGrid(p.map(r=>[...r])); setFixed(p.map(r => r.map(c => c !== null))); };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div className="text-xs uppercase tracking-widest text-[#475569]">
          {solved ? "Solved ✓" : valid ? "Looking good…" : "Conflict"}
        </div>
        <button onClick={newGame} className="text-[10px] uppercase tracking-widest text-[#475569] hover:text-[#1A1A1A]">New</button>
      </div>
      <div className="grid grid-cols-4 max-w-[240px] mx-auto border border-[#1A1A1A]/30">
        {grid.map((row, r) => row.map((v, c) => (
          <input
            key={`${r}-${c}`}
            value={v ?? ""}
            onChange={(e) => set(r, c, e.target.value.slice(-1))}
            disabled={fixed[r][c]}
            inputMode="numeric"
            maxLength={1}
            className={`aspect-square text-center text-lg font-light bg-transparent border border-[#1A1A1A]/15 focus:outline-none focus:bg-[#1A1A1A]/5 ${fixed[r][c] ? "font-medium text-[#1A1A1A]" : "text-[#475569]"} ${c===1?"border-r-[#1A1A1A]/40":""} ${r===1?"border-b-[#1A1A1A]/40":""}`}
          />
        )))}
      </div>
      <div className="mt-2 text-[10px] uppercase tracking-widest text-[#475569] text-center">Mini Sudoku · 4×4 · digits 1–4</div>
    </div>
  );
}
