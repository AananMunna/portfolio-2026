"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";
import {
  FileCode2,
  Paintbrush,
  Zap,
  Blocks,
  Server,
  Database,
  ArrowRight,
  CheckCircle2,
  Heart,
  RefreshCw,
  Pause,
  Play,
} from "lucide-react";

const steps = [
  {
    id: 0,
    name: "The Skeleton",
    tech: "HTML",
    icon: FileCode2,
    color: "text-accent",
    bgColor: "",
    borderColor: "border-accent",
    desc: "The raw foundation. It tells the browser what the content is (text, images, buttons), but has absolutely no sense of design or layout.",
  },
  {
    id: 1,
    name: "The Paint",
    tech: "CSS / Tailwind",
    icon: Paintbrush,
    color: "text-accent",
    bgColor: "",
    borderColor: "border-accent",
    desc: "The interior design. It adds colors, spacing, typography, and layout to make the raw structure visually appealing and readable.",
  },
  {
    id: 2,
    name: "The Muscle",
    tech: "JavaScript",
    icon: Zap,
    color: "text-accent",
    bgColor: "",
    borderColor: "border-accent",
    desc: "The interactivity. It makes the static page alive—allowing buttons to be clicked, numbers to change, and logic to run without reloading the page.",
  },
  {
    id: 3,
    name: "The Factory",
    tech: "React & Next.js",
    icon: Blocks,
    color: "text-accent",
    bgColor: "",
    borderColor: "border-accent",
    desc: "My core expertise. I build complex, interactive UIs using reusable components for blazing-fast performance and seamless UX.",
  },
  {
    id: 4,
    name: "The Brain",
    tech: "Backend (Express)",
    icon: Server,
    color: "text-accent",
    bgColor: "",
    borderColor: "border-accent",
    desc: "The backbone. I build secure Node/Express APIs to process requests and serve the frontend exactly what it needs.",
  },
  {
    id: 5,
    name: "The Vault",
    tech: "Database (MongoDB)",
    icon: Database,
    color: "text-accent",
    bgColor: "",
    borderColor: "border-accent",
    desc: "The permanent memory. Using MongoDB to safely store and retrieve data, completing the full MERN stack picture.",
  },
];

const AUTO_PLAY_INTERVAL = 2500;

