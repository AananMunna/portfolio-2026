"use client";

const stack = [
  "Next.js",
  "React",
  "TypeScript",
  "Node.js",
  "Express.js",
  "PostgreSQL",
  "MongoDB",
  "Prisma",
  "Redis",
  "Tailwind CSS",
  "Stripe",
  "Git & CI/CD",
];

export default function TechMarquee() {
  const items = [...stack, ...stack];

  return (
    <div
      aria-label="Tech stack"
      className="relative z-20 overflow-hidden border-y border-white/10 bg-bg py-5"
    >
      <div className="marquee-track flex w-max items-center gap-10 whitespace-nowrap">
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-10 font-mono text-xs uppercase tracking-[0.25em] text-muted"
          >
            {item}
            <span className="text-accent/60">/</span>
          </span>
        ))}
      </div>

      <style jsx>{`
        .marquee-track {
          animation: marquee 32s linear infinite;
        }
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
