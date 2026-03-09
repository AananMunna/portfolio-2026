"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";
import {
  Code,
  Palette,
  Zap,
  Blocks,
  Server,
  Database,
  Smartphone,
  Globe,
  Cpu,
  Layers,
  GitBranch,
  Github,
  Box,
} from "lucide-react";

/* ─── Data ─────────────────────────────────────────────── */
const NODES = [
  // --- ROOT HUBS ---
  { id: "web",     label: "Web Fundamentals", icon: Globe,      color: "#a3e635", proficiency: null, x: 400, y: 60,  hub: true  },
  { id: "be",      label: "Backend",           icon: Server,     color: "#34d399", proficiency: null, x: 400, y: 520, hub: true  },
  { id: "devops",  label: "Tools & DevOps",    icon: Cpu,        color: "#c084fc", proficiency: null, x: 400, y: 800, hub: true  },

  // --- FRONTEND BRANCH ---
  { id: "html",    label: "HTML",              icon: Code,       color: "#fb923c", proficiency: 100, x: 180, y: 170, hub: false },
  { id: "js",      label: "JavaScript",        icon: Zap,        color: "#facc15", proficiency: 98,  x: 620, y: 170, hub: false },

  { id: "css",     label: "CSS",               icon: Palette,    color: "#60a5fa", proficiency: 95,  x: 100, y: 300, hub: false },
  { id: "react",   label: "React",             icon: Blocks,     color: "#38bdf8", proficiency: 95,  x: 500, y: 290, hub: false },
  { id: "ts",      label: "TypeScript",        icon: Code,       color: "#818cf8", proficiency: 85,  x: 730, y: 290, hub: false },

  { id: "tw",      label: "Tailwind CSS",      icon: Palette,    color: "#22d3ee", proficiency: 92,  x: 40,  y: 430, hub: false },
  { id: "resp",    label: "Responsive",        icon: Smartphone, color: "#f472b6", proficiency: 95,  x: 170, y: 430, hub: false },
  { id: "next",    label: "Next.js",           icon: Globe,      color: "#e2e8f0", proficiency: 90,  x: 420, y: 420, hub: false },
  { id: "fm",      label: "Framer Motion",     icon: Zap,        color: "#a78bfa", proficiency: 87,  x: 560, y: 420, hub: false },
  { id: "redux",   label: "Redux",             icon: Box,        color: "#c084fc", proficiency: 83,  x: 690, y: 420, hub: false },

  // --- BACKEND BRANCH ---
  { id: "node",    label: "Node.js",           icon: Server,     color: "#4ade80", proficiency: 88,  x: 260, y: 620, hub: false },
  { id: "mongo",   label: "MongoDB",           icon: Database,   color: "#22c55e", proficiency: 82,  x: 540, y: 620, hub: false },

  { id: "express", label: "Express.js",        icon: Server,     color: "#86efac", proficiency: 85,  x: 180, y: 730, hub: false },
  { id: "api",     label: "API Design",        icon: Layers,     color: "#6366f1", proficiency: 85,  x: 340, y: 730, hub: false },

  // --- DEVOPS BRANCH ---
  { id: "git",     label: "Git",               icon: GitBranch,  color: "#fb923c", proficiency: 90,  x: 260, y: 900, hub: false },
  { id: "github",  label: "GitHub",            icon: Github,     color: "#e2e8f0", proficiency: 92,  x: 540, y: 900, hub: false },
];

const EDGES = [
  // web hub
  ["web","html"],["web","js"],
  // html branch
  ["html","css"],["css","tw"],["css","resp"],
  // js branch
  ["js","react"],["js","ts"],
  ["react","next"],["react","fm"],["react","redux"],
  // backend
  ["be","node"],["be","mongo"],
  ["node","express"],["node","api"],
  // devops
  ["devops","git"],["devops","github"],
  // git → github connection
  ["git","github"],
];

