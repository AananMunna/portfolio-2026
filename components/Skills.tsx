"use client";

import { useState, useRef, useEffect } from "react";
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

export default function Skills() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-10%" });
  const [activeStep, setActiveStep] = useState(0);

  // Interactive State
  const [likes, setLikes] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [dbSynced, setDbSynced] = useState(false);
  const [isPinging, setIsPinging] = useState(false);

  // Reset state when step changes
  useEffect(() => {
    if (activeStep < 2) {
      setLikes(0);
      setIsFollowing(false);
    }
    if (activeStep < 5) {
      setDbSynced(false);
    }
  }, [activeStep]);

  const handleInteraction = (type: "like" | "follow") => {
    if (activeStep < 2) {
      alert(
        "JavaScript is required for interactivity! Advance to the next step.",
      );
      return;
    }

    if (type === "like") setLikes((l) => l + 1);
    if (type === "follow") setIsFollowing((f) => !f);

    // Trigger network ping if backend is connected
    if (activeStep >= 4) {
      setIsPinging(true);
      setTimeout(() => setIsPinging(false), 1000);
    }

    // Trigger DB sync if DB is connected
    if (activeStep === 5) {
      setDbSynced(false);
      setTimeout(() => setDbSynced(true), 1000);
    }
  };

  const renderClientUI = () => {
    // 0: HTML (Raw)
    if (activeStep === 0) {
      return (
        <div
          className="w-full h-full bg-white text-black p-6 overflow-y-auto"
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          <h1
            style={{ fontSize: "2em", fontWeight: "bold", margin: "0.67em 0" }}
          >
            User Profile
          </h1>
          <img
            src="https://picsum.photos/seed/aanan/150/150"
            alt="Avatar"
            style={{ width: "100px", height: "100px" }}
          />
          <h2
            style={{
              fontSize: "1.5em",
              fontWeight: "bold",
              margin: "0.83em 0",
            }}
          >
            AANAN
          </h2>
          <p style={{ margin: "1em 0" }}>Frontend Specialist | MERN</p>
          <p style={{ margin: "1em 0" }}>
            Crafting pixel-perfect UIs, powered by robust backends.
          </p>
          <ul
            style={{
              display: "block",
              listStyleType: "disc",
              marginBlockStart: "1em",
              marginBlockEnd: "1em",
              paddingInlineStart: "40px",
            }}
          >
            <li>Status: Online</li>
            <li>Followers: {isFollowing ? 1025 : 1024}</li>
            <li>Likes: {likes}</li>
          </ul>
          <button
            style={{
              appearance: "button",
              padding: "2px 6px",
              borderWidth: "2px",
              borderStyle: "outset",
              borderColor: "buttonborder",
              backgroundColor: "buttonface",
              color: "buttontext",
              cursor: "pointer",
            }}
            onClick={() => handleInteraction("follow")}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
          <button
            style={{
              appearance: "button",
              padding: "2px 6px",
              borderWidth: "2px",
              borderStyle: "outset",
              borderColor: "buttonborder",
              backgroundColor: "buttonface",
              color: "buttontext",
              marginLeft: "8px",
              cursor: "pointer",
            }}
            onClick={() => handleInteraction("like")}
          >
            Like
          </button>
        </div>
      );
    }

    // 1+: CSS Applied
    const isReact = activeStep >= 3;
    const CardWrapper = isReact ? motion.div : "div";
    const ButtonWrapper = isReact ? motion.button : "button";

    return (
      <CardWrapper
        layout={isReact}
        className="w-full h-full bg-[#111] border border-white/10 rounded-2xl p-6 flex flex-col gap-5 text-white shadow-2xl relative overflow-hidden"
      >
        {/* React Component Highlights */}
        {isReact && (
          <div className="absolute inset-0 pointer-events-none z-50 p-2 flex flex-col gap-2 opacity-30">
            <div className="border border-dashed border-accent rounded-xl w-full h-full relative">
              <span className="absolute -top-3 left-2 bg-[#111] text-accent text-[10px] font-mono px-1">
                &lt;ProfileCard /&gt;
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 relative z-10">
          <div className="relative">
            <img
              src="https://picsum.photos/seed/aanan/150/150"
              alt="Avatar"
              className="w-16 h-16 rounded-full border-2 border-white/10 object-cover"
            />
            {isReact && (
              <div className="absolute -inset-1 border border-dashed border-accent rounded-full opacity-30 pointer-events-none" />
            )}
          </div>
          <div>
            <h3 className="font-display text-xl font-bold flex items-center gap-2">
              AANAN
              {dbSynced && <CheckCircle2 className="w-4 h-4 text-accent" />}
            </h3>
            <p className="text-muted text-sm font-mono">
              Frontend Specialist | MERN
            </p>
          </div>
        </div>

        <p className="text-gray-300 text-sm leading-relaxed relative z-10">
          Crafting pixel-perfect UIs, powered by robust backends.
        </p>

        <div className="flex gap-4 text-sm font-mono text-muted relative z-10">
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

        <div className="flex gap-3 mt-auto relative z-10">
          <ButtonWrapper
            whileHover={isReact ? { scale: 1.02 } : {}}
            whileTap={isReact ? { scale: 0.98 } : {}}
            onClick={() => handleInteraction("follow")}
            className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 relative ${isFollowing ? "bg-white/10 text-white" : "bg-accent text-bg"}`}
          >
            {isFollowing ? <CheckCircle2 className="w-4 h-4" /> : null}
            {isFollowing ? "Following" : "Follow"}
            {isReact && (
              <div className="absolute -inset-1 border border-dashed border-accent rounded-lg opacity-30 pointer-events-none" />
            )}
          </ButtonWrapper>

          <ButtonWrapper
            whileHover={isReact ? { scale: 1.02 } : {}}
            whileTap={isReact ? { scale: 0.98 } : {}}
            onClick={() => handleInteraction("like")}
            className="px-4 py-2.5 rounded-lg font-bold text-sm bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-2 border border-white/5 relative"
          >
            <Heart
              className={`w-4 h-4 ${likes > 0 ? "fill-red-500 text-red-500" : ""}`}
            />
            {isReact && (
              <div className="absolute -inset-1 border border-dashed border-accent rounded-lg opacity-30 pointer-events-none" />
            )}
          </ButtonWrapper>
        </div>
      </CardWrapper>
    );
  };

  return (
    <section
      className="py-24 sm:py-32 px-4 sm:px-8 max-w-7xl mx-auto relative z-20 bg-bg"
      id="skills"
      ref={containerRef}
    >
      <div className="text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className="font-display text-4xl sm:text-5xl uppercase font-bold tracking-tighter mb-4"
        >
          Mastering The <span className="text-accent italic">Stack</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.1 }}
          className="text-muted font-mono text-sm uppercase tracking-widest"
        >
          Frontend focused. Full-stack capable. Here's how I connect the dots.
        </motion.p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start relative">
        {/* Left Content - The Story */}
        <div className="lg:w-5/12 flex flex-col gap-4 w-full order-2 lg:order-1">
          {steps.map((step, index) => {
            const isActive = activeStep === index;
            const isPassed = activeStep > index;
            const Icon = step.icon;

            return (
              <motion.button
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={
                  isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }
                }
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onClick={() => setActiveStep(index)}
                className={`
                  text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden
                  ${
                    isActive
                      ? `bg-[#111] ${step.borderColor} shadow-lg scale-[1.02] z-10`
                      : isPassed
                        ? "bg-white/5 border-white/5 hover:bg-white/10"
                        : "bg-transparent border-transparent opacity-50 hover:opacity-100"
                  }
                `}
              >
                <div className="flex items-start gap-4 relative z-10">
                  <div
                    className={`p-3 rounded-xl ${isActive ? step.bgColor : "bg-white/5"}`}
                  >
                    <Icon
                      className={`w-6 h-6 ${isActive ? step.color : "text-muted"}`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3
                        className={`font-bold text-lg ${isActive ? "text-white" : "text-gray-400"}`}
                      >
                        {step.name}
                      </h3>
                      <span
                        className={`text-xs font-mono px-2 py-1 rounded-full ${isActive ? step.bgColor + " " + step.color : "bg-white/5 text-muted"}`}
                      >
                        {step.tech}
                      </span>
                    </div>

                    <AnimatePresence>
                      {isActive && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-sm text-gray-400 leading-relaxed mt-2"
                        >
                          {step.desc}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Active Indicator Line */}
                {isActive && (
                  <motion.div
                    layoutId="active-step-indicator"
                    className={`absolute left-0 top-0 bottom-0 w-1 ${step.bgColor.replace("/10", "")}`}
                  />
                )}
              </motion.button>
            );
          })}

          <div className="flex justify-between items-center mt-4 px-2">
            <button
              onClick={() => setActiveStep(0)}
              className="text-xs font-mono text-muted hover:text-white transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>

            {activeStep < steps.length - 1 && (
              <button
                onClick={() => setActiveStep((s) => s + 1)}
                className="text-xs font-mono text-bg bg-white px-4 py-2 rounded-full font-bold hover:bg-accent transition-colors flex items-center gap-2"
              >
                Next Layer <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Right Content - The Cinematic Visualization */}
        <div className="lg:w-7/12 w-full h-[380px] min-[400px]:h-[420px] sm:h-[500px] lg:h-[650px] sticky top-20 lg:top-24 z-40 order-1 lg:order-2 rounded-3xl border border-white/10 bg-[#050505] overflow-hidden shadow-2xl flex items-center justify-center">
          {/* Background Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

          {/* Scaled Inner Container for perfect responsiveness */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] flex items-center justify-center gap-8 scale-[0.4] min-[400px]:scale-[0.45] sm:scale-[0.6] md:scale-[0.8] lg:scale-100 transition-transform duration-500">
            {/* The Client (Browser) */}
            <motion.div
              layout
              className={`relative z-20 transition-all duration-500 ${activeStep >= 4 ? "w-[280px] h-[380px]" : "w-[340px] h-[460px]"}`}
            >
              <div className="absolute -top-8 left-0 text-xs font-mono text-muted flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                Browser (Frontend)
              </div>
              <div className="w-full h-full bg-white/5 rounded-2xl p-1 border border-white/10 shadow-2xl">
                <div className="w-full h-full rounded-xl overflow-hidden relative bg-white">
                  {renderClientUI()}
                </div>
              </div>
            </motion.div>

            {/* The Server (Backend) */}
            <AnimatePresence>
              {activeStep >= 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 50, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 50, scale: 0.8 }}
                  className="relative z-20 w-[180px] h-[240px] flex flex-col items-center justify-center"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-mono text-muted flex items-center gap-2 whitespace-nowrap">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    Server (Backend)
                  </div>
                  <div
                    className={`w-full h-full bg-[#111] rounded-2xl border-2 flex flex-col items-center justify-center gap-4 transition-colors duration-300 ${isPinging ? "border-accent shadow-[0_0_30px_accent]" : "border-white/10"}`}
                  >
                    <Server
                      className={`w-12 h-12 ${isPinging ? "text-accent" : "text-muted"}`}
                    />
                    <div className="text-xs font-mono text-center text-muted">
                      Express.js
                      <br />
                      API Gateway
                    </div>
                    {isPinging && (
                      <span className="text-[10px] font-mono text-accent bg-green-400/10 px-2 py-1 rounded">
                        200 OK
                      </span>
                    )}
                  </div>

                  {/* Connection Line (Client <-> Server) */}
                  <div className="absolute top-1/2 -left-8 w-8 h-0.5 bg-white/10 -translate-y-1/2">
                    <AnimatePresence>
                      {isPinging && (
                        <motion.div
                          initial={{ left: 0, opacity: 1 }}
                          animate={{ left: "100%", opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-accent rounded-full shadow-[0_0_10px_#4ade80]"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* The Database */}
            <AnimatePresence>
              {activeStep >= 5 && (
                <motion.div
                  initial={{ opacity: 0, x: 50, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 50, scale: 0.8 }}
                  className="relative z-20 w-[140px] h-[180px] flex flex-col items-center justify-center"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-mono text-muted flex items-center gap-2 whitespace-nowrap">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    Database
                  </div>
                  <div
                    className={`w-full h-full bg-[#111] rounded-2xl border-2 flex flex-col items-center justify-center gap-4 transition-colors duration-300 ${dbSynced ? "border-accent shadow-[0_0_30px_accent]" : "border-white/10"}`}
                  >
                    <Database
                      className={`w-10 h-10 ${dbSynced ? "text-accent" : "text-muted"}`}
                    />
                    <div className="text-xs font-mono text-center text-muted">
                      MongoDB
                      <br />
                      Storage
                    </div>
                  </div>

                  {/* Connection Line (Server <-> DB) */}
                  <div className="absolute top-1/2 -left-8 w-8 h-0.5 bg-white/10 -translate-y-1/2">
                    <AnimatePresence>
                      {isPinging && (
                        <motion.div
                          initial={{ left: 0, opacity: 1 }}
                          animate={{ left: "100%", opacity: 0 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-accent rounded-full shadow-[0_0_10px_#10b981]"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Step Instructions Overlay */}
          <div className="absolute bottom-4 lg:bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-white/10 px-4 lg:px-6 py-2 lg:py-3 rounded-2xl lg:rounded-full text-xs lg:text-sm font-mono text-white text-center w-[90%] max-w-md z-30 shadow-2xl">
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
  );
}
