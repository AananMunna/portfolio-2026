"use client";

import { motion } from "motion/react";
import { useState } from "react";

const currentStack = [
  "TypeScript",
  "React",
  "Next.js",
  "Tailwind CSS",
  "Node.js",
  "Express.js",
  "PostgreSQL",
  "Prisma",
  "MongoDB",
  "Redis",
  "Stripe",
  "Git",
  "GitHub Actions",
];

const groups: { title: string; items: string[] }[] = [
  {
    title: "Languages",
    items: [
      "TypeScript",
      "JavaScript ES6+",
    ],
  },
  {
    title: "Frontend Systems",
    items: [
      "React",
      "Next.js",
      "Tailwind CSS",
      "Redux",
      "Framer Motion",
    ],
  },
  {
    title: "Backend Services",
    items: [
      "Node.js",
      "Express.js",
      "REST API Design",
    ],
  },
  {
    title: "Databases & ORMs",
    items: [
      "MongoDB",
      "PostgreSQL",
      "Prisma ORM",
      "Redis",
    ],
  },
  {
    title: "Security & Access",
    items: [
      "JWT",
      "Role-based Access",
    ],
  },
  {
    title: "Payments",
    items: [
      "Stripe",
      "bKash",
    ],
  },
  {
    title: "DevOps & Deployment",
    items: [
      "Vercel",
      "Netlify",
      "CI/CD Pipelines",
    ],
  },
  {
    title: "Tooling & Workflow",
    items: [
      "Git",
      "GitHub Actions",
      "Figma",
    ],
  },
];

const files: { name: string; code: string }[] = [
  {
    name: "types.ts",
    code: `export type ShipmentStatus =
  | "PENDING"
  | "ASSIGNED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "FAILED";

export interface Shipment {
  id: string;
  trackingCode: string;
  status: ShipmentStatus;
  riderId: string | null;
}`,
  },
  {
    name: "page.tsx",
    code: `export default async function TrackPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const shipment = await getShipment(code);

  if (!shipment) notFound();

  return <Timeline events={shipment.events} />;
}`,
  },
  {
    name: "server.ts",
    code: `router.patch("/:id/assign", requireRole("ADMIN"), async (req, res) => {
  const { riderId } = assignSchema.parse(req.body);

  const result = await prisma.shipment.updateMany({
    where: { id: req.params.id, status: "PENDING" },
    data: { riderId, status: "ASSIGNED" },
  });

  if (result.count === 0) throw new ConflictError("Already assigned");
  res.json({ ok: true });
});`,
  },
  {
    name: "schema.prisma",
    code: `model Shipment {
  id           String         @id @default(cuid())
  trackingCode String         @unique
  status       ShipmentStatus @default(PENDING)
  riderId      String?
  events       TrackingEvent[]
  createdAt    DateTime       @default(now())
}`,
  },
  {
    name: "ci.yml",
    code: `name: CI
on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm run build`,
  },
];

export default function StackMatrix() {
  const [active, setActive] = useState(0);
  const lines = files[active].code.split("\n");

  return (
    <section className="relative z-20 mx-auto max-w-7xl bg-bg px-4 py-24 sm:px-8">
      <h2 className="font-display text-4xl font-bold uppercase tracking-tighter sm:text-6xl">
        Technical <span className="italic text-accent">Stack</span>
      </h2>

      {/* Current stack */}
      <div className="mt-10">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted">
          Current stack
        </p>
        <div className="flex flex-wrap gap-2.5">
          {currentStack.map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/10 px-3.5 py-1.5 font-mono text-xs text-fg/70 transition-colors hover:border-accent/40 hover:text-accent"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Categories */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-7">
          {groups.map((group, gi) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{ duration: 0.5, delay: (gi % 2) * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
            >
              <h3 className="mb-4 font-mono text-xs uppercase tracking-widest text-accent">
                {group.title}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-white/10 px-3 py-1 text-sm text-fg/80"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Editor + terminal */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface">
              <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-accent/70" />
              </div>

              <div className="flex overflow-x-auto border-b border-white/10">
                {files.map((f, i) => (
                  <button
                    key={f.name}
                    onClick={() => setActive(i)}
                    className={`hover-target whitespace-nowrap border-r border-white/10 px-4 py-2.5 font-mono text-xs transition-colors ${
                      i === active ? "bg-white/[0.05] text-accent" : "text-muted hover:text-fg"
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>

              <pre className="max-h-[340px] overflow-auto p-4 font-mono text-[12.5px] leading-relaxed text-fg/80">
                {lines.map((line, i) => (
                  <div key={i} className="flex">
                    <span className="mr-4 w-5 shrink-0 select-none text-right text-muted/50">{i + 1}</span>
                    <code className="whitespace-pre">{line || " "}</code>
                  </div>
                ))}
              </pre>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-xs leading-relaxed">
              <p className="text-muted">
                <span className="text-accent">$</span> npx tsc --noEmit
              </p>
              <p className="mt-1 text-accent">✓ Found 0 errors. Type check passed.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
