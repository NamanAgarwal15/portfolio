import { useEffect, useRef, useState } from "react";

const CHARS = "!<>-_\\/[]{}—=+*^?#________";

export default function Scramble({ text, className }: { text: string; className?: string }) {
  const [out, setOut] = useState(text);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setOut(text); return; }
    const el = ref.current;
    if (!el) return;
    let started = false;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started) {
          started = true;
          run();
        }
      });
    }, { threshold: 0.4 });
    obs.observe(el);

    function run() {
      const queue: { from: string; to: string; start: number; end: number; char?: string }[] = [];
      const len = Math.max(text.length, out.length);
      for (let i = 0; i < len; i++) {
        const from = out[i] || "";
        const to = text[i] || "";
        const start = Math.floor(Math.random() * 20);
        const end = start + Math.floor(Math.random() * 20) + 10;
        queue.push({ from, to, start, end });
      }
      let frame = 0;
      function tick() {
        let output = "";
        let complete = 0;
        for (let i = 0; i < queue.length; i++) {
          const q = queue[i];
          if (frame >= q.end) { complete++; output += q.to; }
          else if (frame >= q.start) {
            if (!q.char || Math.random() < 0.28) q.char = CHARS[Math.floor(Math.random() * CHARS.length)];
            output += q.char;
          } else output += q.from;
        }
        setOut(output);
        if (complete < queue.length) { frame++; requestAnimationFrame(tick); }
      }
      requestAnimationFrame(tick);
    }

    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return <span ref={ref} className={className}>{out}</span>;
}
