"use client";

import { motion, useInView } from "motion/react";
import Link from "next/link";
import { useRef } from "react";

const experiences = [
 {
  id: 1,
  company: "Al Jaami Technologies",
  href: "https://www.aljaami.co.uk/",
  role: "MERN Stack Developer",
  period: "Present",
  description:
    "Full-stack ownership from day one — I architect the data model, design the REST API, wire up the business logic in Node/Express, and ship the React UI with bulletproof Redux state. Features don't leave my hands until every layer is production-ready.",
  tech: [
    "MongoDB", "Express.js", "React", "Node.js",
    "Next.js", "TypeScript", "Redux", "REST API",
  ],
},
  {
    id: 2,
    company: "CodeCareBD",
    href: "https://codecarebd.com/",
    role: "Front-End Developer",
    period: "Previous",
    description:
      "Converted pixel-perfect Figma designs into production-ready React/Next.js code. Built the muscle for clean component architecture and design-to-code precision — fast.",
    tech: [
      "React", "Next.js", "Figma-to-Code",
      "CSS/SCSS", "Tailwind CSS", "Framer Motion",
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
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
        <div className="md:col-span-4 flex flex-col">
          <h2 className="font-display text-4xl sm:text-6xl uppercase font-bold tracking-tighter sticky top-32">
            Work <br />
            <span className="text-accent italic">Experience</span>
          </h2>
        </div>

        <div className="md:col-span-8" ref={ref}>
          <div className="space-y-16">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                className="relative pl-8 md:pl-0"
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.2,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {/* Timeline line for mobile */}
                <div className="absolute left-0 top-0 bottom-0 w-px bg-border md:hidden"></div>
                <div className="absolute left-[-4px] top-2 w-2 h-2 rounded-full bg-accent md:hidden"></div>

                <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-4">
                  <h3 className="font-display text-2xl sm:text-4xl font-bold tracking-tight">
                    {exp.role}
                  </h3>
                  <span className="font-mono text-sm text-accent mt-2 md:mt-0 bg-accent/10 px-3 py-1 rounded-full w-fit">
                    {exp.period}
                  </span>
                </div>

                {/* Company name — highlighted in accent + arrow */}
                <Link
                  href={exp.href}
                  target="_blank"
                  className="hover-target group inline-flex items-center gap-1.5 font-mono text-lg text-accent mb-6 uppercase tracking-wider hover:opacity-70 transition-opacity"
                >
                  @ {exp.company}
                  <span className="text-accent/50 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
                    ↗
                  </span>
                </Link>

                <p className="text-lg sm:text-xl text-fg/80 leading-relaxed mb-8 mt-4 max-w-2xl">
                  {exp.description}
                </p>

                {/* Tech pills — highlighted with accent glow on hover */}
                <div className="flex flex-wrap gap-3">
                  {exp.tech.map((tech, i) => (
                    <span
                      key={i}
                      className="font-mono text-xs border border-accent/30 text-accent/70 px-3 py-1 rounded-full transition-all duration-200 hover:border-accent hover:text-accent hover:bg-accent/10 cursor-default"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {index !== experiences.length - 1 && (
                  <div className="hidden md:block w-full h-px bg-border mt-16"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}