"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  BookOpen,
  Briefcase,
  Code2,
  FolderGit2,
  Home,
  Mail,
  Menu,
  Moon,
  Sun,
  User,
  type LucideIcon,
} from "lucide-react";
import { toggleTheme } from "./ThemeToggle";

/**
 * Floating dock.
 *
 *  - Clean glyphs + labels at rest. No boxes, nothing busy.
 *  - The active page gets a soft emerald capsule that glides between items.
 *  - Home is a raised orb; the ring around it fills as you scroll the page.
 *  - Mouse: macOS-style magnification. Each icon lifts out of the bar on a
 *    glass tile that fades in as it grows. The bar itself never resizes, so
 *    nothing jitters.
 *  - Touch: big 50px targets, press-in feel, tiny haptic tick.
 */

const REACH = 140; // px of influence either side of the pointer

type Layout = { slot: number; tile: number; orb: number; peak: number; orbPeak: number };

function layoutFor(wide: boolean, fine: boolean, reduce: boolean): Layout {
  const magnify = fine && !reduce;
  return {
    slot: wide ? 58 : 50,
    tile: wide ? 44 : 40,
    orb: wide ? 66 : 58,
    peak: magnify ? 1.62 : 1,
    orbPeak: magnify ? 1.2 : 1,
  };
}

function useDockMode() {
  const [mode, setMode] = useState({ wide: true, fine: true });
  useEffect(() => {
    const w = window.matchMedia("(min-width: 640px)");
    const f = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setMode({ wide: w.matches, fine: f.matches });
    sync();
    w.addEventListener("change", sync);
    f.addEventListener("change", sync);
    return () => {
      w.removeEventListener("change", sync);
      f.removeEventListener("change", sync);
    };
  }, []);
  return mode;
}

const haptic = () => {
  try {
    navigator.vibrate?.(8);
  } catch {}
};

/** spring-smoothed scale that peaks when the pointer is over the element */
function useMagnify(
  mouseX: MotionValue<number>,
  ref: React.RefObject<HTMLElement | null>,
  peak: number,
) {
  const dist = useTransform(mouseX, (x) => {
    const r = ref.current?.getBoundingClientRect();
    return r ? x - (r.left + r.width / 2) : 9999;
  });
  const shoulder = 1 + (peak - 1) * 0.32;
  const raw = useTransform(
    dist,
    [-REACH, -REACH * 0.5, 0, REACH * 0.5, REACH],
    [1, shoulder, peak, shoulder, 1],
  );
  return useSpring(raw, { stiffness: 420, damping: 30, mass: 0.4 });
}

type Entry = { id: string; label: string; Icon: LucideIcon; cls: string; badge?: boolean };

/** `cls` sets visibility + visual order: phones get 2 · Home · 2, desktop 3 · Home · 3 */
const ENTRIES: Entry[] = [
  { id: "experience", label: "Work", Icon: Briefcase, cls: "hidden sm:flex order-1" },
  { id: "skills", label: "Stack", Icon: Code2, cls: "hidden sm:flex order-2" },
  { id: "work", label: "Projects", Icon: FolderGit2, cls: "flex order-1 sm:order-3" },
  { id: "about", label: "About", Icon: User, cls: "flex order-2 sm:order-5" },
  { id: "blog", label: "Blog", Icon: BookOpen, cls: "flex order-4 sm:order-6" },
  { id: "contact", label: "Contact", Icon: Mail, cls: "flex order-5 sm:order-7", badge: true },
];

function Slot({
  mouseX,
  layout,
  label,
  active,
  hop = true,
  badge,
  onPress,
  className,
  children,
}: {
  mouseX: MotionValue<number>;
  layout: Layout;
  label: string;
  active?: boolean;
  hop?: boolean;
  badge?: boolean;
  onPress: (el: Element) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const tileRef = useRef<HTMLDivElement>(null);
  const bounce = useAnimationControls();
  const scale = useMagnify(mouseX, ref, layout.peak);
  const magnifies = layout.peak > 1;
  // (no magnification → degenerate input ranges, so fall back to constants)
  const lift = useTransform(scale, magnifies ? [1, layout.peak] : [0, 1], magnifies ? [0, -(layout.peak - 1) * 14] : [0, 0]);
  const reveal = useTransform(
    scale,
    magnifies ? [1, 1 + (layout.peak - 1) * 0.55, layout.peak] : [0, 1],
    magnifies ? [0, 0.85, 1] : [0, 0],
  );

  return (
    <div
      ref={ref}
      style={{ width: layout.slot }}
      className={`relative shrink-0 ${className ?? ""}`}
    >
      {active && (
        <motion.span
          layoutId="dock-active"
          aria-hidden
          className="dock-active absolute -inset-x-px -bottom-1.5 -top-1 rounded-[20px]"
          transition={{ type: "spring", stiffness: 520, damping: 38 }}
        />
      )}

      <motion.button
        type="button"
        aria-label={label}
        aria-current={active ? "page" : undefined}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 600, damping: 26 }}
        onClick={(e) => {
          haptic();
          if (hop) {
            bounce.start({
              y: layout.peak > 1 ? [0, -14, 0, -6, 0] : [0, -6, 0],
              transition: { duration: layout.peak > 1 ? 0.65 : 0.32, ease: "easeOut" },
            });
          }
          // the visible icon tile (not the whole hit area) is where effects such as
          // the theme venom should originate from
          onPress(tileRef.current ?? e.currentTarget);
        }}
        className="hover-target relative flex h-full w-full flex-col items-center rounded-[20px] outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <motion.div
          ref={tileRef}
          style={{ scale, y: lift, transformOrigin: "50% 100%", width: layout.tile, height: layout.tile }}
          className="relative"
        >
          <motion.span
            aria-hidden
            style={{ opacity: reveal }}
            className="dock-lift absolute inset-0 rounded-[28%]"
          />
          <motion.div
            animate={bounce}
            className="dock-glyph relative grid h-full w-full place-items-center"
            data-active={active ? "1" : undefined}
          >
            {children}
            {badge && (
              <span aria-hidden className="absolute right-[14%] top-[14%] h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60" />
                <span className="absolute inset-0 rounded-full bg-accent ring-2 ring-[var(--dock-ring)]" />
              </span>
            )}
          </motion.div>
        </motion.div>
        <span className="dock-label mt-[3px]" data-active={active ? "1" : undefined}>
          {label}
        </span>
      </motion.button>
    </div>
  );
}

