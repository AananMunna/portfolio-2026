"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Send,
  Zap,
  Check,
  CheckCheck,
  Mail,
  Phone,
  Github,
  Linkedin,
  ExternalLink,
} from "lucide-react";
import { GoogleGenAI } from "@google/genai";

// ── Typewriter hook ──────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 14) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    if (!text) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
}

// ── Sound util ───────────────────────────────────────────────────────────────
function playTone(
  freq: number,
  dur: number,
  vol = 0.06,
  type: OscillatorType = "sine",
) {
  try {
    const ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  } catch {}
}
const playSend = () => {
  playTone(1050, 0.07, 0.05);
  setTimeout(() => playTone(1320, 0.09, 0.04), 55);
};
const playReceive = () => {
  playTone(600, 0.08, 0.05);
  setTimeout(() => playTone(750, 0.1, 0.04), 70);
};

// ── Contact data (single source of truth) ────────────────────────────────────
const CONTACT_CARDS = [
  {
    id: "email",
    label: "Email",
    value: "aananmunna420@gmail.com",
    href: "mailto:aananmunna420@gmail.com",
    icon: Mail,
    color: "#f87171",
  },
  {
    id: "phone",
    label: "Phone",
    value: "+880 131 046 8353",
    href: "tel:+8801310468353",
    icon: Phone,
    color: "#34d399",
  },
  {
    id: "github",
    label: "GitHub",
    value: "github.com/AananMunna",
    href: "https://github.com/AananMunna",
    icon: Github,
    color: "#e2e8f0",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    value: "linkedin.com/in/aanan-munna",
    href: "https://linkedin.com/in/aanan-munna",
    icon: Linkedin,
    color: "#60a5fa",
  },
] as const;

// ── Types ─────────────────────────────────────────────────────────────────────
type Status = "sending" | "sent" | "delivered";
type CardKey = (typeof CONTACT_CARDS)[number]["id"];

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  animate?: boolean;
  time: string;
  status?: Status;
  cards?: CardKey[];
};

const getTime = () =>
  new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

