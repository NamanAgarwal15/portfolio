import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Section";

const rows = [
  { label: "Email", value: "naman.agarwal.23cse@bmu.edu.in", href: "mailto:naman.agarwal.23cse@bmu.edu.in" },
  { label: "LinkedIn", value: "linkedin.com/in/namanagarwal159", href: "https://www.linkedin.com/in/namanagarwal159/" },
  { label: "GitHub", value: "github.com/NamanAgarwal15", href: "https://github.com/NamanAgarwal15" },
  { label: "Phone", value: "+91 7047159008", href: "tel:+917047159008" },
];

export default function Contact() {
  return (
    <section className="max-w-3xl mx-auto px-6 py-20">
      <Reveal>
        <h2 className="text-4xl sm:text-5xl font-light tracking-tight">Let's Connect</h2>
      </Reveal>
      <Reveal delay={0.05}>
        <p className="mt-5 font-light text-[#475569]">
          I'm open to internships, collaborations, and interesting problems.
        </p>
      </Reveal>

      <ul className="mt-16">
        {rows.map((r, i) => (
          <motion.li
            key={r.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08, duration: 0.45, ease: "easeOut" }}
            className="border-b border-[#475569]/15"
          >
            <a
              href={r.href}
              target={r.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="arrow-row flex items-center justify-between py-5 group"
            >
              <span className="text-xs uppercase tracking-widest font-light text-[#475569]">
                {r.label}
              </span>
              <span className="flex items-center gap-3">
                <span className="font-light text-[#1A1A1A]">{r.value}</span>
                <ArrowUpRight size={16} className="arrow text-[#475569]" />
              </span>
            </a>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
