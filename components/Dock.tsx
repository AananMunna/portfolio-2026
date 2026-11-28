"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useMotionValue,
  useReducedMotion,
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
 * Floating dock: frosted pill, raised glowing Home orb in the middle, labelled
 * icons on both sides.
 *
 * Interaction is modelled on the macOS Dock:
 *  - icons magnify smoothly as the pointer travels along the bar, and the
 *    neighbours really make room (layout, not just a transform)
 *  - the bar grows upward from its bottom edge, like the real thing
 *  - clicking an icon makes it bounce
 *  - touch / coarse pointers skip the magnification and just get a press-in feel
 */

const LABEL_H = 18; // label row under every icon (px)
const REACH = 150; // how far from the pointer an icon still feels it (px)

type Sizes = { base: number; peak: number; orb: number; orbPeak: number };

function sizesFor(wide: boolean, fine: boolean, reduce: boolean): Sizes {
  const base = wide ? 46 : 40;
  const orb = wide ? 62 : 54;
  const magnify = fine && !reduce;
  return {
    base,
    orb,
    peak: magnify ? (wide ? 76 : 62) : base,
    orbPeak: magnify ? (wide ? 88 : 72) : orb,
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

type Entry = { id: string; label: string; Icon: LucideIcon; cls: string };

/**
 * `cls` sets visibility and the visual order, so phones get a balanced
 * 2 · Home · 2 layout while desktop shows the full 3 · Home · 3.
 */
const ENTRIES: Entry[] = [
  { id: "experience", label: "Work", Icon: Briefcase, cls: "hidden sm:flex order-1" },
  { id: "skills", label: "Stack", Icon: Code2, cls: "hidden sm:flex order-2" },
  { id: "work", label: "Projects", Icon: FolderGit2, cls: "flex order-1 sm:order-3" },
  { id: "about", label: "About", Icon: User, cls: "flex order-2 sm:order-5" },
  { id: "blog", label: "Blog", Icon: BookOpen, cls: "flex order-4 sm:order-6" },
  { id: "contact", label: "Contact", Icon: Mail, cls: "flex order-5 sm:order-7" },
];

function Slot({
  mouseX,
  sizes,
  label,
  active,
  orb,
  bounce: canBounce = true,
  onPress,
  className,
  children,
}: {
  mouseX: MotionValue<number>;
  sizes: Sizes;
  label: string;
  active?: boolean;
  orb?: boolean;
  bounce?: boolean;
  onPress: (el: Element) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const bounce = useAnimationControls();

  const base = orb ? sizes.orb : sizes.base;
  const peak = orb ? sizes.orbPeak : sizes.peak;

  // distance between the pointer and this icon's centre
  const dist = useTransform(mouseX, (x) => {
    const r = ref.current?.getBoundingClientRect();
    return r ? x - (r.left + r.width / 2) : 9999;
  });
  const lift = (peak - base) * 0.3;
  const raw = useTransform(
    dist,
    [-REACH, -REACH * 0.5, 0, REACH * 0.5, REACH],
    [base, base + lift, peak, base + lift, base],
  );
  const size = useSpring(raw, { stiffness: 380, damping: 28, mass: 0.45 });

  const press = (e: React.MouseEvent<HTMLButtonElement>) => {
    haptic();
    if (canBounce && peak !== base) {
      bounce.start({
        y: [0, -16, 0, -8, 0],
        transition: { duration: 0.7, times: [0, 0.3, 0.56, 0.78, 1], ease: "easeOut" },
      });
    } else if (canBounce) {
      bounce.start({
        y: [0, -8, 0],
        transition: { duration: 0.35, ease: "easeOut" },
      });
    }
    onPress(e.currentTarget);
  };

  const button = (
    <motion.button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      onClick={press}
      whileTap={{ scale: 0.88 }}
      transition={{ type: "spring", stiffness: 600, damping: 26 }}
      className={
        orb
          ? "dock-orb hover-target grid h-full w-full place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent"
          : "dock-tile hover-target grid h-full w-full place-items-center rounded-[26%] outline-none focus-visible:ring-2 focus-visible:ring-accent"
      }
      data-active={active ? "1" : undefined}
    >
      {children}
    </motion.button>
  );

  if (orb) {
    return (
      <motion.div
        ref={ref}
        style={{ width: size, height: sizes.base + LABEL_H }}
        className={`relative shrink-0 ${className ?? ""}`}
      >
        <motion.div
          animate={bounce}
          style={{ height: size, bottom: LABEL_H + 8 }}
          className="absolute left-0 w-full"
        >
          {button}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      style={{ width: size }}
      className={`relative shrink-0 flex-col items-center ${className ?? ""}`}
    >
      <motion.div animate={bounce} style={{ height: size }} className="w-full">
        {button}
      </motion.div>
      <span
        className="pointer-events-none mt-1 whitespace-nowrap text-[10px] font-medium leading-[14px] tracking-tight sm:text-[10.5px]"
        style={{
          color: active
            ? "var(--phosphor)"
            : "color-mix(in srgb, var(--text) 62%, transparent)",
        }}
      >
        {label}
      </span>
      <span
        aria-hidden
        className={`absolute -bottom-[8px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent transition-opacity duration-200 ${
          active ? "opacity-100" : "opacity-0"
        }`}
      />
    </motion.div>
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
  const sizes = sizesFor(wide, fine, reduce);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 380, damping: 34 }}
          className="pointer-events-none fixed left-1/2 z-50 max-w-[calc(100vw-0.75rem)] -translate-x-1/2"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
        >
          {/* keyed so the magnification curves are rebuilt when the sizes change */}
          <div
            key={`${wide}-${fine}-${reduce}`}
            role="navigation"
            aria-label="Quick navigation"
            onPointerMove={(e) => {
              if (e.pointerType === "mouse") mouseX.set(e.clientX);
            }}
            onPointerLeave={() => mouseX.set(9999)}
            className="dock-glass pointer-events-auto flex items-end gap-1 rounded-full px-3 pb-[14px] pt-2.5 sm:gap-1.5 sm:px-4"
          >
            {ENTRIES.map((e) => (
              <Slot
                key={e.id}
                mouseX={mouseX}
                sizes={sizes}
                label={e.label}
                active={active === e.id}
                className={e.cls}
                onPress={() => onGo(e.id)}
              >
                <e.Icon className="h-[50%] w-[50%]" strokeWidth={1.7} />
              </Slot>
            ))}

            {/* raised Home orb */}
            <Slot
              orb
              mouseX={mouseX}
              sizes={sizes}
              label="Home"
              active={active === "home"}
              className="flex order-3 sm:order-4"
              onPress={() => onGo("home")}
            >
              <Home className="h-[46%] w-[46%]" strokeWidth={2} />
            </Slot>

            <span
              aria-hidden
              className="order-6 mx-0.5 mb-[22px] hidden h-8 w-px self-end bg-fg/15 min-[380px]:block sm:order-8 sm:mb-[26px] sm:h-10"
            />

            <Slot
              mouseX={mouseX}
              sizes={sizes}
              label="Theme"
              bounce={false}
              className="flex order-7 sm:order-9"
              onPress={toggleTheme}
            >
              <Sun className="theme-sun h-[50%] w-[50%]" strokeWidth={1.7} />
              <Moon className="theme-moon h-[50%] w-[50%]" strokeWidth={1.7} />
            </Slot>

            <Slot
              mouseX={mouseX}
              sizes={sizes}
              label="Menu"
              bounce={false}
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
