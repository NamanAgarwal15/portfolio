import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";
import type { MouseEvent, ReactNode } from "react";
import Counter from "@/components/Counter";
import SEO from "@/components/SEO";

const name = "Naman Agarwal";

const STATS = [
  { value: 7.93, decimals: 2, label: "CGPA", quip: "7.93 out of 10. The 0.07 was sacrificed to shipping actual projects." },
  { value: 4, decimals: 0, label: "Internships", to: "/work", quip: "4 internships before final year." },
  { value: 4, decimals: 0, label: "Projects", to: "/work", quip: "4 projects. All of them actually work. Most of the time." },
];

function TiltCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 180, damping: 18 });
  const sry = useSpring(ry, { stiffness: 180, damping: 18 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 10);
    rx.set(-py * 10);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
      className={`tilt-3d ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const stageRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  // Parallax: blobs slowest, cards medium, foreground fastest (negative = upward as you scroll down)
  const yBlobs = useTransform(scrollY, [0, 800], [0, -60]);
  const yCards = useTransform(scrollY, [0, 800], [0, -140]);
  const yFore  = useTransform(scrollY, [0, 800], [0, -220]);

  return (
    <section ref={stageRef} className="relative max-w-5xl mx-auto px-4 sm:px-6 min-h-[calc(100vh-5rem)] py-10 sm:py-16 depth-stage overflow-visible">
      <SEO fullTitle="Naman Agarwal — Data Science & AI | Portfolio" title="Home" description="Naman Agarwal — Computer Science & AI undergraduate at BML Munjal University. Internships, projects, and an AI assistant." path="/" />

      {/* Layer 1 — background gradient blobs */}
      <motion.div aria-hidden style={{ y: yBlobs }} className="pointer-events-none absolute inset-0 -z-10">
        <div className="gradient-blob blob-a" style={{ width: 520, height: 520, top: -120, left: -160, background: "radial-gradient(circle at 30% 30%, #D97706, transparent 60%)" }} />
        <div className="gradient-blob blob-b" style={{ width: 460, height: 460, top: 120, right: -140, background: "radial-gradient(circle at 60% 40%, #B8C4A8, transparent 65%)" }} />
        <div className="gradient-blob blob-c" style={{ width: 420, height: 420, bottom: -120, left: "30%", background: "radial-gradient(circle at 50% 50%, #F2C57C, transparent 65%)" }} />
      </motion.div>

      {/* Layer 3 — foreground (hero text + CTAs) */}
      <motion.div style={{ y: yFore }} className="relative">
        <div style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: "13px", color: "#D97706", opacity: 0.85 }} className="mb-4">
          // cs undergrad · data science & ai · builder
        </div>
        <h1 className="text-[clamp(2.5rem,8vw,5rem)] sm:text-7xl md:text-8xl font-light tracking-tight leading-[1.05] break-words">
          {name.split("").map((c, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.4, ease: "easeOut" }}
              className="inline-block"
              style={{ whiteSpace: "pre" }}
            >
              {c}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-6 text-lg sm:text-xl font-light text-[#555]"
        >
          Data Science & AI · BML Munjal University '27
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6, ease: "easeOut" }}
          className="mt-10 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 sm:flex-wrap"
        >
          {[
            { to: "/work", label: "View My Work", type: "link" as const },
            { to: "/about", label: "About", type: "link" as const },
            { href: `${import.meta.env.BASE_URL}Naman_Agarwal.pdf`, label: "Download Resume", type: "anchor" as const },
            { to: "/contact", label: "Get In Touch", type: "link" as const },
          ].map((b) =>
            b.type === "link" ? (
              <Link
                key={b.label}
                to={b.to!}
                className="glass-card rounded-2xl px-6 py-3 text-sm font-medium text-[#1A1A1A] hover:-translate-y-0.5 transition-transform"
              >
                {b.label}
              </Link>
            ) : (
              <a
                key={b.label}
                href={b.href}
                download="Naman_Agarwal.pdf"
                className="glass-card rounded-2xl px-6 py-3 text-sm font-medium text-[#1A1A1A] hover:-translate-y-0.5 transition-transform"
              >
                {b.label}
              </a>
            ),
          )}
        </motion.div>
      </motion.div>

      {/* Layer 2 — glass cards (bio + stats) at medium parallax */}
      <motion.div style={{ y: yCards }} className="relative mt-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <TiltCard className="glass-card rounded-3xl p-8 sm:p-10 max-w-3xl">
            <p className="text-base sm:text-lg font-light text-[#1A1A1A]/85 leading-relaxed">
              Computer Science undergraduate with hands-on experience across startups, focused on
              applying data science and AI to solve real-world problems.
            </p>
          </TiltCard>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {STATS.map((s, i) => {
            const inner = (
              <TiltCard className="glass-card rounded-3xl p-6 sm:p-7 h-full">
                <div className="text-3xl sm:text-5xl font-light tracking-tight text-[#1A1A1A]" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                  <Counter to={s.value} decimals={s.decimals} />
                </div>
                <div className="mt-3 text-xs uppercase tracking-widest text-[#666] font-light">
                  {s.label}
                </div>
              </TiltCard>
            );
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 + i * 0.12 }}
              >
                {s.to ? (
                  <Link to={s.to} data-companion={s.quip} className="block">
                    {inner}
                  </Link>
                ) : (
                  <div data-companion={s.quip}>{inner}</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
