"use client";

import type { IconType } from "react-icons";
import {
  SiNextdotjs,
  SiReact,
  SiTypescript,
  SiNodedotjs,
  SiExpress,
  SiPostgresql,
  SiMongodb,
  SiPrisma,
  SiRedis,
  SiTailwindcss,
  SiStripe,
  SiGithubactions,
} from "react-icons/si";

type Tech = { name: string; icon: IconType; color: string };

const rowA: Tech[] = [
  { name: "Next.js", icon: SiNextdotjs, color: "#8a8f98" },
  { name: "React", icon: SiReact, color: "#61dafb" },
  { name: "TypeScript", icon: SiTypescript, color: "#3178c6" },
  { name: "Node.js", icon: SiNodedotjs, color: "#5fa04e" },
  { name: "Express", icon: SiExpress, color: "#8a8f98" },
  { name: "PostgreSQL", icon: SiPostgresql, color: "#4f87c4" },
];

const rowB: Tech[] = [
  { name: "MongoDB", icon: SiMongodb, color: "#47a248" },
  { name: "Prisma", icon: SiPrisma, color: "#5a67d8" },
  { name: "Redis", icon: SiRedis, color: "#dc382d" },
  { name: "Tailwind CSS", icon: SiTailwindcss, color: "#38bdf8" },
  { name: "Stripe", icon: SiStripe, color: "#635bff" },
  { name: "GitHub Actions", icon: SiGithubactions, color: "#2088ff" },
];

function Row({ items, reverse = false, duration = 36 }: { items: Tech[]; reverse?: boolean; duration?: number }) {
  // content is duplicated so translateX(-50%) loops seamlessly
  const loop = [...items, ...items, ...items, ...items];
  return (
    <div
      className="marquee relative overflow-hidden py-2"
      style={{
        maskImage: "linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)",
      }}
    >
      <div
        className="marquee-run flex w-max items-center gap-3"
        style={{ animationDuration: `${duration}s`, animationDirection: reverse ? "reverse" : "normal" }}
      >
        {loop.map((t, i) => {
          const Icon = t.icon;
          return (
            <div
              key={`${t.name}-${i}`}
              style={{ ["--brand" as string]: t.color }}
              className="hover-target group/chip flex items-center gap-3 rounded-full border hairline bg-white/[0.035] py-2.5 pl-3 pr-5 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand)] hover:bg-white/[0.07] hover:shadow-[0_12px_28px_-12px_var(--brand)]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-muted transition-colors duration-300 group-hover/chip:bg-[var(--brand)] group-hover/chip:text-white">
                <Icon size={16} />
              </span>
              <span className="whitespace-nowrap text-[14px] font-medium tracking-tight text-fg/80 transition-colors group-hover/chip:text-fg">
                {t.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TechMarquee() {
  return (
    <section
      aria-label="Tech stack"
      className="relative z-20 border-y hairline bg-bg py-8 sm:py-10"
    >
      <p className="eyebrow mb-5 text-center">Tools I ship with</p>
      <div className="space-y-2">
        <Row items={rowA} duration={42} />
        <Row items={rowB} reverse duration={46} />
      </div>
    </section>
  );
}
