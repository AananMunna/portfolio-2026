"use client";

import { useRef } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  PiBookOpenTextFill,
  PiHouseFill,
  PiListBold,
  PiMoonStarsFill,
  PiPaperPlaneTiltFill,
  PiSquaresFourFill,
  PiStackFill,
  PiSuitcaseSimpleFill,
  PiSunFill,
  PiUserCircleFill,
} from "react-icons/pi";
import { toggleTheme } from "./ThemeToggle";

/**
 * iOS-style floating dock.
 * - big rounded "app icon" tiles (44-54px, comfortable thumb targets)
 * - frosted glass bar that respects the phone's safe area
 * - press-in feel (spring scale) + a tiny haptic tick where supported
 * - desktop: icons magnify as the pointer moves along the dock
 * Everything animates with transforms only.
 */

type Entry = {
  id: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  desktopOnly?: boolean;
};

const ENTRIES: Entry[] = [
  { id: "home", label: "Home", Icon: PiHouseFill },
  { id: "experience", label: "Experience", Icon: PiSuitcaseSimpleFill, desktopOnly: true },
  { id: "skills", label: "Stack", Icon: PiStackFill, desktopOnly: true },
  { id: "work", label: "Projects", Icon: PiSquaresFourFill },
  { id: "about", label: "About", Icon: PiUserCircleFill },
  { id: "blog", label: "Blog", Icon: PiBookOpenTextFill },
  { id: "contact", label: "Contact", Icon: PiPaperPlaneTiltFill },
];

const TILE =
  "h-[44px] w-[44px] min-[380px]:h-[50px] min-[380px]:w-[50px] sm:h-[54px] sm:w-[54px]";
const ICON = "h-[23px] w-[23px] min-[380px]:h-[26px] min-[380px]:w-[26px] sm:h-[28px] sm:w-[28px]";

const haptic = () => {
  try {
    navigator.vibrate?.(8);
  } catch {}
};

function Tile({
  mouseX,
  label,
  active,
  onPress,
  desktopOnly,
  children,
}: {
  mouseX: MotionValue<number>;
  label: string;
  active?: boolean;
  onPress: (el: Element) => void;
  desktopOnly?: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dist = useTransform(mouseX, (x) => {
    const r = ref.current?.getBoundingClientRect();
    return r ? x - (r.left + r.width / 2) : 9999;
  });
  const raw = useTransform(dist, [-130, -65, 0, 65, 130], [1, 1.16, 1.42, 1.16, 1]);
  const scale = useSpring(raw, { stiffness: 420, damping: 30, mass: 0.35 });

  return (
    <motion.div
      ref={ref}
      style={{ scale, transformOrigin: "50% 100%" }}
      className={`group relative ${desktopOnly ? "hidden sm:block" : ""}`}
    >
      <motion.button
        type="button"
        aria-label={label}
        aria-current={active ? "page" : undefined}
        onClick={(e) => {
          haptic();
          onPress(e.currentTarget);
        }}
        whileTap={{ scale: 0.84 }}
        transition={{ type: "spring", stiffness: 600, damping: 26 }}
        className={`hover-target relative grid place-items-center overflow-hidden rounded-[24%] outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent ${
          active ? "text-accent" : "text-fg/70"
        } ${TILE}`}
        style={{
          background: active ? "var(--phosphorA)" : "color-mix(in srgb, var(--text) 5%, transparent)",
          boxShadow: active
            ? "inset 0 0 0 1px color-mix(in srgb, var(--phosphor) 45%, transparent)"
            : "inset 0 0 0 1px var(--line)",
        }}
      >
        <span className="relative">{children}</span>
      </motion.button>

      {active && (
        <motion.span
          layoutId="dock-dot"
          aria-hidden
          className="absolute -bottom-[9px] left-1/2 h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-accent"
          transition={{ type: "spring", stiffness: 600, damping: 32 }}
        />
      )}

      {/* label bubble (mouse only) */}
      <span className="pointer-events-none absolute -top-9 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-fg/90 px-2.5 py-1 text-[11px] font-medium text-bg opacity-0 shadow-lg transition-opacity duration-100 [@media(hover:hover)]:group-hover:opacity-100 sm:block">
        {label}
      </span>
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

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
          className="pointer-events-none fixed left-1/2 z-50 max-w-[calc(100vw-0.75rem)] -translate-x-1/2"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)" }}
        >
          <div
            role="navigation"
            aria-label="Quick navigation"
            onPointerMove={(e) => {
              if (e.pointerType === "mouse") mouseX.set(e.clientX);
            }}
            onPointerLeave={() => mouseX.set(9999)}
            className="dock-glass pointer-events-auto flex items-end gap-[5px] rounded-[28px] px-2 pb-3 pt-2 sm:gap-2 sm:px-2.5"
          >
            {ENTRIES.map((e) => (
              <Tile
                key={e.id}
                mouseX={mouseX}
                label={e.label}
                active={active === e.id}
                desktopOnly={e.desktopOnly}
                onPress={() => onGo(e.id)}
              >
                <e.Icon className={ICON} />
              </Tile>
            ))}

            <span aria-hidden className="mx-0.5 mb-1 h-9 w-px self-center bg-fg/15 sm:h-11" />

            <Tile
              mouseX={mouseX}
              label="Theme"
              onPress={toggleTheme}
            >
              <PiSunFill className={`theme-sun ${ICON}`} />
              <PiMoonStarsFill className={`theme-moon ${ICON}`} />
            </Tile>

            <Tile
              mouseX={mouseX}
              label="Menu"
              onPress={onMenu}
              desktopOnly
            >
              <PiListBold className={ICON} />
            </Tile>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
