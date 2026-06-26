import { motion } from "framer-motion";
import { Reveal } from "@/components/Section";
import SEO from "@/components/SEO";

const skills: Record<string, { items: string[]; quip: string }> = {
  Languages: {
    items: ["Java", "Python"],
    quip: "Java for interviews. Python for everything real. He knows the difference.",
  },
  "Frameworks & Libraries": {
    items: ["NumPy", "pandas", "scikit-learn", "Matplotlib", "Seaborn", "OpenCV", "TensorFlow"],
    quip: "NumPy to TensorFlow. He's used all of these in actual projects, not just listed them.",
  },
  Tools: {
    items: ["MySQL", "Git", "JIRA", "VS Code", "Kaggle Notebooks", "Excel"],
    quip: "JIRA user since internship one. Has opinions about sprint planning now. Unsolicited ones.",
  },
  Concepts: {
    items: ["OOP", "DBMS", "Algorithms", "Agile Development"],
    quip: "",
  },
};

const education = [
  {
    title: "B.Tech CSE — Data Science & AI",
    sub: "BML Munjal University · 2023–2027 · CGPA: 7.93",
  },
  { title: "12th CBSE, Rajasthan", sub: "86.8%" },
  { title: "10th ICSE, West Bengal", sub: "84.66%" },
];

const achievements = [
  "First Runner-Up, TechSparx.I Showcase (BMU) — 80+ teams — Smart Wildfire-Fighting Robot",
  "Co-Chair, Innovation Vertical, Young Indians BMU — Aug 2024 to Aug 2025",
  "Foundations of Project Management — Google, Coursera, May 2026",
];

export default function About() {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-10">
      <SEO fullTitle="About — Naman Agarwal | CSE Undergrad, BML Munjal University" title="About" description="About Naman Agarwal — CSE undergraduate at BML Munjal University, focused on Data Science, AI, and shipping real systems." path="/#/about" />
      <Reveal>
        <h2 className="text-3xl sm:text-4xl font-light tracking-tight">About</h2>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="glass-card rounded-3xl p-8 sm:p-10">
          <p className="max-w-3xl text-base sm:text-lg font-light leading-relaxed text-[#1A1A1A]/85">
            CSE undergrad at BML Munjal University, passionate about Technology, Innovation and
            Entrepreneurship. I work where ML and DL meet the real world — turning data into
            decisions that matter. New ideas captivate me and I build on them. Always open to
            connecting with like-minded people and exploring ways to make an impact in Data
            Science and AI.
          </p>
        </div>
      </Reveal>

      <Reveal>
        <div className="glass-card rounded-3xl p-8 sm:p-10">
          <h3 className="text-sm uppercase tracking-widest text-[#1A1A1A] font-semibold">Skills</h3>
          <div className="mt-8 space-y-8">
            {Object.entries(skills).map(([group, { items, quip }]) => (
              <div key={group} data-companion={quip || undefined}>
                <div className="text-xs uppercase tracking-widest text-[#666666]/80 font-light">
                  {group}
                </div>
                <motion.div
                  className="mt-3 flex flex-wrap gap-2"
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={{ show: { transition: { staggerChildren: 0.05 } } }}
                >
                  {items.map((s) => (
                    <motion.span
                      key={s}
                      variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                      className="glass-card rounded-full px-4 py-1.5 text-sm font-light text-[#1A1A1A]"
                    >
                      {s}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="glass-card rounded-3xl p-8 sm:p-10">
          <h3 className="text-sm uppercase tracking-widest text-[#1A1A1A] font-semibold">Education</h3>
          <ul className="mt-6 divide-y divide-white/40">
            {education.map((e, i) => (
              <li key={i} className="py-5">
                <div className="font-medium">{e.title}</div>
                <div className="text-sm font-light text-[#666666] mt-1">{e.sub}</div>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <Reveal>
        <div className="glass-card rounded-3xl p-8 sm:p-10">
          <h3 className="text-sm uppercase tracking-widest text-[#1A1A1A] font-semibold">Achievements</h3>
          <ul className="mt-6 space-y-4">
            {achievements.map((a, i) => (
              <li key={i} className="font-light leading-relaxed">— {a}</li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
