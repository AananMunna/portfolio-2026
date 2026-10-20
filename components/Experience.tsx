"use client";

import { motion, useInView } from "motion/react";
import Link from "next/link";
import { useRef } from "react";
import Image from "next/image"; // optional but recommended

const experiences = [
  {
    id: 1,
    company: "Al Jaami Technologies",
    href: "https://www.aljaami.co.uk/",
    role: "Full Stack Developer",
    period: "July 2025 - April 2026",
    location: "Onsite · Kushtia, Bangladesh",
    logo: "/images/aljaami.jpg", // ✅ correct path
    description:
      "Full ownership of the product stack — from data modeling and REST API design to React UI and state management. I take features from idea to production, ensuring every layer is solid, maintainable, and ready for real users.",
    tech: [
      "MongoDB",
      "Express.js",
      "React",
      "Node.js",
      "Next.js",
      "TypeScript",
      "Redux",
      "REST API",
    ],
  },
  {
    id: 2,
    company: "CodeCareBD",
    href: "https://codecarebd.com/",
    role: "Front-End Developer",
    period: "January 2024 – Jun 2025",
    location: "Hybrid, Bangladesh",
    logo: "/images/codecarebd.jpg", // ✅ correct path
    description:
      "Turned high-fidelity Figma designs into production React and Next.js interfaces. Focused on clean component architecture, performance, and pixel-level accuracy under tight delivery cycles.",
    tech: [
      "React",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Framer Motion",
      "Figma",
    ],
  },
];

export default function Experience() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });

  return (
    <section
      className="py-32 px-4 sm:px-8 max-w-7xl mx-auto relative z-20 bg-bg"
      id="experience"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20 lg:gap-28">
        {/* Left Title */}
        <div className="md:col-span-4">
          <h2 className="font-display text-4xl sm:text-6xl uppercase font-bold tracking-tighter sticky top-32">
            Work <br />
            <span className="text-accent italic">Experience</span>
          </h2>
        </div>

        {/* Right Content */}
        <div className="md:col-span-8" ref={ref}>
          <div className="space-y-20">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 40 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }
                }
                transition={{
                  duration: 0.8,
                  delay: index * 0.15,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group"
              >
                {/* Company Header */}
                <div className="flex items-start gap-5 mb-8">
                  {/* Logo */}
                  <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden flex items-center justify-center">
                    <img
                      src={exp.logo}
                      alt={`${exp.company} logo`}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-fg">
                          {exp.role}
                        </h3>

                        <Link
                          href={exp.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover-target inline-flex items-center gap-1.5 mt-1 font-mono text-sm uppercase tracking-wider text-accent hover:opacity-80 transition-opacity"
                        >
                          {exp.company}
                          <span className="opacity-50 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
                            ↗
                          </span>
                        </Link>
                      </div>

                      <div className="flex flex-col sm:items-end gap-1">
                        <span className="font-mono text-xs uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full w-fit">
                          {exp.period}
                        </span>
                        <span className="font-mono text-[11px] text-muted">
                          {exp.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-lg sm:text-xl text-fg/75 leading-relaxed max-w-2xl mb-8">
                  {exp.description}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2.5">
                  {exp.tech.map((tech) => (
                    <span
                      key={tech}
                      className="font-mono text-[11px] sm:text-xs border border-white/10 text-fg/60 px-3 py-1.5 rounded-full transition-all duration-200 hover:border-accent/40 hover:text-accent hover:bg-accent/5"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Divider */}
                {index !== experiences.length - 1 && (
                  <div className="w-full h-px bg-border mt-16" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
