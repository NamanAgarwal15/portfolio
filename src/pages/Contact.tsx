import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { z } from "zod";
import { Reveal } from "@/components/Section";
import { toast } from "sonner";

const rows = [
  { label: "Email", value: "naman.agarwal.23cse@bmu.edu.in", href: "mailto:naman.agarwal.23cse@bmu.edu.in" },
  { label: "LinkedIn", value: "linkedin.com/in/namanagarwal159", href: "https://www.linkedin.com/in/namanagarwal159/" },
  { label: "GitHub", value: "github.com/NamanAgarwal15", href: "https://github.com/NamanAgarwal15" },
  { label: "Phone", value: "+91 7047159008", href: "tel:+917047159008" },
];

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  email: z.string().trim().email("Invalid email").max(255, "Email must be under 255 characters"),
  subject: z.string().trim().min(1, "Subject is required").max(150, "Subject must be under 150 characters"),
  message: z.string().trim().min(1, "Message is required").max(1000, "Message must be under 1000 characters"),
});

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (k: keyof typeof form, v: string) => {
    if (submitted || submitting) return;
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitted || submitting) return;
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((i) => {
        if (i.path[0]) fieldErrors[i.path[0] as string] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setSubmitting(true);
    const { name, email, subject, message } = result.data;
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    const mailto = `mailto:naman.agarwal.23cse@bmu.edu.in?subject=${encodeURIComponent(subject)}&body=${body}`;
    window.location.href = mailto;
    setTimeout(() => {
      toast.success("Message sent!", {
        description: "Your email client has been opened. Thanks for reaching out — I'll reply soon.",
      });
      setForm({ name: "", email: "", subject: "", message: "" });
      setErrors({});
      setSubmitting(false);
      setSubmitted(true);
    }, 400);
  };


  const inputClass =
    "w-full bg-transparent border-b border-[#475569]/30 py-3 text-base font-light text-[#1A1A1A] placeholder:text-[#475569]/60 focus:outline-none focus:border-[#1A1A1A] transition-colors";

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

      <Reveal delay={0.1}>
        <form onSubmit={onSubmit} className="mt-14 space-y-8" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label htmlFor="name" className="block text-xs uppercase tracking-widest font-light text-[#475569] mb-2">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                maxLength={100}
                className={inputClass}
                placeholder="Your name"
              />
              {errors.name && <p className="mt-2 text-xs text-red-600 font-light">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-xs uppercase tracking-widest font-light text-[#475569] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                maxLength={255}
                className={inputClass}
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-2 text-xs text-red-600 font-light">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-xs uppercase tracking-widest font-light text-[#475569] mb-2">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              value={form.subject}
              onChange={(e) => update("subject", e.target.value)}
              maxLength={150}
              className={inputClass}
              placeholder="What's this about?"
            />
            {errors.subject && <p className="mt-2 text-xs text-red-600 font-light">{errors.subject}</p>}
          </div>

          <div>
            <label htmlFor="message" className="block text-xs uppercase tracking-widest font-light text-[#475569] mb-2">
              Message
            </label>
            <textarea
              id="message"
              rows={5}
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              maxLength={1000}
              className={`${inputClass} resize-none`}
              placeholder="Tell me a bit about your project or idea…"
            />
            <div className="flex justify-between mt-2">
              {errors.message ? (
                <p className="text-xs text-red-600 font-light">{errors.message}</p>
              ) : (
                <span />
              )}
              <p className="text-xs font-light text-[#475569]/70">{form.message.length}/1000</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="group inline-flex items-center gap-2 border border-[#1A1A1A] px-6 py-3 text-sm font-medium hover:bg-[#1A1A1A] hover:text-[#F7F5F2] transition-colors duration-300 disabled:opacity-50"
          >
            {submitting ? "Sending…" : "Send Message"}
            <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </form>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="mt-20 mb-4 text-xs uppercase tracking-widest font-light text-[#475569]">
          Or reach me directly
        </div>
      </Reveal>

      <ul>
        {rows.map((r, i) => (
          <motion.li
            key={r.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.45, ease: "easeOut" }}
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

