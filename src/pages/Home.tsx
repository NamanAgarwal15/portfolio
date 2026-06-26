import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Counter from "@/components/Counter";
import SEO from "@/components/SEO";

const name = "Naman Agarwal";

const STATS = [
  { value: 7.93, decimals: 2, label: "CGPA", quip: "7.93 out of 10. The 0.07 was sacrificed to shipping actual projects." },
  { value: 4, decimals: 0, label: "Internships", to: "/work", quip: "4 internships before final year. Data science, IoT, marketing, web dev — he couldn't pick one so he did all of them." },
  { value: 4, decimals: 0, label: "Projects", to: "/work", quip: "4 projects. All of them actually work. Most of the time." },
];

export default function Home() {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 min-h-[calc(100vh-5rem)] flex flex-col justify-center py-10 sm:py-0">
      <SEO title="Home" description="Naman Agarwal — Computer Science & AI undergraduate at BML Munjal University. Internships, projects, and an AI assistant." path="/" />
      <div style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: "13px", color: "#D97706", opacity: 0.8 }} className="mb-4">
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
        transition={{ delay: name.length * 0.03 + 0.1, duration: 0.5 }}
        className="mt-6 text-lg sm:text-xl font-light text-[#666666]"

      >
        Data Science & AI · BML Munjal University '27
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: name.length * 0.03 + 0.3, duration: 0.5 }}
        className="mt-6 max-w-2xl text-base font-light text-[#1A1A1A]/80 leading-relaxed"
      >
        Computer Science undergraduate with hands-on experience across startups, focused on
        applying data science and AI to solve real-world problems.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: name.length * 0.03 + 0.5, duration: 0.5 }}
        className="mt-10 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 sm:flex-wrap"
      >
        <Link
          to="/work"
          className="border border-[#1A1A1A] px-6 py-3 text-sm font-medium hover:bg-[#1A1A1A] hover:text-[#F5F2EA] transition-colors duration-300"
        >
          View My Work
        </Link>
        <Link
          to="/about"
          className="border border-[#1A1A1A] px-6 py-3 text-sm font-medium hover:bg-[#1A1A1A] hover:text-[#F5F2EA] transition-colors duration-300"
        >
          About
        </Link>
        <a
          href={`${import.meta.env.BASE_URL}Naman_Agarwal.pdf`}
          download="Naman_Agarwal.pdf"
          className="border border-[#1A1A1A] px-6 py-3 text-sm font-medium hover:bg-[#1A1A1A] hover:text-[#F5F2EA] transition-colors duration-300"
        >
          Download Resume
        </a>
        <Link
          to="/contact"
          className="border border-[#1A1A1A] px-6 py-3 text-sm font-medium hover:bg-[#1A1A1A] hover:text-[#F5F2EA] transition-colors duration-300"
        >
          Get In Touch
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: name.length * 0.03 + 0.7, duration: 0.5 }}
        className="mt-20 mb-24"
      >
        <div className="h-px bg-[#1A1A1A]/15 w-full" />
        <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-6">
          {STATS.map((s) => {
            const inner = (
              <>
                <div className="text-2xl sm:text-5xl font-light tracking-tight text-[#1A1A1A]">
                  <Counter to={s.value} decimals={s.decimals} />
                </div>
                <div className="mt-2 text-xs uppercase tracking-widest text-[#888888] font-light">
                  {s.label}
                </div>
              </>
            );
            return s.to ? (
              <Link
                key={s.label}
                to={s.to}
                data-companion={s.quip}
                className="block group transition-opacity hover:opacity-80"
              >
                {inner}
              </Link>
            ) : (
              <div key={s.label} data-companion={s.quip}>
                {inner}
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