/* ─── SVG curved edge ───────────────────────────────────── */
function Edge({ from, to, lit }: { from: typeof NODES[0]; to: typeof NODES[0]; lit: boolean }) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2 - 20;
  const d = `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`;

  return (
    <g>
      <path d={d} stroke="rgba(255,255,255,0.06)" strokeWidth={1.5} fill="none" />
      {lit && (
        <motion.path
          d={d}
          stroke={to.color}
          strokeWidth={1.5}
          fill="none"
          strokeOpacity={0.7}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 4px ${to.color})` }}
        />
      )}
    </g>
  );
}

/* ─── Single Node ─────────────────────────────────────────── */
function Node({
  node, active, lit, onEnter, onLeave,
}: {
  node: typeof NODES[0];
  active: boolean;
  lit: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const Icon = node.icon;
  const half = node.hub ? 36 : 28;

  return (
    <motion.g
      style={{ cursor: "pointer" }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      {/* Pulse ring */}
      {active && (
        <motion.circle
          cx={node.x} cy={node.y} r={half + 10}
          fill="none"
          stroke={node.color}
          strokeWidth={1}
          initial={{ r: half, opacity: 0.8 }}
          animate={{ r: half + 24, opacity: 0 }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}

      {/* Glow backdrop */}
      {(active || lit) && (
        <circle
          cx={node.x} cy={node.y} r={half + 4}
          fill={node.color}
          opacity={0.12}
          style={{ filter: "blur(8px)" }}
        />
      )}

      {/* Main circle */}
      <motion.circle
        cx={node.x} cy={node.y} r={half}
        fill={active ? node.color : "rgba(255,255,255,0.04)"}
        stroke={active || lit ? node.color : "rgba(255,255,255,0.12)"}
        strokeWidth={active ? 2 : 1.5}
        animate={{ scale: active ? 1.12 : 1 }}
        transition={{ type: "spring", stiffness: 300 }}
        style={active ? { filter: `drop-shadow(0 0 12px ${node.color})` } : {}}
      />

      {/* Icon */}
      <foreignObject
        x={node.x - 12} y={node.y - 12}
        width={24} height={24}
        style={{ pointerEvents: "none" }}
      >
        <div className="flex items-center justify-center w-full h-full">
          <Icon
            size={node.hub ? 16 : 13}
            style={{ color: active ? "#0a0a0a" : node.color, opacity: active ? 1 : 0.9 }}
          />
        </div>
      </foreignObject>
    </motion.g>
  );
}

/* ─── Floating tooltip ────────────────────────────────────── */
function Tooltip({ node }: { node: typeof NODES[0] }) {
  const isRight = node.x < 420;
  const offsetX = isRight ? 44 : -192;
  const offsetY = -36;

  return (
    <foreignObject
      x={node.x + offsetX}
      y={node.y + offsetY}
      width={180}
      height={110}
      style={{ pointerEvents: "none", overflow: "visible" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.92 }}
        transition={{ duration: 0.2 }}
        style={{
          background: "rgba(10,10,10,0.92)",
          border: `1px solid ${node.color}40`,
          borderRadius: 12,
          padding: "12px 14px",
          backdropFilter: "blur(12px)",
          boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 16px ${node.color}20`,
          width: 172,
        }}
      >
        <p className="font-bold text-white text-sm leading-tight mb-2">{node.label}</p>
        {node.proficiency !== null && (
          <>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 9999, height: 4, marginBottom: 6 }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${node.proficiency}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{
                  height: "100%",
                  borderRadius: 9999,
                  background: node.color,
                  boxShadow: `0 0 8px ${node.color}`,
                }}
              />
            </div>
            <p className="font-mono text-xs" style={{ color: node.color }}>
              {node.proficiency}% proficiency
            </p>
          </>
        )}
      </motion.div>
    </foreignObject>
  );
}

/* ─── Main Component ──────────────────────────────────────── */
export default function TechSkills() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.05 });
  const [hovered, setHovered] = useState<string | null>(null);

  const nodeMap = Object.fromEntries(NODES.map((n) => [n.id, n]));

  const litIds = new Set<string>();
  if (hovered) {
    litIds.add(hovered);
    EDGES.forEach(([a, b]) => {
      if (a === hovered) litIds.add(b);
      if (b === hovered) litIds.add(a);
    });
  }

  return (
    <section
      id="tech-skills"
      ref={sectionRef}
      className="py-24 sm:py-32 px-4 sm:px-8 max-w-7xl mx-auto relative z-20 bg-bg"
    >
      <div className="text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="font-display text-4xl sm:text-5xl uppercase font-bold tracking-tighter mb-3"
        >
          Skill <span className="text-accent italic">Tree</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="text-muted font-mono text-sm uppercase tracking-widest"
        >
          A visual map of the technologies I use to build real products.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative w-full overflow-x-auto"
      >
        <svg
          viewBox="0 0 800 990"
          width="100%"
          style={{ minWidth: 480, maxWidth: 860, margin: "0 auto", display: "block" }}
        >
          {/* Edges */}
          {EDGES.map(([a, b]) => {
            const fromNode = nodeMap[a];
            const toNode = nodeMap[b];
            if (!fromNode || !toNode) return null;
            const lit = hovered !== null && litIds.has(a) && litIds.has(b);
            return <Edge key={`${a}-${b}`} from={fromNode} to={toNode} lit={lit} />;
          })}

          {/* Nodes */}
          {NODES.map((node) => (
            <Node
              key={node.id}
              node={node}
              active={hovered === node.id}
              lit={litIds.has(node.id)}
              onEnter={() => setHovered(node.id)}
              onLeave={() => setHovered(null)}
            />
          ))}

          {/* Labels */}
          {NODES.map((node) => (
            <text
              key={`label-${node.id}`}
              x={node.x}
              y={node.y + (node.hub ? 50 : 42)}
              textAnchor="middle"
              fontSize={node.hub ? 10.5 : 9}
              fontFamily="monospace"
              fill={
                litIds.has(node.id) || hovered === node.id
                  ? node.color
                  : "rgba(255,255,255,0.35)"
              }
              style={{ transition: "fill 0.2s", pointerEvents: "none", userSelect: "none" }}
              fontWeight={node.hub ? "700" : "400"}
            >
              {node.label}
            </text>
          ))}

          {/* Tooltips */}
          <AnimatePresence>
            {hovered && nodeMap[hovered]?.proficiency !== null && (
              <Tooltip key={hovered} node={nodeMap[hovered]} />
            )}
          </AnimatePresence>
        </svg>
      </motion.div>
    </section>
  );
}