export default function Skills() {
  const containerRef = useRef<HTMLDivElement>(null);
  // FIX: use `amount` instead of `margin` to avoid non-static position warning
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });

  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [likes, setLikes] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [dbSynced, setDbSynced] = useState(false);
  const [isPinging, setIsPinging] = useState(false);

  // Toast — hover keeps it alive
  const [toastVisible, setToastVisible] = useState(false);
  const [toastStep, setToastStep] = useState(0);
  const [toastHovered, setToastHovered] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (step: number) => {
    setToastStep(step);
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      if (!toastHovered) setToastVisible(false);
    }, 2800);
  };

  const handleToastMouseEnter = () => {
    setToastHovered(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  };

  const handleToastMouseLeave = () => {
    setToastHovered(false);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 500);
  };

  useEffect(() => {
    if (activeStep < 2) {
      setLikes(0);
      setIsFollowing(false);
    }
    if (activeStep < 5) setDbSynced(false);
  }, [activeStep]);

  const startAutoPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveStep((prev) => (prev >= steps.length - 1 ? 0 : prev + 1));
    }, AUTO_PLAY_INTERVAL);
  }, []);

  const stopAutoPlay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isInView && isPlaying) startAutoPlay();
    return () => stopAutoPlay();
  }, [isInView, isPlaying, startAutoPlay, stopAutoPlay]);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    setIsPlaying(false);
    stopAutoPlay();
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      stopAutoPlay();
    } else {
      setIsPlaying(true);
      startAutoPlay();
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setIsPlaying(true);
    startAutoPlay();
  };

  const handleInteraction = (type: "like" | "follow") => {
    if (activeStep < 2) {
      showToast(activeStep);
      return;
    }
    if (type === "like") setLikes((l) => l + 1);
    if (type === "follow") setIsFollowing((f) => !f);
    if (activeStep >= 4) {
      setIsPinging(true);
      setTimeout(() => setIsPinging(false), 1000);
    }
    if (activeStep === 5) {
      setDbSynced(false);
      setTimeout(() => setDbSynced(true), 1000);
    }
  };

  // ─── Preview card ──────────────────────────────────────────────────────────
  const renderClientUI = () => {
    if (activeStep === 0) {
      return (
        <div
          className="w-full h-full bg-white text-black flex flex-col"
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          <div style={{ padding: "14px", overflowY: "auto", flex: 1 }}>
            <h1
              style={{
                fontSize: "1.3em",
                fontWeight: "bold",
                margin: "0.3em 0",
              }}
            >
              User Profile
            </h1>
            <img
              src="https://picsum.photos/seed/aanan/150/150"
              alt="Avatar"
              style={{ width: "60px", height: "60px" }}
            />
            <h2
              style={{
                fontSize: "1.05em",
                fontWeight: "bold",
                margin: "0.3em 0",
              }}
            >
              AANAN
            </h2>
            <p style={{ margin: "0.3em 0", fontSize: "0.78em" }}>
              Frontend Specialist | MERN
            </p>
            <p style={{ margin: "0.3em 0", fontSize: "0.78em" }}>
              Crafting pixel-perfect UIs, powered by robust backends.
            </p>
            <ul
              style={{
                paddingInlineStart: "18px",
                margin: "0.3em 0",
                fontSize: "0.78em",
              }}
            >
              <li>Status: Online</li>
              <li>Followers: {isFollowing ? 1025 : 1024}</li>
              <li>Likes: {likes}</li>
            </ul>
          </div>
          {/* Sticky buttons — always visible */}
          <div
            style={{
              borderTop: "1px solid #ccc",
              padding: "8px 14px",
              display: "flex",
              gap: "8px",
              background: "#fff",
              flexShrink: 0,
            }}
          >
            <button
              style={{
                padding: "3px 10px",
                fontSize: "0.78em",
                cursor: "pointer",
              }}
              onClick={() => handleInteraction("follow")}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
            <button
              style={{
                padding: "3px 10px",
                fontSize: "0.78em",
                cursor: "pointer",
              }}
              onClick={() => handleInteraction("like")}
            >
              Like
            </button>
          </div>
        </div>
      );
    }

    // FIX: only attach whileHover/whileTap to motion elements, never to plain DOM
    const isReact = activeStep >= 3;

    return (
      <div className="w-full h-full bg-[#111] rounded-2xl p-5 flex flex-col gap-4 text-white relative overflow-hidden">
        {isReact && (
          <div className="absolute inset-0 pointer-events-none z-50 p-2 opacity-20">
            <div className="border border-dashed border-accent rounded-xl w-full h-full relative">
              <span className="absolute -top-3 left-2 bg-[#111] text-accent text-[10px] font-mono px-1">
                &lt;ProfileCard /&gt;
              </span>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 relative z-10">
          <div className="relative">
            <img
              src="https://picsum.photos/seed/aanan/150/150"
              alt="Avatar"
              className="w-13 h-13 rounded-full border-2 border-white/10 object-cover"
              style={{ width: 52, height: 52 }}
            />
            {isReact && (
              <div className="absolute -inset-1 border border-dashed border-accent rounded-full opacity-25 pointer-events-none" />
            )}
          </div>
          <div>
            <h3 className="font-display text-base font-bold flex items-center gap-1.5">
              AANAN{" "}
              {dbSynced && <CheckCircle2 className="w-3.5 h-3.5 text-accent" />}
            </h3>
            <p className="text-muted text-xs font-mono">
              Frontend Specialist | MERN
            </p>
          </div>
        </div>
        <p className="text-gray-300 text-xs leading-relaxed relative z-10">
          Crafting pixel-perfect UIs, powered by robust backends.
        </p>
        <div className="flex gap-4 text-xs font-mono text-muted relative z-10">
          <div>
            <span className="text-white font-bold">
              {isFollowing ? "1,025" : "1,024"}
            </span>{" "}
            Followers
          </div>
          <div>
            <span className="text-white font-bold">{likes}</span> Likes
          </div>
        </div>
        <div className="flex gap-2 mt-auto relative z-10">
          {isReact ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleInteraction("follow")}
              className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 relative ${isFollowing ? "bg-white/10 text-white" : "bg-accent text-bg"}`}
            >
              {isFollowing && <CheckCircle2 className="w-3 h-3" />}
              {isFollowing ? "Following" : "Follow"}
              <div className="absolute -inset-1 border border-dashed border-accent rounded-lg opacity-20 pointer-events-none" />
            </motion.button>
          ) : (
            <button
              onClick={() => handleInteraction("follow")}
              className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors ${isFollowing ? "bg-white/10 text-white" : "bg-accent text-bg"}`}
            >
              {isFollowing && <CheckCircle2 className="w-3 h-3" />}
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}
          {isReact ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleInteraction("like")}
              className="px-3 py-2 rounded-lg text-xs bg-white/5 hover:bg-white/10 transition-colors flex items-center border border-white/5 relative"
            >
              <Heart
                className={`w-3.5 h-3.5 ${likes > 0 ? "fill-red-500 text-red-500" : ""}`}
              />
              <div className="absolute -inset-1 border border-dashed border-accent rounded-lg opacity-20 pointer-events-none" />
            </motion.button>
          ) : (
            <button
              onClick={() => handleInteraction("like")}
              className="px-3 py-2 rounded-lg text-xs bg-white/5 hover:bg-white/10 transition-colors flex items-center border border-white/5"
            >
              <Heart
                className={`w-3.5 h-3.5 ${likes > 0 ? "fill-red-500 text-red-500" : ""}`}
              />
            </button>
          )}
        </div>
      </div>
    );
  };

  // ─── JSX ───────────────────────────────────────────────────────────────────
  return (
    <>
      <section
        className="py-24 sm:py-32 px-4 sm:px-8 max-w-7xl mx-auto relative z-20 bg-bg"
        id="skills"
        ref={containerRef}
      >
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="font-display text-4xl sm:text-5xl uppercase font-bold tracking-tighter mb-4"
          >
            Mastering The <span className="text-accent italic">Stack</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
            className="text-muted font-mono text-sm uppercase tracking-widest"
          >
            Every great product has layers. I know all of them.
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start relative">
          {/* ── Left: Steps ── */}
          <div className="lg:w-5/12 flex flex-col gap-3 w-full order-2 lg:order-1">
            {steps.map((step, index) => {
              const isActive = activeStep === index;
              const isPassed = activeStep > index;
              const Icon = step.icon;
              return (
                <motion.button
                  key={step.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    duration: 0.35,
                    delay: index * 0.06,
                    ease: "easeOut",
                  }}
                  onClick={() => handleStepClick(index)}
                  className={`text-left p-4 rounded-2xl border transition-colors duration-200 relative overflow-hidden
                    ${
                      isActive
                        ? `bg-[#111] ${step.borderColor}`
                        : isPassed
                          ? "bg-white/5 border-white/5 hover:bg-white/10"
                          : "bg-transparent border-transparent opacity-40 hover:opacity-80"
                    }`}
                >
                  {/* Progress bar */}
                  {isActive && isPlaying && (
                    <motion.div
                      key={`pb-${activeStep}`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{
                        duration: AUTO_PLAY_INTERVAL / 1000,
                        ease: "linear",
                      }}
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent origin-left"
                    />
                  )}

                  <div className="flex items-start gap-3 relative z-10">
                    <div
                      className={`p-2.5 rounded-xl ${isActive ? step.bgColor : "bg-white/5"}`}
                    >
                      <Icon
                        className={`w-5 h-5 ${isActive ? step.color : "text-muted"}`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3
                          className={`font-bold text-base ${isActive ? "text-white" : "text-gray-400"}`}
                        >
                          {step.name}
                        </h3>
                        <span
                          className={`text-xs font-mono px-2 py-0.5 rounded-full ${isActive ? `${step.bgColor} ${step.color}` : "bg-white/5 text-muted"}`}
                        >
                          {step.tech}
                        </span>
                      </div>
                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.p
                            key="desc"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.22, ease: "easeInOut" }}
                            className="text-xs text-gray-400 leading-relaxed overflow-hidden mt-1.5"
                          >
                            {step.desc}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* FIX: no layoutId — avoids cross-item layout recalculation that caused page jank */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-l-2xl" />
                  )}
                </motion.button>
              );
            })}

            <div className="flex justify-between items-center mt-2 px-1">
              <button
                onClick={handleReset}
                className="text-xs font-mono text-muted hover:text-white transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="text-xs font-mono text-muted hover:text-white transition-colors flex items-center gap-1.5"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3 h-3" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" /> Auto-play
                    </>
                  )}
                </button>
                {activeStep < steps.length - 1 && (
                  <button
                    onClick={() => handleStepClick(activeStep + 1)}
                    className="text-xs font-mono text-bg bg-white px-4 py-2 rounded-full font-bold hover:bg-accent transition-colors flex items-center gap-1.5"
                  >
                    Next Layer <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Right: Visualization ── */}
          <div className="lg:w-7/12 w-full h-[380px] min-[400px]:h-[420px] sm:h-[500px] lg:h-[650px] sticky top-20 lg:top-24 z-40 order-1 lg:order-2 rounded-3xl border border-white/10 bg-[#050505] overflow-hidden shadow-2xl flex items-center justify-center">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] flex items-center justify-center gap-8 scale-[0.4] min-[400px]:scale-[0.45] sm:scale-[0.6] md:scale-[0.8] lg:scale-100">
              {/* FIX: plain div instead of motion.div layout — eliminates page-wide layout recalc jank */}
              <div
                className={`relative z-20 flex-shrink-0 transition-all duration-500 ease-in-out ${activeStep >= 4 ? "w-[280px] h-[380px]" : "w-[340px] h-[460px]"}`}
              >
                <div className="absolute -top-7 left-0 text-xs font-mono text-muted flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  Browser (Frontend)
                </div>
                <div className="w-full h-full bg-white/5 rounded-2xl p-1 border border-white/10 shadow-2xl">
                  <div className="w-full h-full rounded-xl overflow-hidden bg-white">
                    {renderClientUI()}
                  </div>
                </div>
              </div>

              {/* Server */}
              <AnimatePresence>
                {activeStep >= 4 && (
                  <motion.div
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    className="relative z-20 w-[180px] h-[240px] flex-shrink-0 flex flex-col items-center justify-center"
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-mono text-muted flex items-center gap-2 whitespace-nowrap">
                      <div className="w-2 h-2 rounded-full bg-accent" /> Server
                      (Backend)
                    </div>
                    <div
                      className={`w-full h-full bg-[#111] rounded-2xl border-2 flex flex-col items-center justify-center gap-4 transition-colors duration-300 ${isPinging ? "border-accent" : "border-white/10"}`}
                    >
                      <Server
                        className={`w-12 h-12 transition-colors duration-300 ${isPinging ? "text-accent" : "text-muted"}`}
                      />
                      <div className="text-xs font-mono text-center text-muted">
                        Express.js
                        <br />
                        API Gateway
                      </div>
                      <AnimatePresence>
                        {isPinging && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="text-[10px] font-mono text-accent bg-green-400/10 px-2 py-1 rounded"
                          >
                            200 OK
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="absolute top-1/2 -left-8 w-8 h-px bg-white/10 -translate-y-1/2 overflow-visible">
                      <AnimatePresence>
                        {isPinging && (
                          <motion.div
                            initial={{ left: 0, opacity: 1 }}
                            animate={{ left: "100%", opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-accent rounded-full"
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Database */}
              <AnimatePresence>
                {activeStep >= 5 && (
                  <motion.div
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    className="relative z-20 w-[140px] h-[180px] flex-shrink-0 flex flex-col items-center justify-center"
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-mono text-muted flex items-center gap-2 whitespace-nowrap">
                      <div className="w-2 h-2 rounded-full bg-accent" />{" "}
                      Database
                    </div>
                    <div
                      className={`w-full h-full bg-[#111] rounded-2xl border-2 flex flex-col items-center justify-center gap-4 transition-colors duration-300 ${dbSynced ? "border-accent" : "border-white/10"}`}
                    >
                      <Database
                        className={`w-10 h-10 transition-colors duration-300 ${dbSynced ? "text-accent" : "text-muted"}`}
                      />
                      <div className="text-xs font-mono text-center text-muted">
                        MongoDB
                        <br />
                        Storage
                      </div>
                    </div>
                    <div className="absolute top-1/2 -left-8 w-8 h-px bg-white/10 -translate-y-1/2 overflow-visible">
                      <AnimatePresence>
                        {isPinging && (
                          <motion.div
                            initial={{ left: 0, opacity: 1 }}
                            animate={{ left: "100%", opacity: 0 }}
                            transition={{ duration: 0.4, delay: 0.12 }}
                            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-accent rounded-full"
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom hint */}
            <div className="absolute bottom-4 lg:bottom-5 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-xs font-mono text-white text-center w-[90%] max-w-sm z-30">
              {activeStep === 0 &&
                "Look at the raw HTML. Try clicking the buttons."}
              {activeStep === 1 &&
                "CSS added! It looks good, but buttons still don't work."}
              {activeStep === 2 &&
                "JS added! Click 'Follow' or 'Like' to see it work."}
              {activeStep === 3 &&
                "React added! Notice the component boundaries and hover effects."}
              {activeStep === 4 &&
                "Backend added! Click a button to see the network request."}
              {activeStep === 5 &&
                "Database added! Data is now permanently saved. You're full-stack!"}
            </div>
          </div>
        </div>
      </section>

      {/* ── Toast Popup ── */}
      <AnimatePresence>
        {toastVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onMouseEnter={handleToastMouseEnter}
            onMouseLeave={handleToastMouseLeave}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 bg-[#161616] border border-white/10 rounded-2xl px-5 py-4 shadow-2xl max-w-sm w-[90vw] cursor-default overflow-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              {toastStep === 0 ? (
                <FileCode2 className="w-5 h-5 text-accent" />
              ) : (
                <Paintbrush className="w-5 h-5 text-accent" />
              )}
            </div>
            <div>
              <p className="text-white text-sm font-bold font-mono">
                No JavaScript yet!
              </p>
              <p className="text-muted text-xs mt-0.5 leading-relaxed">
                {toastStep === 0
                  ? "This is raw HTML — buttons exist but can't do anything."
                  : "CSS makes it pretty, but interactivity needs JS. Keep going →"}
              </p>
            </div>
            {/* Progress drain — pauses when hovered */}
            {!toastHovered && (
              <motion.div
                key={`bar-${toastVisible}`}
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 2.8, ease: "linear" }}
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent origin-left"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
