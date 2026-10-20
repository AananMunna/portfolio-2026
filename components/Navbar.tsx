"use client";
import { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "motion/react";
import {
  Home,
  User,
  Code2,
  Briefcase,
  FolderGit2,
  Mail,
  ArrowRight,
  X,
  Menu,
} from "lucide-react";

const sections = [
  {
    id: "home",
    title: "Start",
    short: "Home",
    icon: Home,
    target: "body",
    color: "from-blue-500/25 to-violet-500/25",
    accent: "bg-blue-400",
  },
  {
    id: "about",
    title: "About",
    short: "About",
    icon: User,
    target: "#about",
    color: "from-emerald-500/25 to-teal-500/25",
    accent: "bg-emerald-400",
  },
  {
    id: "skills",
    title: "Capabilities",
    short: "Skills",
    icon: Code2,
    target: "#skills",
    color: "from-pink-500/25 to-rose-500/25",
    accent: "bg-pink-400",
  },
  {
    id: "experience",
    title: "Timeline",
    short: "Work",
    icon: Briefcase,
    target: "#experience",
    color: "from-indigo-500/25 to-cyan-500/25",
    accent: "bg-indigo-400",
  },
  {
    id: "work",
    title: "Selected Works",
    short: "Works",
    icon: FolderGit2,
    target: "#work",
    color: "from-amber-500/25 to-yellow-500/25",
    accent: "bg-amber-400",
  },
  {
    id: "contact",
    title: "LET'S TALK",
    short: "Talk",
    icon: Mail,
    target: "#contact",
    color: "from-green-500/25 to-emerald-500/25",
    accent: "bg-green-400",
  },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [clickedSection, setClickedSection] = useState<
    (typeof sections)[0] | null
  >(null);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [fromDesktop, setFromDesktop] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isHoveringDock, setIsHoveringDock] = useState(false);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Active section observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id || "home");
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 },
    );

    ["about", "skills", "experience", "work", "contact"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const checkHome = () => {
      if (window.scrollY < 180) setActiveSection("home");
    };
    window.addEventListener("scroll", checkHome, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", checkHome);
    };
  }, []);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen && !clickedSection) {
        setIsMenuOpen(false);
        setFromDesktop(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMenuOpen, clickedSection]);

  const scrollTo = (target: string) => {
    setIsMenuOpen(false);
    setFromDesktop(false);
    setTimeout(() => {
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.scrollTo(target, {
          duration: 1.9,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      } else {
        document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
      }
    }, 280);
  };

  const handleCardClick = (section: (typeof sections)[0]) => {
    setClickedSection(section);
    setTimeout(() => {
      const lenis = (window as any).lenis;
      if (lenis) lenis.scrollTo(section.target, { immediate: true });
      else
        document
          .querySelector(section.target)
          ?.scrollIntoView({ behavior: "auto" });
      setIsMenuOpen(false);
      setFromDesktop(false);
      setTimeout(() => setClickedSection(null), 550);
    }, 720);
  };

  const handleDesktopClick = (section: (typeof sections)[0]) => {
    setFromDesktop(true);
    setClickedSection(section);
    setIsMenuOpen(true);

    setTimeout(() => {
      const lenis = (window as any).lenis;
      if (lenis) lenis.scrollTo(section.target, { immediate: true });
      else
        document
          .querySelector(section.target)
          ?.scrollIntoView({ behavior: "auto" });
      setIsMenuOpen(false);
      setFromDesktop(false);
      setTimeout(() => setClickedSection(null), 550);
    }, 720);
  };

  return (
    <>
      {/* ===================== TOP NAVBAR ===================== */}
      <motion.nav
        initial={false}
        animate={{
          y: scrolled ? -100 : 0,
          opacity: scrolled ? 0 : 1,
        }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 w-full z-50 pointer-events-none mix-blend-difference"
      >
        <div className="flex items-center justify-between px-5 sm:px-8 lg:px-12 py-5 lg:py-7">
          {/* Logo */}
          <button
            onClick={() => scrollTo("body")}
            className="pointer-events-auto font-display font-semibold tracking-tight text-white text-[17px] sm:text-lg hover-target"
          >
            AananMunna
          </button>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-0.5 pointer-events-auto">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => handleDesktopClick(s)}
                className="group relative px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-white/65 hover:text-white transition-colors duration-300 hover-target"
              >
                {s.title}
                <span className="absolute bottom-1.5 left-4 right-4 h-px origin-left scale-x-0 bg-white/80 transition-transform duration-300 group-hover:scale-x-100" />
              </button>
            ))}

            <a
              href="https://drive.google.com/file/d/17lmURlHIjW8VCMQNHw-ddDGYOg_t6iGM/view"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-5 px-4 py-2 border border-accent/70 text-accent text-[11px] font-mono uppercase tracking-[0.16em] rounded-sm hover:bg-accent hover:text-black transition-all duration-300 hover-target"
            >
              Resume
            </a>
          </div>

          {/* Mobile hamburger (top only) */}
          <button
            onClick={() => {
              setFromDesktop(false);
              setIsMenuOpen(true);
            }}
            className="lg:hidden pointer-events-auto w-11 h-11 rounded-full border border-white/20 flex flex-col items-center justify-center gap-1.5 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-colors hover-target"
          >
            <span className="w-5 h-[1.5px] bg-white rounded-full" />
            <span className="w-3.5 h-[1.5px] bg-white rounded-full" />
          </button>
        </div>
      </motion.nav>

      {/* ===================== PREMIUM FLOATING DOCK ===================== */}
      <AnimatePresence>
        {scrolled && (
          <motion.div
            initial={{ y: 120, opacity: 0, scale: 0.92 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 120, opacity: 0, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-[520px] pointer-events-none"
          >
            <div
              className="pointer-events-auto relative"
              onMouseEnter={() => setIsHoveringDock(true)}
              onMouseLeave={() => setIsHoveringDock(false)}
            >
              {/* Ambient outer glow */}
              <div className="absolute -inset-3 rounded-[32px] bg-gradient-to-r from-white/5 via-accent/15 to-white/5 blur-xl opacity-70" />

              {/* Main glass pill */}
              <div className="relative flex items-center justify-between gap-0.5 sm:gap-1 px-2 sm:px-2.5 py-2 rounded-[26px] bg-black/55 backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.7)]">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;

                  return (
                    <button
                      key={section.id}
                      onClick={() => handleDesktopClick(section)}
                      className="relative flex flex-col items-center justify-center flex-1 min-w-0 h-[52px] sm:h-[56px] rounded-2xl group hover-target"
                    >
                      {/* Liquid active blob */}
                      {isActive && (
                        <motion.div
                          layoutId="dock-blob"
                          className="absolute inset-1 rounded-[18px] bg-white/[0.09] border border-white/[0.12]"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 32,
                          }}
                          style={{
                            boxShadow:
                              "inset 0 1px 0 rgba(255,255,255,0.12), 0 0 20px rgba(255,255,255,0.05)",
                          }}
                        />
                      )}

                      {/* Icon */}
                      <motion.div
                        animate={{
                          y: isActive ? -3 : 0,
                          scale: isActive ? 1.18 : 1,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 24,
                        }}
                        className="relative z-10"
                      >
                        <Icon
                          size={isActive ? 22 : 20}
                          strokeWidth={isActive ? 2.3 : 1.7}
                          className={`transition-colors duration-300 ${
                            isActive
                              ? "text-white"
                              : "text-white/45 group-hover:text-white/75"
                          }`}
                        />
                      </motion.div>

                      {/* Label – always visible on active, fades on others */}
                      <motion.span
                        animate={{
                          opacity: isActive ? 1 : 0,
                          y: isActive ? 0 : 4,
                        }}
                        className="absolute bottom-[3px] text-[8px] sm:text-[9px] font-mono uppercase tracking-[0.12em] text-white/70 whitespace-nowrap pointer-events-none"
                      >
                        {section.short}
                      </motion.span>
                    </button>
                  );
                })}

                {/* Divider */}
                <div className="w-px h-7 bg-white/10 mx-0.5 shrink-0" />

                {/* Full menu trigger */}
                <button
                  onClick={() => {
                    setFromDesktop(false);
                    setIsMenuOpen(true);
                  }}
                  className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl shrink-0 group hover-target"
                >
                  <Menu
                    size={18}
                    className="text-white/45 group-hover:text-white transition-colors duration-300"
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================== FULL SCREEN MENU ===================== */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] bg-bg/95 backdrop-blur-2xl flex flex-col justify-center overflow-hidden"
          >
            {/* Subtle grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />

            {/* Hover color wash */}
            <div className="absolute inset-0 pointer-events-none transition-opacity duration-700">
              {sections.map((s) => (
                <div
                  key={s.id}
                  className={`absolute inset-0 bg-gradient-to-br ${s.color} transition-opacity duration-700 ${
                    hoveredSection === s.id ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
            </div>

            {/* Header */}
            {!fromDesktop && (
              <motion.div
                animate={{ opacity: clickedSection ? 0 : 1 }}
                className="absolute top-0 inset-x-0 px-5 sm:px-10 py-6 flex justify-between items-center z-30 pointer-events-none"
              >
                <span className="font-display font-bold text-sm tracking-[0.25em] uppercase text-white/40">
                  Navigation
                </span>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setFromDesktop(false);
                  }}
                  className="pointer-events-auto w-12 h-12 rounded-full border border-white/15 flex items-center justify-center bg-white/5 hover:bg-white/15 hover:rotate-90 transition-all duration-400 hover-target text-white"
                >
                  <X size={18} />
                </button>
              </motion.div>
            )}

            {/* Section list */}
            {!fromDesktop && (
              <div
                className="relative z-20 w-full h-full overflow-y-auto pt-24 sm:pt-28 pb-28 px-5 sm:px-12 md:px-20 hide-scrollbar pointer-events-auto"
                data-lenis-prevent="true"
              >
                <div className="max-w-5xl mx-auto flex flex-col">
                  {sections.map((section, i) => {
                    const Icon = section.icon;
                    if (clickedSection?.id === section.id) {
                      return (
                        <div
                          key={section.id}
                          className="py-7 sm:py-9 opacity-0"
                        />
                      );
                    }

                    return (
                      <motion.button
                        layoutId={`card-${section.id}`}
                        key={section.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{
                          duration: 0.5,
                          delay: i * 0.04,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        onMouseEnter={() => setHoveredSection(section.id)}
                        onMouseLeave={() => setHoveredSection(null)}
                        onClick={() => handleCardClick(section)}
                        className="group relative flex items-center justify-between py-5 sm:py-7 md:py-8 border-b border-white/[0.07] text-left hover-target"
                      >
                        {/* Hover wash */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="flex items-center gap-5 sm:gap-10 md:gap-14">
                          <span className="font-mono text-xs sm:text-sm text-white/25 group-hover:text-white/60 transition-colors duration-300 tabular-nums">
                            0{i + 1}
                          </span>
                          <h3 className="font-display text-[2rem] sm:text-5xl md:text-6xl lg:text-7xl uppercase font-bold tracking-tighter text-white/35 group-hover:text-white transition-all duration-500 group-hover:translate-x-3 sm:group-hover:translate-x-6">
                            {section.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-5 opacity-0 group-hover:opacity-100 -translate-x-6 group-hover:translate-x-0 transition-all duration-500">
                          <Icon
                            size={28}
                            className="text-white/40 hidden sm:block"
                          />
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/15 flex items-center justify-center bg-white/5 text-white">
                            <ArrowRight
                              size={18}
                              className="-rotate-45 group-hover:rotate-0 transition-transform duration-500"
                            />
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer hint */}
            {!fromDesktop && (
              <motion.p
                animate={{ opacity: clickedSection ? 0 : 1 }}
                className="absolute bottom-7 inset-x-0 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-white/25 pointer-events-none z-10"
              >
                Hover • Click • ESC to close
              </motion.p>
            )}

            {/* ========== EXPANDED TRANSITION OVERLAY ========== */}
            {clickedSection && (
              <motion.div
                layoutId={fromDesktop ? undefined : `card-${clickedSection.id}`}
                initial={fromDesktop ? { opacity: 0, scale: 0.94 } : false}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed inset-0 z-[200] bg-bg flex flex-col items-center justify-center overflow-hidden"
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Color wash */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${clickedSection.color} opacity-30`}
                />

                {/* Scanline texture */}
                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.18)_50%)] bg-[length:100%_3px] pointer-events-none mix-blend-overlay opacity-40" />

                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: 0.22,
                    duration: 0.45,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="relative z-10 flex flex-col items-center"
                >
                  <div className="mb-8 sm:mb-10 p-5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                    {(() => {
                      const Icon = clickedSection.icon;
                      return (
                        <Icon
                          size={42}
                          strokeWidth={1.5}
                          className="text-white/70"
                        />
                      );
                    })()}
                  </div>

                  <h2 className="font-display text-4xl sm:text-6xl md:text-7xl uppercase font-bold tracking-tighter text-white text-center px-6">
                    {clickedSection.title}
                  </h2>

                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{
                      delay: 0.38,
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="h-[2px] w-16 sm:w-24 bg-white/80 mt-8 origin-center"
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
