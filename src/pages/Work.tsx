import { Reveal } from "@/components/Section";
import SEO from "@/components/SEO";

const experience = [
  {
    role: "Data Analyst",
    org: "Arista Vault",
    when: "Jun 2025 – Aug 2025",
    where: "Delhi",
    quip: "Tracked 10 lakh+ campaigns in real time. Yes, lakh. He thinks in Indian number formats now.",
    bullets: [
      "Built a dashboard workflow integrating Google Ads and Meta Ads APIs into Quadratic to auto-update standardized sheets and performance dashboards using Python, processing data from 10L+ digital marketing campaigns in real time.",
      "Performed EDA to analyze customer journeys linking marketing efforts to sales outcomes, enabling full-funnel visibility and identifying high-performing segments and ROAS trends.",
      "Led communication with CxOs through interim and monthly performance reviews, aligning on KPIs.",
    ],
  },
  {
    role: "IoT Developer",
    org: "Smart Eye",
    when: "Jan 2025 – Apr 2025",
    where: "Gurgaon",
    quip: "Squeezed a deep learning model onto a Raspberry Pi and kept 80% accuracy. Tiny computer, not-tiny achievement.",
    bullets: [
      "Optimized DL models for embedded IoT systems using quantization, retaining over 80% accuracy.",
      "Evaluated TinyML deployment options with low-power MCUs like Raspberry Pi.",
      "Implemented sensor fusion pipelines combining Ultrasonic and camera data via lightweight CNNs (YOLO), improving detection accuracy by 7%.",
    ],
  },
  {
    role: "Co-Chair, Innovation Vertical",
    org: "Young Indians (Yi)",
    when: "Aug 2024 – Aug 2025",
    where: "Gurugram",
    quip: "Led a full year of innovation events at BMU. Yes, he voluntarily ran more meetings than required. Character flaw or feature? Unclear.",
    bullets: [
      "Co-Chair of the Innovation vertical at the Young Indians chapter at BMU, leading initiatives to empower youth toward innovative thinking and industry exposure.",
      "Coordinated events, workshops, and collaborations exploring new technologies and business ideas.",
      "Led Sangam 1.0 in collaboration with the Entrepreneurship vertical, serving as both Co-Chair of Innovation and Operations Lead.",
    ],
  },
  {
    role: "Social Media & Content Intern",
    org: "Talent Carve",
    when: "Jun 2024 – Sep 2024",
    where: "Remote",
    quip: "Helped launch an ebook called The Gentleman's Code. No, he did not write it. Yes, he did proofread it three times.",
    bullets: [
      "Contributed to development and execution of social media strategies across multiple platforms.",
      "Designed comprehensive content calendars to streamline posting schedules.",
      "Generated creative content ideas to engage target audiences and boost brand visibility.",
      "Played a key role in launching the ebook 'The Gentleman's Code' by overseeing content accuracy and design quality.",
    ],
  },
  {
    role: "Web Development Intern",
    org: "Agaamin Technologies",
    when: "Jun 2024 – Aug 2024",
    where: "Remote",
    quip: "Built wireframes in Figma for a full redesign. First time he realised designers and developers are the same person at a startup.",
    bullets: [
      "Interned on the front-end team for the Agaamin Redesign Project, focusing on UI/UX enhancement.",
      "Created detailed wireframes to guide the redesign process using a user-centered approach.",
      "Utilized Figma to develop intuitive and visually appealing interface designs.",
    ],
  },
];

