'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, User, Code2, Briefcase, FolderGit2, Mail, ArrowRight, X } from 'lucide-react';

const sections = [
  { id: 'home', title: 'Start', icon: Home, target: 'body', color: 'from-blue-500/20 to-purple-500/20' },
  { id: 'about', title: 'About', icon: User, target: '#about', color: 'from-emerald-500/20 to-teal-500/20' },
  { id: 'skills', title: 'Capabilities', icon: Code2, target: '#skills', color: 'from-pink-500/20 to-rose-500/20' },
  { id: 'experience', title: 'Timeline', icon: Briefcase, target: '#experience', color: 'from-indigo-500/20 to-cyan-500/20' },
  { id: 'work', title: 'Selected Works', icon: FolderGit2, target: '#work', color: 'from-amber-500/20 to-yellow-500/20' },
  { id: 'contact', title: "LET'S TALK", icon: Mail, target: '#contact', color: 'from-green-500/20 to-emerald-500/20' },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [clickedSection, setClickedSection] = useState<typeof sections[0] | null>(null);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [fromDesktop, setFromDesktop] = useState(false); // new flag

  // Detect scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const scrollTo = (target: string) => {
    setIsMenuOpen(false);
    setFromDesktop(false);
    setTimeout(() => {
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.scrollTo(target, {
          duration: 2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      } else {
        document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
  };

  const handleCardClick = (section: typeof sections[0]) => {
    setClickedSection(section);
    setTimeout(() => {
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.scrollTo(section.target, { immediate: true });
      } else {
        const el = document.querySelector(section.target);
        if (el) el.scrollIntoView({ behavior: 'auto' });
      }
      setIsMenuOpen(false);
      setFromDesktop(false);
      setTimeout(() => setClickedSection(null), 500);
    }, 700);
  };

  // Desktop click → directly expand (no full menu list)
  const handleDesktopClick = (section: typeof sections[0]) => {
    setFromDesktop(true);
    setClickedSection(section);
    setIsMenuOpen(true);

    setTimeout(() => {
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.scrollTo(section.target, { immediate: true });
      } else {
        const el = document.querySelector(section.target);
        if (el) el.scrollIntoView({ behavior: 'auto' });
      }
      setIsMenuOpen(false);
      setFromDesktop(false);
      setTimeout(() => setClickedSection(null), 500);
    }, 700);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen && !clickedSection) {
        setIsMenuOpen(false);
        setFromDesktop(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen, clickedSection]);

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full p-4 sm:p-6 lg:px-10 lg:py-6 flex justify-between items-center z-50 mix-blend-difference pointer-events-none transition-all duration-500">
        
        {/* Logo */}
        <div
          onClick={() => scrollTo('body')}
          className="font-display font-semibold tracking-tight text-white hover-target cursor-pointer shrink-0 pointer-events-auto transition-all duration-500"
        >
          {scrolled ? (
            <span className="text-xl tracking-tighter uppercase font-bold">
              A<span className="text-accent">.</span>M<span className="text-accent">.</span>
            </span>
          ) : (
            <span className="text-lg">AananMunna</span>
          )}
        </div>

        {/* Desktop Links + Resume */}
        <div
          className={`hidden lg:flex items-center gap-1 pointer-events-auto transition-all duration-500 ${
            scrolled ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 scale-100'
          }`}
        >
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleDesktopClick(section)}
              className="group relative px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/70 hover:text-white transition-colors duration-300 hover-target"
            >
              {section.title}
              <span className="absolute bottom-1 left-4 right-4 h-px origin-left scale-x-0 bg-white/80 transition-transform duration-300 group-hover:scale-x-100" />
            </button>
          ))}

          <a
            href="https://drive.google.com/file/d/16EQTbsNKgqJtd5NTvhQKBQwdajvfPtOT/view?usp=sharing"
            target='_blank'
            download
            className="ml-6 px-4 py-2 border border-accent/80 text-accent text-[11px] font-mono uppercase tracking-[0.15em] rounded-sm hover:bg-accent hover:text-black transition-all duration-300 hover-target flex items-center gap-2"
          >
            Resume
          </a>
        </div>

        {/* Hamburger - absolute so it doesn't affect layout */}
        <button
          onClick={() => {
            setFromDesktop(false);
            setIsMenuOpen(true);
          }}
          className={`absolute right-4 sm:right-6 lg:right-10 pointer-events-auto flex items-center gap-3 group hover-target transition-all duration-500 ${
            scrolled ? 'opacity-100 scale-100' : 'lg:opacity-0 lg:pointer-events-none lg:scale-95'
          }`}
        >
          <span className="font-mono text-[10px] uppercase tracking-widest hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Menu
          </span>
          <div className="w-12 h-12 rounded-full border border-white/20 flex flex-col items-center justify-center gap-1.5 bg-bg/10 backdrop-blur-sm group-hover:bg-white/10 transition-colors">
            <div className="w-5 h-[2px] bg-white group-hover:w-6 transition-all duration-300" />
            <div className="w-5 h-[2px] bg-white group-hover:w-4 transition-all duration-300" />
          </div>
        </button>
      </nav>

      {/* Full Screen Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(24px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] bg-bg/95 flex flex-col justify-center overflow-hidden"
          >
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />

            <div className="absolute inset-0 z-0 transition-opacity duration-700 pointer-events-none">
              {sections.map((s) => (
                <div
                  key={`bg-${s.id}`}
                  className={`absolute inset-0 bg-gradient-to-br ${s.color} transition-opacity duration-700 ${
                    hoveredSection === s.id ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
            </div>

            {/* Header - hide when coming from desktop or when expanded */}
            {!fromDesktop && (
              <motion.div
                animate={{ opacity: clickedSection ? 0 : 1 }}
                className="absolute top-0 left-0 w-full p-4 sm:p-8 flex justify-between items-center z-30 pointer-events-none"
              >
                <div className="font-display font-bold text-xl tracking-tighter uppercase text-white/50">
                  Navigation
                </div>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setFromDesktop(false);
                  }}
                  className="pointer-events-auto w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-white/5 hover:bg-white/20 hover:rotate-90 transition-all duration-300 hover-target text-white"
                >
                  <X size={20} />
                </button>
              </motion.div>
            )}

            {/* List - only show when NOT from desktop */}
            {!fromDesktop && (
              <div
                className="w-full h-full overflow-y-auto pb-32 pt-24 sm:pt-32 px-6 sm:px-16 hide-scrollbar relative z-20 pointer-events-auto"
                data-lenis-prevent="true"
              >
                <div className="flex flex-col max-w-6xl w-full mx-auto min-h-min">
                  {sections.map((section, index) => {
                    const Icon = section.icon;
                    if (clickedSection?.id === section.id) {
                      return (
                        <div
                          key={`placeholder-${section.id}`}
                          className="py-6 sm:py-8 border-b border-transparent opacity-0"
                        />
                      );
                    }
                    return (
                      <motion.div
                        layoutId={`card-${section.id}`}
                        key={section.id}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.05,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        onMouseEnter={() => setHoveredSection(section.id)}
                        onMouseLeave={() => setHoveredSection(null)}
                        onClick={() => handleCardClick(section)}
                        className="group relative flex items-center justify-between py-4 sm:py-8 border-b border-white/10 cursor-pointer hover-target"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                        <div className="flex items-center gap-6 sm:gap-12">
                          <span className="font-mono text-sm sm:text-base text-white/30 group-hover:text-white/80 transition-colors duration-300">
                            0{index + 1}
                          </span>
                          <h3 className="font-display text-4xl sm:text-6xl md:text-8xl uppercase font-bold tracking-tighter text-white/40 group-hover:text-white transition-all duration-500 group-hover:translate-x-4 sm:group-hover:translate-x-8">
                            {section.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-8 opacity-0 group-hover:opacity-100 -translate-x-8 group-hover:translate-x-0 transition-all duration-500">
                          <Icon size={32} className="text-white/50 hidden sm:block" />
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/20 flex items-center justify-center bg-white/10 text-white">
                            <ArrowRight size={20} className="-rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer hints */}
            {!fromDesktop && (
              <motion.div
                animate={{ opacity: clickedSection ? 0 : 1 }}
                className="absolute bottom-8 left-0 w-full text-center pointer-events-none z-10"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/30">
                  Hover to preview • Click to navigate • Press ESC to close
                </p>
              </motion.div>
            )}

            {/* Expanded Overlay */}
            {clickedSection && (
              <motion.div
                layoutId={fromDesktop ? undefined : `card-${clickedSection.id}`}
                initial={fromDesktop ? { opacity: 0, scale: 0.95 } : false}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed inset-0 z-[200] bg-bg flex flex-col items-center justify-center overflow-hidden"
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${clickedSection.color} opacity-20`} />
                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none mix-blend-overlay" />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                  className="relative z-10 flex flex-col items-center"
                >
                  {(() => {
                    const Icon = clickedSection.icon;
                    return <Icon size={64} className="text-white/50 mb-8" />;
                  })()}
                  <h2 className="font-display text-5xl sm:text-7xl uppercase font-bold tracking-tighter text-white">
                    {clickedSection.title}
                  </h2>
                  <div className="h-[2px] w-24 bg-white mt-8" />
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}