/** Raised Home orb with a scroll-progress ring */
function Orb({
  mouseX,
  layout,
  active,
  onPress,
}: {
  mouseX: MotionValue<number>;
  layout: Layout;
  active: boolean;
  onPress: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const bounce = useAnimationControls();
  const scale = useMagnify(mouseX, ref, layout.orbPeak);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 32, mass: 0.4 });

  return (
    <div
      ref={ref}
      style={{ width: layout.slot + 14, height: layout.tile + 18 }}
      className="relative order-3 shrink-0 sm:order-4"
    >
      <motion.div
        animate={bounce}
        className="absolute bottom-[19px] left-1/2 -translate-x-1/2"
      >
        <motion.button
          type="button"
          aria-label="Home"
          aria-current={active ? "page" : undefined}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 600, damping: 26 }}
          style={{ scale, transformOrigin: "50% 100%", width: layout.orb, height: layout.orb }}
          onClick={() => {
            haptic();
            bounce.start({
              y: [0, -14, 0, -6, 0],
              transition: { duration: 0.65, ease: "easeOut" },
            });
            onPress();
          }}
          className="dock-orb-ring hover-target group relative grid place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent"
          data-active={active ? "1" : undefined}
        >
          <svg viewBox="0 0 64 64" aria-hidden className="absolute inset-0 h-full w-full -rotate-90">
            <circle cx="32" cy="32" r="29.5" fill="none" stroke="var(--line-strong)" strokeWidth="1.5" />
            <motion.circle
              cx="32"
              cy="32"
              r="29.5"
              fill="none"
              stroke="var(--phosphor)"
              strokeWidth="2.25"
              strokeLinecap="round"
              style={{ pathLength: progress }}
            />
          </svg>
          <span className="dock-orb absolute inset-[7px] grid place-items-center rounded-full">
            <Home className="h-[46%] w-[46%] transition-transform duration-300 group-hover:scale-110" strokeWidth={2.1} />
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}

export default function Dock({
  visible,
  active,
  onGo,
  onMenu,
}: {
  visible: boolean;
  active: string;
  onGo: (id: string) => void;
  onMenu: () => void;
}) {
  const mouseX = useMotionValue(9999);
  const reduce = useReducedMotion() ?? false;
  const { wide, fine } = useDockMode();
  const layout = layoutFor(wide, fine, reduce);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 110, opacity: 0, scale: 0.94 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 110, opacity: 0, scale: 0.94 }}
          transition={{ type: "spring", stiffness: 360, damping: 34 }}
          className="pointer-events-none fixed left-1/2 z-50 max-w-[calc(100vw-0.75rem)] -translate-x-1/2"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
        >
          {/* keyed so the magnification curves are rebuilt when sizes change */}
          <div
            key={`${wide}-${fine}-${reduce}`}
            role="navigation"
            aria-label="Quick navigation"
            onPointerMove={(e) => {
              if (e.pointerType === "mouse") mouseX.set(e.clientX);
            }}
            onPointerLeave={() => mouseX.set(9999)}
            className="dock-glass pointer-events-auto relative flex items-end rounded-full px-2 pb-2.5 pt-2 sm:px-3"
          >
            {ENTRIES.map((e) => (
              <Slot
                key={e.id}
                mouseX={mouseX}
                layout={layout}
                label={e.label}
                active={active === e.id}
                className={e.cls}
                badge={e.badge}
                onPress={() => onGo(e.id)}
              >
                <e.Icon className="h-[50%] w-[50%]" strokeWidth={1.7} />
              </Slot>
            ))}

            <Orb mouseX={mouseX} layout={layout} active={active === "home"} onPress={() => onGo("home")} />

            <span
              aria-hidden
              className="order-6 mx-1 mb-5 h-7 w-px self-end bg-fg/12 sm:order-8"
            />

            <Slot
              mouseX={mouseX}
              layout={layout}
              label="Theme"
              hop={false}
              className="flex order-7 sm:order-9"
              onPress={toggleTheme}
            >
              <Sun className="theme-sun h-[50%] w-[50%]" strokeWidth={1.7} />
              <Moon className="theme-moon h-[50%] w-[50%]" strokeWidth={1.7} />
            </Slot>

            <Slot
              mouseX={mouseX}
              layout={layout}
              label="Menu"
              hop={false}
              className="hidden order-10 sm:flex"
              onPress={onMenu}
            >
              <Menu className="h-[50%] w-[50%]" strokeWidth={1.7} />
            </Slot>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