const projects = [
  {
    name: "DriveSafe-IND",
    subtitle: "Multi-Modal ADAS",
    when: "Mar 2026 – May 2026",
    tags: ["PyTorch", "YOLO11m", "Dlib", "MiDaS", "OpenCV"],
    quip: "141K+ images. 11 classes. 1 sleep-deprived developer. mAP went from 0.157 to 0.648 — that's not luck, that's curriculum learning.",
    bullets: [
      "Fine-tuned YOLO11m on 141K+ images via two-stage curriculum learning achieving mAP@0.5 of 0.648 across an 11-class taxonomy including India-exclusive classes absent from Western datasets.",
      "Engineered a camera-only driver monitoring pipeline using dlib 68-point facial landmarks.",
      "Implemented a dual-stream fusion module producing three-tier risk classification with automatic event logging and structured JSON metadata for insurance and fleet management applications.",
    ],
    link: "#placeholder",
  },
  {
    name: "Winlytics",
    subtitle: "Cricket Prediction",
    when: "Jan 2025 – May 2025",
    tags: ["Python", "NumPy", "pandas", "scikit-learn", "Matplotlib"],
    quip: "Scraped 1,000+ IPL matches. Engineered 30+ features. Still can't predict why Mumbai Indians collapse in playoffs.",
    bullets: [
      "Trained multiple ML models to predict IPL match outcomes with 65%+ accuracy using structured IPL data.",
      "Scraped 1,000+ match records from ESPNcricinfo and Cricbuzz using custom web scraping scripts.",
      "Engineered 30+ predictive features: team strength, venue bias, recent form, head-to-head stats.",
    ],
    link: "#placeholder",
  },
  {
    name: "Smart Wildfire-Fighting Robot with RAS",
    subtitle: "",
    when: "Aug 2023 – Present",
    tags: ["Arduino", "GSM", "Geolocation", "IoT", "Sensors"],
    quip: "A robot that fights wildfires. Built with Arduino and a concerning amount of late nights. Second place at TechSparx out of 80+ teams — the robot deserved first.",
    bullets: [
      "Developed a wildfire-fighting robot with advanced sensors, geolocation, and GSM modules for precise tracking and remote communication in wildfire-prone areas.",
      "Integrated a Remote Alerting System (RAS) enabling real-time monitoring and remote activation for rapid response to emerging fire threats.",
      "Controlled via Arduino for autonomous operation in challenging environments; designed for cost-effective, scalable early wildfire detection.",
      "Second place out of 80+ teams at TechSparx.I 2025, BMU.",
    ],
    link: "#placeholder",
  },
];

function Card({ children, companion }: { children: React.ReactNode; companion?: string }) {
  return (
    <div data-companion={companion} className="border border-[#1A1A1A]/15 p-6 sm:p-8 bg-white transition-all duration-[250ms] ease-out hover:-translate-y-1 hover:shadow-[0_12px_30px_-12px_rgba(0,0,0,0.15)]">
      {children}
    </div>
  );
}

export default function Work() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-20">
      <SEO title="Work" description="Internships and projects by Naman Agarwal — data analytics, IoT, machine learning, and full-stack work." path="/#/work" />
      <Reveal>
        <h2 className="text-3xl sm:text-4xl font-light tracking-tight">Work</h2>
      </Reveal>

      <div className="mt-16">
        <Reveal>
          <h3 className="text-xs uppercase tracking-widest text-[#666666] font-medium">
            Experience
          </h3>
        </Reveal>
        <div className="mt-8 space-y-6">
          {experience.map((e, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <Card companion={e.quip}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <div className="font-medium text-lg">{e.org}</div>
                    <div className="text-sm font-light text-[#666666]">{e.role}</div>
                  </div>
                  <div className="text-xs font-light text-[#666666]">
                    {e.when} · {e.where}
                  </div>
                </div>
                <ul className="mt-5 space-y-2 text-sm font-light leading-relaxed text-[#1A1A1A]/85">
                  {e.bullets.map((b, j) => (
                    <li key={j}>— {b}</li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mt-20">
        <Reveal>
          <h3 className="text-xs uppercase tracking-widest text-[#666666] font-medium">
            Projects
          </h3>
        </Reveal>
        <div className="mt-8 space-y-6">
          {projects.map((p, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <Card companion={p.quip}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <div className="font-medium text-lg">
                      {p.name} <span className="text-[#666666] font-light">— {p.subtitle}</span>
                    </div>
                  </div>
                  <div className="text-xs font-light text-[#666666]">{p.when}</div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="border border-[#D97706]/60 rounded-full px-3 py-1 text-xs font-light"
                      style={{ fontFamily: "'Courier New', Courier, monospace" }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <ul className="mt-5 space-y-2 text-sm font-light leading-relaxed text-[#1A1A1A]/85">
                  {p.bullets.map((b, j) => (
                    <li key={j}>— {b}</li>
                  ))}
                </ul>
                <a
                  href={p.link}
                  className="mt-5 inline-block nav-link text-sm font-light"
                >
                  Demo →
                </a>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
