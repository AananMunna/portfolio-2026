"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Home,
  Briefcase,
  Code2,
  FolderGit2,
  User,
  BookOpen,
  Mail,
  ArrowRight,
  X,
  Menu,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

type NavItem = {
  id: string;
  title: string;
  short: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;
  target?: string;
  route?: string;
};

export const navItems: NavItem[] = [
  { id: "home", title: "Home", short: "Home", icon: Home, target: "body" },
  {
    id: "experience",
    title: "Experience",
    short: "Work",
    icon: Briefcase,
    target: "#experience",
  },
  {
    id: "skills",
    title: "Stack",
    short: "Stack",
    icon: Code2,
    target: "#skills",
  },
  {
    id: "work",
    title: "Projects",
    short: "Projects",
    icon: FolderGit2,
    target: "#work",
  },
  { id: "about", title: "About", short: "About", icon: User, target: "#about" },
  { id: "blog", title: "Blog", short: "Blog", icon: BookOpen, route: "/blog" },
  {
    id: "contact",
    title: "Contact",
    short: "Contact",
    icon: Mail,
    route: "/contact",
  },
];

const RESUME =
  "https://drive.google.com/file/d/17lmURlHIjW8VCMQNHw-ddDGYOg_t6iGM/view";

const lenisTo = (target: string | number, immediate = false) => {
  const lenis = (window as any).lenis;
  if (lenis) {
    lenis.scrollTo(target, {
      immediate,
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
  } else if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: immediate ? "auto" : "smooth" });
  } else {
    document
      .querySelector(target)
      ?.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
  }
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  const [menuOpen, setMenuOpen] = useState(false);
  const [clicked, setClicked] = useState<NavItem | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [hoveredDock, setHoveredDock] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [showDock, setShowDock] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const lastY = useRef(0);
  const busy = useRef(false);
  const pendingNav = useRef(false); // true when we are waiting for a real route change

  /* ── route-driven active state ── */
  useEffect(() => {
    if (pathname.startsWith("/blog")) setActiveSection("blog");
    else if (pathname.startsWith("/contact")) setActiveSection("contact");
    else if (pathname === "/") {
      // keep current section on home, only reset if coming from another page
    } else {
      setActiveSection("home");
    }
  }, [pathname]);

/* ── after navigation: wait for target, then keep aligned ── */
useEffect(() => {
  if (pathname !== "/") return;

  const hash = sessionStorage.getItem("nav-target") || window.location.hash || null;
  let stop = false;
  let foundAt = 0;
  const start = performance.now();

  const onUser = () => { stop = true; };
  const evs = ["wheel", "touchstart", "keydown"] as const;
  evs.forEach((e) => window.addEventListener(e, onUser, { passive: true }));

  const tick = () => {
    if (stop) return;
    const now = performance.now();
    const lenis = (window as any).lenis;

    // plain Home → just go to top
    if (!hash || hash === "#") {
      lenis?.resize?.();
      lenisTo(0, true);
      return;
    }

    const el = document.querySelector(hash);

    // Home not mounted yet → keep waiting (max 5s)
    if (!el) {
      if (now - start < 5000) requestAnimationFrame(tick);
      else lenisTo(0, true);
      return;
    }

    if (!foundAt) foundAt = now;

    // re-align if layout shifted
    if (Math.abs(el.getBoundingClientRect().top) > 2) {
      lenis?.resize?.();
      lenisTo(hash, true);
    }

    if (now - foundAt < 1200) requestAnimationFrame(tick);
    else sessionStorage.removeItem("nav-target");
  };

  requestAnimationFrame(tick);

  return () => {
    stop = true;
    evs.forEach((e) => window.removeEventListener(e, onUser));
  };
}, [pathname]);

  /* ── scroll direction ── */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 70);
      if (y < 90) setShowDock(false);
      else if (y < lastY.current) setShowDock(true);
      else if (y > lastY.current + 6) setShowDock(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  /* ── active section on home ── */
  useEffect(() => {
    if (!isHome) return;
    const ids = ["experience", "skills", "work", "about"];
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (e) => e.isIntersecting && setActiveSection(e.target.id),
        ),
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    const top = () => window.scrollY < 160 && setActiveSection("home");
    window.addEventListener("scroll", top, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", top);
    };
  }, [isHome]);

  /* ── body scroll lock + ESC ── */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menuOpen && !clicked) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, clicked]);

  /* ── finish transition ONLY when pathname actually changes ── */
  useEffect(() => {
    if (!pendingNav.current || !clicked) return;

    // Route has changed → finish the cover quickly
    const t = window.setTimeout(() => {
      setMenuOpen(false);
      window.setTimeout(() => {
        setClicked(null);
        busy.current = false;
        pendingNav.current = false;
      }, 280);
    }, 40);

    return () => window.clearTimeout(t);
  }, [pathname, clicked]);

  /**
   * Ultra-snappy navigation
   */
