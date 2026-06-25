import { useEffect } from "react";
import confetti from "canvas-confetti";

const SEQ = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];

export default function KonamiEgg() {
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let idx = 0;
    function onKey(e: KeyboardEvent) {
      const k = e.key;
      const expected = SEQ[idx];
      if (k.toLowerCase() === expected.toLowerCase()) {
        idx++;
        if (idx === SEQ.length) {
          idx = 0;
          fire();
          document.documentElement.classList.add("brutalist");
        }
      } else {
        idx = k === SEQ[0] ? 1 : 0;
      }
      if (e.key === "Escape") {
        document.documentElement.classList.remove("brutalist");
      }
    }
    function fire() {
      const duration = 1500;
      const end = Date.now() + duration;
      (function frame() {
        confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#1A1A1A", "#e85d3a", "#ffeb3b"] });
        confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#1A1A1A", "#e85d3a", "#ffeb3b"] });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