// ── Contact card component ────────────────────────────────────────────────────
function ContactCard({ id }: { id: CardKey }) {
  const card = CONTACT_CARDS.find((c) => c.id === id)!;
  const Icon = card.icon;
  const isExternal = card.href.startsWith("http");

  return (
    <motion.a
      href={card.href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      initial={{ opacity: 0, y: 6, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.02, x: 2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all duration-200 group no-underline"
      style={{ background: `${card.color}08`, borderColor: `${card.color}25` }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = `${card.color}55`;
        (e.currentTarget as HTMLElement).style.background = `${card.color}12`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = `${card.color}25`;
        (e.currentTarget as HTMLElement).style.background = `${card.color}08`;
      }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${card.color}15` }}
      >
        <Icon size={13} style={{ color: card.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="font-mono text-[9px] uppercase tracking-widest"
          style={{ color: `${card.color}80` }}
        >
          {card.label}
        </p>
        <p className="text-white/75 text-[11px] font-mono truncate group-hover:text-white transition-colors">
          {card.value}
        </p>
      </div>
      <ExternalLink
        size={10}
        className="text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0"
      />
    </motion.a>
  );
}

// ── Typewriter message ────────────────────────────────────────────────────────
function AssistantMessage({
  content,
  animate,
}: {
  content: string;
  animate?: boolean;
}) {
  const { displayed, done } = useTypewriter(animate ? content : "", 14);
  const text = animate ? displayed : content;
  return (
    <span>
      {text}
      {animate && !done && (
        <span className="inline-block w-[2px] h-[1em] bg-accent ml-[1px] align-middle animate-pulse" />
      )}
    </span>
  );
}

// ── Tick ─────────────────────────────────────────────────────────────────────
function Tick({ status }: { status?: Status }) {
  if (!status) return null;
  if (status === "sending") return <Check size={11} className="text-bg/40" />;
  if (status === "sent") return <Check size={11} className="text-bg/60" />;
  return <CheckCheck size={11} className="text-bg/80" />;
}

// ── Suggestions ───────────────────────────────────────────────────────────────
const SUGGESTIONS = [
  "What's Aanan's best project?",
  "Is he available for hire?",
  "What's his expected salary?",
  "Can I see his contact details?",
];

// ── System prompt (HR-optimised) ──────────────────────────────────────────────
const SYSTEM_PROMPT = `
You are NOVA, the AI assistant embedded in Aanan Munna's personal portfolio website.
Personality: warm, witty, confident — like a close friend who's genuinely proud of Aanan.

════════════════════════════════════════
ABOUT AANAN MUNNA
════════════════════════════════════════

IDENTITY
- Full name: Aanan Munna
- Role: Front-End Developer (Full-Stack Capable)
- Location: Dhaka, Bangladesh · Timezone: GMT+6
- Languages: Bangla (native), English (professional working proficiency)

EXPERIENCE
- 1.5+ years of professional experience
- Current: Front-End Developer @ Al Jaami Technologies (Present, Full-time)
  · Grew into full-stack delivery — owns complete feature lifecycle
  · ER diagram & REST API design → Redux state management → Frontend integration
  · Stack: React, Next.js, TypeScript, Redux, Node.js, Express.js, MongoDB, REST API
- Previous: Front-End Developer @ CodeCareBD
  · Converted pixel-perfect Figma designs into production-ready React/Next.js code
  · Stack: React, Next.js, Figma-to-Code, CSS/SCSS, Tailwind CSS, Framer Motion

TECHNICAL SKILLS
- Frontend: React, Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, Redux/RTK Query
- Backend: Node.js, Express.js, REST API design, MongoDB
- Tools: Git, GitHub, Figma, Postman
- Strengths: Pixel-perfect UI, cinematic animations, component architecture, performance

PROJECTS
- TripTale — Travel platform (React, Next.js, TypeScript)
- StudySync — Group study & exam management platform
- Garden Hub — E-commerce + social platform
- Othoba — E-commerce clone
- ValoDeal — E-commerce deal aggregator platform

AVAILABILITY & WORK PREFERENCES
- Available for: Full-time roles, Remote freelance, Contract work
- Preferred: Remote-first (open to hybrid)
- Open to international opportunities
- Can start within short notice

SALARY EXPECTATIONS
- Open to discussion based on role and company
- Targeting market-rate for senior frontend roles internationally
- Freelance: project-based pricing

SOFT SKILLS & WORK STYLE
- Communicates proactively — flags issues before they become problems
- Questions requirements, not just executes — bridges design and engineering
- Ships fast without cutting corners on quality
- Works well in teams and independently
- Experience with agile workflows

CONTACT
- Email: aananmunna420@gmail.com
- Phone: +8801310468353
- GitHub: github.com/AananMunna
- LinkedIn: linkedin.com/in/aanan-munna
- Portfolio: aanan-munna.netlify.app

════════════════════════════════════════
SPECIAL INSTRUCTION — CONTACT REQUESTS
════════════════════════════════════════
When the user asks for contact info, social links, email, phone, or how to reach Aanan,
end your reply with this EXACT marker on its own line (no extra text after it):

[SHOW_CONTACT: email, phone, github, linkedin]

You can show a subset. Examples:
- Only social: [SHOW_CONTACT: github, linkedin]
- Only email:  [SHOW_CONTACT: email]

════════════════════════════════════════
RESPONSE RULES
════════════════════════════════════════
- Keep replies SHORT (1-2 sentences max)
- Be warm and conversational, not corporate
- Light humor/emojis OK (don't overdo)
- Always make Aanan sound impressive but authentic
- Never fabricate details not listed above
`;

// ── Parse contact marker ───────────────────────────────────────────────────────
function parseContactCards(text: string): { clean: string; cards: CardKey[] } {
  const match = text.match(/\[SHOW_CONTACT:\s*([^\]]+)\]/i);
  if (!match) return { clean: text, cards: [] };
  const cards = match[1]
    .split(",")
    .map((s) => s.trim().toLowerCase() as CardKey)
    .filter((k) => CONTACT_CARDS.some((c) => c.id === k));
  return { clean: text.replace(match[0], "").trim(), cards };
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "assistant",
      content:
        "Hey! 👋 I'm NOVA — Aanan's AI sidekick. Ask me anything about him, his work, or if he's the right fit for your team!",
      animate: false,
      time: getTime(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const msgIdRef = useRef(1);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isTyping]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, [input]);

  useEffect(() => {
    if (isOpen) setTimeout(() => textareaRef.current?.focus(), 350);
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userText = text.trim();
    setInput("");
    setShowSuggestions(false);
    playSend();

    const newId = msgIdRef.current++;
    setMessages((prev) => [
      ...prev,
      {
        id: newId,
        role: "user",
        content: userText,
        time: getTime(),
        status: "sending" as Status,
      },
    ]);
    setIsLoading(true);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === newId ? { ...m, status: "sent" as Status } : m,
        ),
      );
    }, 300);
    setTimeout(() => setIsTyping(true), 500);

    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
      });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${SYSTEM_PROMPT}\n\nUser asked: ${userText}`,
      });

      const raw =
        response.text || "Hmm, I got a bit lost there. Try asking again?";
      const { clean, cards } = parseContactCards(raw);

      setIsTyping(false);
      playReceive();
      setMessages((prev) =>
        prev.map((m) =>
          m.id === newId ? { ...m, status: "delivered" as Status } : m,
        ),
      );
      setMessages((prev) => [
        ...prev,
        {
          id: msgIdRef.current++,
          role: "assistant",
          content: clean,
          animate: true,
          time: getTime(),
          cards: cards.length ? cards : undefined,
        },
      ]);
    } catch {
      setIsTyping(false);
      playReceive();
      setMessages((prev) => [
        ...prev,
        {
          id: msgIdRef.current++,
          role: "assistant",
          content: "Oops, my circuits got a bit fuzzy 😅 Try again in a sec!",
          animate: true,
          time: getTime(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-[100] hover-target"
          >
            <span className="absolute inset-0 rounded-full bg-accent/30 animate-ping" />
            <div className="relative w-14 h-14 bg-bg border border-accent/40 rounded-full flex flex-col items-center justify-center shadow-[0_0_24px_rgba(0,255,136,0.2)] gap-0.5">
              <Zap size={20} className="text-accent" />
              <span className="font-mono text-[8px] text-accent tracking-widest uppercase">
                NOVA
              </span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 w-[calc(100vw-3rem)] sm:w-[400px] max-h-[85vh] z-[100] flex flex-col rounded-3xl overflow-hidden border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.8)] bg-[#0c0c0c]"
            style={{ height: "clamp(480px, 70vh, 620px)" }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,136,0.012)_50%)] bg-[length:100%_4px] pointer-events-none z-10" />

            {/* Header */}
            <div className="relative z-20 flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06] bg-[#0f0f0f]">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[#111] border border-accent/25 flex items-center justify-center shadow-[0_0_14px_rgba(0,255,136,0.15)]">
                    <Zap size={17} className="text-accent" />
                  </div>
                  <motion.span
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent rounded-full border-2 border-[#0f0f0f]"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div>
                  <p className="font-display font-bold text-white text-sm leading-none tracking-wide">
                    NOVA
                  </p>
                  <AnimatePresence mode="wait">
                    {isTyping ? (
                      <motion.p
                        key="typing"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="font-mono text-[9px] text-accent tracking-widest mt-0.5"
                      >
                        typing...
                      </motion.p>
                    ) : (
                      <motion.p
                        key="online"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="font-mono text-[9px] text-accent/60 uppercase tracking-widest mt-0.5"
                      >
                        Aanan's AI · Online
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-white/30 hover:text-white transition-colors rounded-full hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div
              className="relative z-20 flex-1 overflow-y-auto px-4 py-4 space-y-1"
              data-lenis-prevent="true"
              style={{ scrollbarWidth: "none" }}
            >
              {messages.map((msg, idx) => {
                const isGrouped = messages[idx - 1]?.role === msg.role;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.2,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} ${isGrouped ? "mt-0.5" : "mt-3"}`}
                  >
                    <div
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} w-full`}
                    >
                      {msg.role === "assistant" && (
                        <div
                          className={`w-6 h-6 rounded-full bg-[#111] border border-accent/20 flex items-center justify-center mr-2 mt-auto flex-shrink-0 ${isGrouped ? "opacity-0" : ""}`}
                        >
                          <Zap size={9} className="text-accent" />
                        </div>
                      )}
                      <div className="flex flex-col gap-0.5 max-w-[78%]">
                        <div
                          className={`px-4 py-2.5 text-[13.5px] leading-relaxed select-text ${
                            msg.role === "user"
                              ? "bg-accent text-bg font-medium shadow-[0_2px_12px_rgba(0,255,136,0.2)]"
                              : "bg-white/[0.07] border border-white/[0.07] text-white/90"
                          } ${
                            msg.role === "user"
                              ? isGrouped
                                ? "rounded-2xl rounded-tr-md"
                                : "rounded-2xl rounded-tr-sm"
                              : isGrouped
                                ? "rounded-2xl rounded-tl-md"
                                : "rounded-2xl rounded-tl-sm"
                          }`}
                        >
                          {msg.role === "assistant" ? (
                            <AssistantMessage
                              content={msg.content}
                              animate={msg.animate}
                            />
                          ) : (
                            msg.content
                          )}
                        </div>
                        <div
                          className={`flex items-center gap-1 px-1 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <span className="font-mono text-[9px] text-white/20">
                            {msg.time}
                          </span>
                          {msg.role === "user" && <Tick status={msg.status} />}
                        </div>
                      </div>
                    </div>

                    {/* Clickable contact cards */}
                    {msg.cards && msg.cards.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col gap-1.5 mt-2 w-full max-w-[85%] ml-8"
                      >
                        {msg.cards.map((id, i) => (
                          <motion.div
                            key={id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35 + i * 0.09 }}
                          >
                            <ContactCard id={id} />
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}

              {/* Typing bubble */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.18 }}
                    className="flex justify-start items-end gap-2 mt-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#111] border border-accent/20 flex items-center justify-center flex-shrink-0">
                      <Zap size={9} className="text-accent" />
                    </div>
                    <div className="bg-white/[0.07] border border-white/[0.07] px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-1.5 h-1.5 bg-accent/60 rounded-full"
                          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                          transition={{
                            duration: 0.7,
                            repeat: Infinity,
                            delay: i * 0.18,
                            ease: "easeInOut",
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Suggestions */}
              <AnimatePresence>
                {showSuggestions && messages.length === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col gap-2 pt-3"
                  >
                    <p className="font-mono text-[9px] text-white/25 uppercase tracking-widest px-1">
                      Quick questions
                    </p>
                    {SUGGESTIONS.map((s, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + i * 0.08 }}
                        onClick={() => sendMessage(s)}
                        className="text-left text-xs text-white/50 hover:text-white border border-white/[0.07] hover:border-accent/40 hover:bg-accent/5 px-4 py-2.5 rounded-xl transition-all duration-200 font-mono active:scale-[0.98]"
                      >
                        → {s}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="relative z-20 px-3 pb-3 pt-2.5 border-t border-white/[0.06] bg-[#0f0f0f]">
              <div className="flex items-end gap-2 bg-white/[0.05] border border-white/[0.08] rounded-2xl px-4 py-2.5 focus-within:border-accent/35 focus-within:bg-white/[0.07] transition-all duration-200">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Message NOVA..."
                  rows={1}
                  className="flex-1 bg-transparent text-[13.5px] text-white placeholder:text-white/20 focus:outline-none font-mono resize-none leading-relaxed py-0.5"
                  style={{ maxHeight: 120, scrollbarWidth: "none" }}
                />
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  animate={
                    input.trim()
                      ? { scale: 1, opacity: 1 }
                      : { scale: 0.85, opacity: 0.35 }
                  }
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="w-8 h-8 bg-accent text-bg rounded-xl flex items-center justify-center disabled:cursor-not-allowed flex-shrink-0 shadow-[0_0_12px_rgba(0,255,136,0.25)] mb-0.5"
                >
                  <Send size={13} className="ml-0.5" />
                </motion.button>
              </div>
              <p className="font-mono text-[8px] text-white/10 text-center mt-1.5 tracking-wider">
                NOVA · Enter to send · Shift+Enter for new line
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