const go = useCallback(
  (item: NavItem) => {
    if (busy.current) return;

    // Already on that route
    if (item.route && pathname === item.route) {
      setMenuOpen(false);
      lenisTo(0);
      return;
    }

    busy.current = true;
    setClicked(item);
    setMenuOpen(true);

    window.setTimeout(() => {
      if (item.route) {
        // Going to /blog or /contact
        pendingNav.current = true;
        router.push(item.route);
      } else if (isHome) {
        // Same page section
        lenisTo(item.target!, true);
        setMenuOpen(false);
        window.setTimeout(() => {
          setClicked(null);
          busy.current = false;
        }, 320);
      } else {
        // Coming from Blog/Contact → Home section
        pendingNav.current = true;

        if (item.target && item.target !== "body") {
          sessionStorage.setItem("nav-target", item.target); // "#work", "#about" etc.
        } else {
          sessionStorage.removeItem("nav-target");
        }

        router.push("/"); // always clean navigation
      }
    }, 380);
  },
  [isHome, pathname, router],
);

  const logoClick = (e: React.MouseEvent) => {
    if (isHome) {
      e.preventDefault();
      lenisTo(0);
    }
  };

  return (
    <>
      {/* ===================== TOP BAR ===================== */}
      <motion.nav
        initial={false}
        animate={{ y: scrolled ? -100 : 0, opacity: scrolled ? 0 : 1 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-0 top-0 z-50 w-full"
      >
        <div className="mx-auto flex h-[64px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            onClick={logoClick}
            aria-label="Aanan Munna, home"
            className="hover-target group flex items-center"
          >
            <img
              src="/favicon.svg"
              alt=""
              width={36}
              height={36}
              className="h-[36px] w-[36px] rounded-[9px] shadow-[0_4px_14px_-4px_rgba(0,0,0,0.35)] transition-transform duration-250 group-hover:-rotate-3 group-hover:scale-105"
            />
          </Link>

          <div className="hidden items-center lg:flex">
            {navItems
              .filter((n) => n.id !== "home")
              .map((n) => {
                const active = activeSection === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => go(n)}
                    className={`hover-target group relative px-3.5 py-2 text-[13.5px] font-medium tracking-tight transition-colors duration-200 ${
                      active ? "text-fg" : "text-muted hover:text-fg"
                    }`}
                  >
                    {n.title}
                    <span
                      className={`absolute inset-x-3.5 -bottom-0.5 h-[2px] origin-left rounded-full bg-accent transition-transform duration-250 ${
                        active
                          ? "scale-x-100"
                          : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </button>
                );
              })}

            <a
              href={RESUME}
              target="_blank"
              rel="noopener noreferrer"
              className="hover-target btn-ghost ml-4 !px-4 !py-2 !text-[13px]"
            >
              Resume
            </a>
            <ThemeToggle className="ml-3" />
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="hover-target flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/5 transition-colors hover:bg-white/10"
            >
              <span className="h-[1.5px] w-5 rounded-full bg-white" />
              <span className="h-[1.5px] w-3.5 rounded-full bg-white" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ===================== FLOATING DOCK ===================== */}
      <AnimatePresence>
        {showDock && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 480, damping: 38 }}
            className="pointer-events-none fixed bottom-3 left-1/2 z-50 max-w-[calc(100vw-1rem)] -translate-x-1/2"
          >
            <div
              className="pointer-events-auto relative flex items-center gap-0.5 rounded-2xl border px-1.5 py-1.5 shadow-2xl backdrop-blur-xl"
              style={{
                background: "var(--dock-bg)",
                borderColor: "var(--line)",
              }}
            >
              {navItems.map((n) => {
                const Icon = n.icon;
                const active = activeSection === n.id;
                const hovered = hoveredDock === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => go(n)}
                    onMouseEnter={() => setHoveredDock(n.id)}
                    onMouseLeave={() => setHoveredDock(null)}
                    aria-label={n.short}
                    className="hover-target relative flex h-10 w-10 items-center justify-center rounded-xl sm:h-11 sm:w-11"
                  >
                    <motion.span
                      className="absolute inset-0 rounded-xl bg-white"
                      initial={false}
                      animate={{
                        opacity: active ? 0.1 : hovered ? 0.06 : 0,
                        scale: active || hovered ? 1 : 0.88,
                      }}
                      transition={{ duration: 0.15 }}
                    />
                    <motion.span
                      animate={{
                        y: active ? -1 : 0,
                        scale: active ? 1.12 : hovered ? 1.07 : 1,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 520,
                        damping: 28,
                      }}
                      className="relative z-10"
                    >
                      <Icon
                        size={18}
                        strokeWidth={active ? 2.3 : 1.8}
                        className={`transition-colors duration-150 ${
                          active
                            ? "text-accent"
                            : hovered
                              ? "text-fg"
                              : "text-muted"
                        }`}
                      />
                    </motion.span>
                    {active && (
                      <motion.span
                        layoutId="dock-dot"
                        className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-accent"
                        transition={{
                          type: "spring",
                          stiffness: 600,
                          damping: 32,
                        }}
                      />
                    )}
                    <AnimatePresence>
                      {hovered && (
                        <motion.span
                          initial={{ opacity: 0, y: 6, scale: 0.92 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.95 }}
                          transition={{ duration: 0.12 }}
                          className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-fg px-2.5 py-1 text-[11px] font-medium text-bg shadow-lg"
                        >
                          {n.short}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                );
              })}
              <span className="mx-1 h-5 w-px bg-white/10" />
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                className="hover-target flex h-10 w-10 items-center justify-center rounded-xl text-muted transition-colors hover:text-fg sm:h-11 sm:w-11"
              >
                <Menu size={17} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================== FULL-SCREEN MENU + TRANSITION COVER ===================== */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] flex flex-col justify-center overflow-hidden bg-bg/95 backdrop-blur-2xl"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--line)_1px,transparent_1px),linear-gradient(to_bottom,var(--line)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-40" />

            {!clicked && (
              <>
                <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-5 sm:px-10">
                  <span className="eyebrow">Navigation</span>
                  <button
                    onClick={() => setMenuOpen(false)}
                    aria-label="Close menu"
                    className="hover-target pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-all duration-250 hover:rotate-90 hover:bg-white/15"
                  >
                    <X size={17} />
                  </button>
                </div>

                <div
                  className="relative z-20 h-full w-full overflow-y-auto px-5 pb-20 pt-20 sm:px-12 sm:pt-24 md:px-20"
                  data-lenis-prevent="true"
                >
                  <div className="mx-auto flex max-w-4xl flex-col">
                    {navItems.map((n, i) => {
                      const Icon = n.icon;
                      const active = activeSection === n.id;
                      return (
                        <motion.button
                          key={n.id}
                          initial={{ opacity: 0, y: 28 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.38,
                            delay: i * 0.03,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          onMouseEnter={() => setHoveredRow(n.id)}
                          onMouseLeave={() => setHoveredRow(null)}
                          onClick={() => go(n)}
                          className="hover-target group relative flex items-center justify-between border-b hairline py-3.5 text-left sm:py-4"
                        >
                          <div className="flex items-baseline gap-5 sm:gap-10">
                            <span className="font-mono text-xs tabular-nums text-muted">
                              0{i + 1}
                            </span>
                            <span
                              className={`text-[1.85rem] font-semibold tracking-tight transition-all duration-300 group-hover:translate-x-2.5 sm:text-5xl md:text-6xl ${
                                active || hoveredRow === n.id
                                  ? "text-fg"
                                  : "text-fg/40"
                              }`}
                            >
                              {n.title}
                            </span>
                          </div>
                          <div className="flex -translate-x-4 items-center gap-4 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                            <Icon
                              size={24}
                              strokeWidth={1.5}
                              className="hidden text-muted sm:block"
                            />
                            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white">
                              <ArrowRight size={16} />
                            </span>
                          </div>
                        </motion.button>
                      );
                    })}
                    <a
                      href={RESUME}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover-target mt-7 inline-flex w-fit items-center gap-2 text-sm font-medium text-accent"
                    >
                      Download resume <ArrowRight size={14} />
                    </a>
                  </div>
                </div>
              </>
            )}

            {/* Transition Cover – ultra fast */}
            {clicked && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.01 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-bg"
              >
                <div className="hero-ambient absolute inset-0" />
                <motion.div
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: 0.06,
                    duration: 0.28,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="relative z-10 flex flex-col items-center"
                >
                  <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border hairline bg-white/5">
                    <clicked.icon
                      size={28}
                      strokeWidth={1.5}
                      className="text-accent"
                    />
                  </span>
                  <h2 className="px-6 text-center text-4xl font-semibold tracking-tight text-fg sm:text-6xl">
                    {clicked.title}
                  </h2>
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{
                      delay: 0.14,
                      duration: 0.32,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="mt-5 h-[2px] w-14 origin-center rounded-full bg-accent sm:w-20"
                  />
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}