import { useMemo, useState } from "react";

type Size = 4 | 6 | 8;
type Grid = (number | null)[][];

// Generate a random Latin square of size N (digits 1..N) using a backtracking shuffle.
function genLatin(n: number): number[][] {
  const grid: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const fill = (r: number): boolean => {
    if (r === n) return true;
    const order = Array.from({ length: n }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    return tryRow(r, 0, order, grid, n) && fill(r + 1);
  };
  // simple per-row try
  const tryRow = (r: number, c: number, opts: number[], g: number[][], N: number): boolean => {
    if (c === N) return true;
    for (const v of opts) {
      let ok = true;
      for (let i = 0; i < r; i++) if (g[i][c] === v) { ok = false; break; }
      if (!ok) continue;
      if (g[r].includes(v)) continue;
      g[r][c] = v;
      if (tryRow(r, c + 1, opts, g, N)) return true;
      g[r][c] = 0;
    }
    return false;
  };
  fill(0);
  return grid;
}

function makePuzzle(n: Size, holePct = 0.5): { puzzle: Grid; solution: number[][] } {
  const sol = genLatin(n);
  const puzzle: Grid = sol.map((r) => r.map((v) => v as number | null));
  const cells = n * n;
  const holes = Math.floor(cells * holePct);
  const idx = Array.from({ length: cells }, (_, i) => i).sort(() => Math.random() - 0.5).slice(0, holes);
  idx.forEach((k) => { puzzle[Math.floor(k / n)][k % n] = null; });
  return { puzzle, solution: sol };
}

function isValid(g: Grid, n: number) {
  for (let i = 0; i < n; i++) {
    const r = new Set<number>(), c = new Set<number>();
    for (let j = 0; j < n; j++) {
      const a = g[i][j], b = g[j][i];
      if (a) { if (r.has(a)) return false; r.add(a); }
      if (b) { if (c.has(b)) return false; c.add(b); }
    }
  }
  return true;
}

export default function MiniSudoku() {
  const [size, setSize] = useState<Size>(4);
  const [seed, setSeed] = useState(0);
  const { puzzle } = useMemo(() => makePuzzle(size, size === 4 ? 0.4 : size === 6 ? 0.45 : 0.5), [size, seed]);
  const [grid, setGrid] = useState<Grid>(puzzle.map((r) => [...r]));
  const [fixed, setFixed] = useState<boolean[][]>(puzzle.map((r) => r.map((c) => c !== null)));

  const valid = isValid(grid, size);
  const full = grid.flat().every(Boolean);
  const solved = full && valid;

  const newGame = (nextSize?: Size) => {
    const s = nextSize ?? size;
    if (nextSize) setSize(nextSize);
    setSeed((x) => x + 1);
    const { puzzle: p } = makePuzzle(s, s === 4 ? 0.4 : s === 6 ? 0.45 : 0.5);
    setGrid(p.map((r) => [...r]));
    setFixed(p.map((r) => r.map((c) => c !== null)));
  };

  const set = (r: number, c: number, v: string) => {
    if (fixed[r][c]) return;
    const n = parseInt(v); const val = n >= 1 && n <= size ? n : null;
    const ng = grid.map((row) => [...row]); ng[r][c] = val; setGrid(ng);
  };

  const maxW = size === 4 ? 240 : size === 6 ? 300 : 360;

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-1">
          {([4, 6, 8] as Size[]).map((s) => (
            <button
              key={s}
              onClick={() => newGame(s)}
              className={`px-2 py-1 text-[10px] uppercase tracking-widest border ${size === s ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "border-[#1A1A1A]/20 hover:border-[#1A1A1A]"}`}
            >
              {s}×{s}
            </button>
          ))}
        </div>
        <button onClick={() => newGame()} className="text-[10px] uppercase tracking-widest text-[#475569] hover:text-[#1A1A1A]">New</button>
      </div>
      <div className="text-xs uppercase tracking-widest text-[#475569] mb-2">
        {solved ? "Solved ✓" : valid ? "Looking good…" : "Conflict — repeat in row/column"}
      </div>
      <div
        className="grid mx-auto border border-[#1A1A1A]/30"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`, maxWidth: maxW }}
      >
        {grid.map((row, r) => row.map((v, c) => (
          <input
            key={`${r}-${c}`}
            value={v ?? ""}
            onChange={(e) => set(r, c, e.target.value.slice(-1))}
            disabled={fixed[r][c]}
            inputMode="numeric"
            maxLength={1}
            className={`aspect-square text-center text-base font-light bg-transparent border border-[#1A1A1A]/15 focus:outline-none focus:bg-[#1A1A1A]/5 ${fixed[r][c] ? "font-medium text-[#1A1A1A]" : "text-[#475569]"}`}
          />
        )))}
      </div>
      <div className="mt-2 text-[10px] uppercase tracking-widest text-[#475569] text-center">
        Latin-square Sudoku · digits 1–{size}
      </div>
    </div>
  );
}
