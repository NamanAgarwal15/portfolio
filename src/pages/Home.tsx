import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Counter from "@/components/Counter";
import SEO from "@/components/SEO";
import Brainteaser from "@/components/Brainteaser";

const name = "Naman Agarwal";

export default function Home() {
  return (
    <section className="max-w-5xl mx-auto px-6 min-h-[calc(100vh-5rem)] flex flex-col justify-center">
      <SEO title="Home" description="Naman Agarwal — Computer Science & AI undergraduate at BML Munjal University. Internships, projects, and an AI assistant." path="/" />
      <h1 className="text-5xl sm:text-7xl md:text-8xl font-light tracking-tight leading-[1.05]">
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
        className="mt-6 text-lg sm:text-xl font-light text-[#475569]"
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
        className="mt-10 flex items-center gap-6 flex-wrap"
      >
        <Link
          to="/work"
          className="border border-[#1A1A1A] px-6 py-3 text-sm font-medium hover:bg-[#1A1A1A] hover:text-[#F7F5F2] transition-colors duration-300"
        >
          View My Work
        </Link>
        <a
          href={`${import.meta.env.BASE_URL}Naman_Agarwal.pdf`}
          download="Naman_Agarwal.pdf"
          className="nav-link text-sm font-light"
        >
          Download Resume
        </a>
        <Link to="/contact" className="nav-link text-sm font-light">
          Get In Touch
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: name.length * 0.03 + 0.7, duration: 0.5 }}
        className="mt-20"
      >
        <div className="h-px bg-[#475569]/20 w-full" />
        <div className="mt-10 grid grid-cols-3 gap-6">
          {[
            { value: 7.93, decimals: 2, label: "CGPA" },
            { value: 4, decimals: 0, label: "Internships" },
            { value: 4, decimals: 0, label: "Projects" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl sm:text-5xl font-light tracking-tight">
                <Counter to={s.value} decimals={s.decimals} />
              </div>
              <div className="mt-2 text-xs uppercase tracking-widest text-[#475569] font-light">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: name.length * 0.03 + 0.9, duration: 0.5 }}
        className="mt-16 max-w-2xl"
      >
        <Brainteaser />
        <p className="mt-3 text-[10px] uppercase tracking-widest text-[#475569] font-light">
          50 brainteasers · auto-rotates every 12s · or hit next
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-20 mb-24 border border-[#1A1A1A]/15 p-8 bg-gradient-to-br from-pink-100 via-amber-100 to-sky-100"
      >
        <div className="text-[10px] uppercase tracking-widest text-[#475569]">Bored of resumes?</div>
        <h3 className="mt-2 text-2xl sm:text-3xl font-light tracking-tight">Skip the small talk.</h3>
        <p className="mt-2 text-sm font-light text-[#1A1A1A]/80 max-w-xl">
          Nine mini-games — F1 lights, a full cricket match, UFC reflex, an unbeatable rock-paper-scissors, sudoku in three sizes, and more. Turn on Party Mode while you're at it.
        </p>
        <Link
          to="/arcade?party=1"
          className="mt-5 inline-block px-6 py-3 text-sm font-medium bg-[#1A1A1A] text-[#F7F5F2] hover:bg-pink-500 transition-colors"
        >
          🪩 Take me to the party →
        </Link>
      </motion.div>
    </section>
  );
}
