"use client";

import { motion } from "motion/react";

type Level = "Expert" | "Advanced" | "Intermediate";

type Group = {
  title: string;
  items: { name: string; level: Level }[];
};

/**
 * Levels for items that already appear in the bonsai (TechSkills.tsx) are derived
 * from the same numbers: 90+ = Expert, 80–89 = Advanced, below = Intermediate.
 * Items marked "review" were not in the bonsai — adjust them to your honest level.
 */
const groups: Group[] = [
  {
    title: "Languages",
    items: [
      { name: "JavaScript ES6+", level: "Expert" },
      { name: "TypeScript", level: "Advanced" },
    ],
  },
  {
    title: "Frontend Systems",
    items: [
      { name: "React", level: "Expert" },
      { name: "Next.js", level: "Expert" },
      { name: "Tailwind CSS", level: "Expert" },
      { name: "Redux", level: "Advanced" },
      { name: "Framer Motion", level: "Advanced" },
    ],
  },
  {
    title: "Backend Services",
    items: [
      { name: "Node.js", level: "Advanced" },
      { name: "Express.js", level: "Advanced" },
      { name: "REST API Design", level: "Advanced" },
    ],
  },
  {
    title: "Databases & ORMs",
    items: [
      { name: "MongoDB", level: "Advanced" },
      { name: "PostgreSQL", level: "Intermediate" }, // review
      { name: "Prisma ORM", level: "Intermediate" }, // review
      { name: "Redis", level: "Intermediate" }, // review
    ],
  },
  {
    title: "Security & Access",
    items: [
      { name: "JWT Auth", level: "Advanced" },
      { name: "Role-based Access", level: "Advanced" },
    ],
  },
  {
    title: "Payments",
    items: [
      { name: "Stripe", level: "Intermediate" }, // review
      { name: "bKash", level: "Intermediate" }, // review
    ],
  },
  {
    title: "DevOps & Deployment",
    items: [
      { name: "Vercel", level: "Advanced" },
      { name: "Netlify", level: "Advanced" },
      { name: "GitHub Actions / CI/CD", level: "Advanced" },
    ],
  },
  {
    title: "Tooling & Workflow",
    items: [
      { name: "Git", level: "Expert" },
      { name: "GitHub", level: "Expert" },
      { name: "Figma", level: "Intermediate" },
    ],
  },
];

const levelStyle: Record<Level, string> = {
  Expert: "border-accent/40 bg-accent/10 text-accent",
  Advanced: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
  Intermediate: "border-white/15 bg-white/5 text-fg/60",
};

export default function StackMatrix() {
  return (
    <section className="relative z-20 mx-auto max-w-7xl bg-bg px-4 py-24 sm:px-8">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-20">
        <div className="md:col-span-4">
          <h2 className="font-display text-4xl font-bold uppercase tracking-tighter sm:text-6xl md:sticky md:top-32">
            What I <br />
            <span className="italic text-accent">work with</span>
          </h2>
          <p className="mt-6 max-w-xs font-mono text-xs uppercase leading-relaxed tracking-widest text-muted">
            Most used: React, Next.js, Node.js, MongoDB, PostgreSQL
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 md:col-span-8">
          {groups.map((group, gi) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.6, delay: (gi % 2) * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className="mb-4 border-b border-white/10 pb-3 font-mono text-xs uppercase tracking-widest text-accent">
                {group.title}
              </h3>
              <ul className="space-y-2.5">
                {group.items.map((item) => (
                  <li key={item.name} className="flex items-center justify-between gap-4">
                    <span className="text-fg/80">{item.name}</span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${levelStyle[item.level]}`}
                    >
                      {item.level}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
