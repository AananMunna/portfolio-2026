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
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  /** in-page anchor on the home page */
  target?: string;
  /** separate route */
  route?: string;
};

export const navItems: NavItem[] = [
  { id: "home", title: "Home", short: "Home", icon: Home, target: "body" },
  { id: "experience", title: "Experience", short: "Work", icon: Briefcase, target: "#experience" },
  { id: "skills", title: "Stack", short: "Stack", icon: Code2, target: "#skills" },
  { id: "work", title: "Projects", short: "Projects", icon: FolderGit2, target: "#work" },
  { id: "about", title: "About", short: "About", icon: User, target: "#about" },
  { id: "blog", title: "Blog", short: "Blog", icon: BookOpen, route: "/blog" },
  { id: "contact", title: "Contact", short: "Contact", icon: Mail, route: "/contact" },
];

const RESUME =
  "https://drive.google.com/file/d/17lmURlHIjW8VCMQNHw-ddDGYOg_t6iGM/view";

const lenisTo = (target: string | number, immediate = false) => {
  const lenis = (window as any).lenis;
  if (lenis) {
    lenis.scrollTo(target, {
      immediate,
      duration: 1.6,
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
  const [hideDock, setHideDock] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const lastY = useRef(0);
  const busy = useRef(false);

  /* ── route-driven active state ── */
  useEffect(() => {
    if (pathname.startsWith("/blog")) setActiveSection("blog");
    else if (pathname.startsWith("/contact")) setActiveSection("contact");
    else setActiveSection("home");
  }, [pathname]);

  /* ── after navigation: land at top, or at the hash on home ── */
  useEffect(() => {
    const t = window.setTimeout(() => {
      const hash = window.location.hash;
      if (pathname === "/" && hash && document.querySelector(hash)) {
        lenisTo(hash, true);
      } else {
        lenisTo(0, true);
      }
    }, 60);
    return () => window.clearTimeout(t);
  }, [pathname]);

  /* ── hide the dock while the projects section is on screen ── */
  useEffect(() => {
    if (!isHome) {
      setHideDock(false);
      return;
    }
    const work = document.getElementById("work");
    if (!work) return;
    const io = new IntersectionObserver(
      ([e]) => setHideDock(e.isIntersecting && e.intersectionRatio > 0.15),
      { threshold: [0, 0.15, 0.3, 0.5], rootMargin: "-10% 0px -10% 0px" },
    );
    io.observe(work);
    return () => io.disconnect();
  }, [isHome]);

  /* ── scroll direction: top bar hides on scroll, dock appears on scroll-up ── */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 80);
      if (y < 100) setShowDock(false);
      else if (y < lastY.current) setShowDock(true);
      else if (y > lastY.current + 8) setShowDock(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  /* ── active section on the home page ── */
  useEffect(() => {
    if (!isHome) return;
    const ids = ["experience", "skills", "work", "about"];
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.isIntersecting && setActiveSection(e.target.id)),
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    const top = () => window.scrollY < 180 && setActiveSection("home");
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

  /**
   * One transition for every link: the cover card fades in, we jump (or route)
   * underneath it, then it fades out. Same feel for anchors and for pages.
   */
  const go = useCallback(
    (item: NavItem) => {
      if (busy.current) return;
      // already on that page: just scroll to the top
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
          router.push(item.route);
        } else if (isHome) {
          lenisTo(item.target!, true);
        } else {
          router.push(item.target === "body" ? "/" : `/${item.target}`);
        }
        setMenuOpen(false);
        window.setTimeout(() => {
          setClicked(null);
          busy.current = false;
        }, 600);
      }, 720);
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
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-0 top-0 z-50 w-full"
      >
        <div className="glass border-b hairline">
          <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-8">
            <Link
              href="/"
              onClick={logoClick}
              aria-label="Aanan Munna, home"
              className="hover-target group flex items-center"
            >
              <img
                src="/favicon.svg"
                alt=""
                width={38}
                height={38}
                className="h-[38px] w-[38px] rounded-[10px] shadow-[0_4px_14px_-4px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105"
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
                      className={`hover-target group relative px-3.5 py-2 text-[13.5px] font-medium tracking-tight transition-colors duration-300 ${
                        active ? "text-fg" : "text-muted hover:text-fg"
                      }`}
                    >
                      {n.title}
                      <span
                        className={`absolute inset-x-3.5 -bottom-0.5 h-[2px] origin-left rounded-full bg-accent transition-transform duration-300 ${
                          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
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
        </div>
      </motion.nav>

      {/* ===================== FLOATING DOCK ===================== */}
      <AnimatePresence>
        {showDock && !hideDock && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="pointer-events-none fixed bottom-5 left-1/2 z-50 max-w-[calc(100vw-1rem)] -translate-x-1/2"
          >
            <div
              className="pointer-events-auto relative flex items-center gap-0.5 rounded-2xl border px-1.5 py-1.5 shadow-2xl backdrop-blur-xl"
              style={{ background: "var(--dock-bg)", borderColor: "var(--line)" }}
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
                    className="hover-target relative flex h-10 w-10 items-center justify-center rounded-xl sm:h-12 sm:w-12"
                  >
                    <motion.span
                      className="absolute inset-0 rounded-xl bg-white"
                      initial={false}
                      animate={{
                        opacity: active ? 0.1 : hovered ? 0.06 : 0,
                        scale: active || hovered ? 1 : 0.9,
                      }}
                      transition={{ duration: 0.2 }}
                    />
                    <motion.span
                      animate={{ y: active ? -1 : 0, scale: active ? 1.1 : hovered ? 1.08 : 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="relative z-10"
                    >
                      <Icon
                        size={19}
                        strokeWidth={active ? 2.2 : 1.8}
                        className={`transition-colors duration-200 ${
                          active ? "text-accent" : hovered ? "text-fg" : "text-muted"
                        }`}
                      />
                    </motion.span>
                    {active && (
                      <motion.span
                        layoutId="dock-dot"
                        className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-accent"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    <AnimatePresence>
                      {hovered && (
                        <motion.span
                          initial={{ opacity: 0, y: 8, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-fg px-2.5 py-1 text-[11px] font-medium text-bg shadow-lg"
                        >
                          {n.short}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                );
              })}
              <span className="mx-1 h-6 w-px bg-white/10" />
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                className="hover-target flex h-10 w-10 items-center justify-center rounded-xl text-muted transition-colors hover:text-fg sm:h-12 sm:w-12"
              >
                <Menu size={18} />
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
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] flex flex-col justify-center overflow-hidden bg-bg/95 backdrop-blur-2xl"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--line)_1px,transparent_1px),linear-gradient(to_bottom,var(--line)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-40" />

            {!clicked && (
              <>
                <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-6 sm:px-10">
                  <span className="eyebrow">Navigation</span>
                  <button
                    onClick={() => setMenuOpen(false)}
                    aria-label="Close menu"
                    className="hover-target pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-all duration-300 hover:rotate-90 hover:bg-white/15"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div
                  className="relative z-20 h-full w-full overflow-y-auto px-5 pb-24 pt-24 sm:px-12 sm:pt-28 md:px-20"
                  data-lenis-prevent="true"
                >
                  <div className="mx-auto flex max-w-4xl flex-col">
                    {navItems.map((n, i) => {
                      const Icon = n.icon;
                      const active = activeSection === n.id;
                      return (
                        <motion.button
                          key={n.id}
                          initial={{ opacity: 0, y: 40 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                          onMouseEnter={() => setHoveredRow(n.id)}
                          onMouseLeave={() => setHoveredRow(null)}
                          onClick={() => go(n)}
                          className="hover-target group relative flex items-center justify-between border-b hairline py-4 text-left sm:py-5"
                        >
                          <div className="flex items-baseline gap-5 sm:gap-10">
                            <span className="font-mono text-xs tabular-nums text-muted">
                              0{i + 1}
                            </span>
                            <span
                              className={`text-[2rem] font-semibold tracking-tight transition-all duration-500 group-hover:translate-x-3 sm:text-5xl md:text-6xl ${
                                active || hoveredRow === n.id ? "text-fg" : "text-fg/40"
                              }`}
                            >
                              {n.title}
                            </span>
                          </div>
                          <div className="flex -translate-x-4 items-center gap-4 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100">
                            <Icon size={26} strokeWidth={1.5} className="hidden text-muted sm:block" />
                            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white">
                              <ArrowRight size={17} />
                            </span>
                          </div>
                        </motion.button>
                      );
                    })}
                    <a
                      href={RESUME}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover-target mt-8 inline-flex w-fit items-center gap-2 text-sm font-medium text-accent"
                    >
                      Download resume <ArrowRight size={15} />
                    </a>
                  </div>
                </div>
              </>
            )}

            {clicked && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-bg"
              >
                <div className="hero-ambient absolute inset-0" />
                <motion.div
                  initial={{ opacity: 0, y: 24, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.15, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="relative z-10 flex flex-col items-center"
                >
                  <span className="mb-7 flex h-20 w-20 items-center justify-center rounded-full border hairline bg-white/5">
                    <clicked.icon size={34} strokeWidth={1.5} className="text-accent" />
                  </span>
                  <h2 className="px-6 text-center text-5xl font-semibold tracking-tight text-fg sm:text-7xl">
                    {clicked.title}
                  </h2>
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-7 h-[2px] w-16 origin-center rounded-full bg-accent sm:w-24"
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
