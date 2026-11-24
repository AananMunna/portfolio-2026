"use client";

import { motion } from "motion/react";
import { ArrowUpRight, Github, MapPin } from "lucide-react";
import { projects } from "./Projectsdata";

const pick = (title: string) => projects.find((p) => p.title === title)!;

const experiences = [
  {
    id: 1,
    company: "Al Jaami Technologies",
    href: "https://www.aljaami.co.uk/",
    role: "Full Stack Developer",
    period: "Jul 2025 – Apr 2026",
    location: "Onsite · Kushtia, Bangladesh",
    logo: "/images/aljaami.jpg",
    description:
      "Worked on a school management product, Eqrah. I designed data models, wrote REST APIs, and built the React screens that used them. Most of my time went into taking features from a rough idea to something real users could open.",
    tech: ["MongoDB", "Express.js", "React", "Node.js", "Next.js", "TypeScript", "Redux", "REST API"],
    shipped: [pick("CourierGo"), pick("RentNest")],
  },
  {
    id: 2,
    company: "CodeCareBD",
    href: "https://codecarebd.com/",
    role: "Front-End Developer",
    period: "Jan 2024 – Jun 2025",
    location: "Hybrid · Bangladesh",
    logo: "/images/codecarebd.jpg",
    description:
      "Turned Figma designs into React and Next.js pages. I spent a lot of time on spacing, responsiveness and reusable components, usually on tight deadlines.",
    tech: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Figma"],
    shipped: [],
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

const scrollToWork = (e: React.MouseEvent) => {
  e.preventDefault();
  const lenis = (window as any).lenis;
  if (lenis) lenis.scrollTo("#work", { duration: 1.6 });
  else document.querySelector("#work")?.scrollIntoView({ behavior: "smooth" });
};

export default function Experience() {
  return (
    <section id="experience" className="section-tint relative z-20 bg-bg">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="max-w-2xl">
          <p className="eyebrow">Career record</p>
          <h2 className="section-title mt-3">
            Where I&apos;ve <span className="text-accent">worked.</span>
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-muted">
            Two teams, one habit: take a feature from idea to something real people can use.
          </p>
        </div>

        <div className="mt-14 space-y-8">
          {experiences.map((exp) => (
            <motion.article
              key={exp.id}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, ease }}
              className="card p-6 sm:p-9"
            >
              {/* header */}
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border hairline bg-white p-1.5 sm:h-16 sm:w-16">
                    <img src={exp.logo} alt={`${exp.company} logo`} className="h-full w-full object-contain" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">{exp.role}</h3>
                    <a
                      href={exp.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover-target mt-0.5 inline-flex items-center gap-1 text-[15px] font-medium text-accent hover:underline"
                    >
                      {exp.company} <ArrowUpRight size={14} />
                    </a>
                  </div>
                </div>

                <div className="flex flex-row items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
                  <span className="rounded-full bg-accent/10 px-3 py-1 font-mono text-[11.5px] font-medium tracking-wide text-accent">
                    {exp.period}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[12.5px] text-muted">
                    <MapPin size={12} /> {exp.location}
                  </span>
                </div>
              </div>

              <p className="mt-6 max-w-3xl text-[16.5px] leading-[1.75] text-fg/75">{exp.description}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {exp.tech.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border hairline px-3 py-1 text-[12.5px] text-fg/65 transition-colors hover:border-accent/50 hover:text-accent"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* shipped projects */}
              {exp.shipped.length > 0 && (
                <div className="mt-10 border-t hairline pt-8">
                  <div className="mb-5 flex items-center justify-between">
                    <p className="eyebrow">Shipped here · {exp.shipped.length} projects</p>
                    <a href="#work" onClick={scrollToWork} className="hover-target text-[13px] font-medium text-accent hover:underline">
                      All projects →
                    </a>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {exp.shipped.map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-8%" }}
                        transition={{ duration: 0.7, delay: i * 0.1, ease }}
                        className="card card-hover group flex flex-col overflow-hidden !rounded-[1.25rem]"
                      >
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover-target relative block aspect-[16/10] overflow-hidden border-b hairline bg-[var(--void3)]"
                          aria-label={`Open ${p.title}`}
                        >
                          <img
                            src={p.image}
                            alt={`${p.title} screenshot`}
                            loading="lazy"
                            className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                          <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wider text-white backdrop-blur">
                            {p.category}
                          </span>
                          <span className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-white text-black opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                            <ArrowUpRight size={16} />
                          </span>
                        </a>

                        <div className="flex flex-1 flex-col p-5">
                          <div className="flex items-baseline justify-between gap-3">
                            <h4 className="text-lg font-semibold tracking-tight text-fg">{p.title}</h4>
                            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-accent">
                              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {p.status}
                            </span>
                          </div>
                          <p className="mt-1 text-[14px] font-medium text-fg/80">{p.tagline}</p>
                          <p className="mt-2 line-clamp-3 flex-1 text-[14px] leading-relaxed text-muted">{p.description}</p>

                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {p.tags.slice(0, 5).map((t) => (
                              <span key={t} className="rounded-md bg-white/[0.06] px-2 py-0.5 font-mono text-[11px] text-fg/65">
                                {t}
                              </span>
                            ))}
                          </div>

                          <div className="mt-5 flex items-center gap-3 border-t hairline pt-4">
                            <a
                              href={p.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover-target inline-flex items-center gap-1 text-[13px] font-semibold text-accent hover:underline"
                            >
                              Live site <ArrowUpRight size={14} />
                            </a>
                            <a
                              href={p.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover-target inline-flex items-center gap-1.5 text-[13px] font-medium text-muted transition-colors hover:text-fg"
                            >
                              <Github size={14} /> Code
                            </a>
                            <span className="ml-auto font-mono text-[11px] text-muted">{p.year}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
