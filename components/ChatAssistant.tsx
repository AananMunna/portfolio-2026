"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, Loader2, Zap } from "lucide-react";
import { GoogleGenAI } from "@google/genai";

// ── Typewriter hook ──────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 18) {
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
  duration: number,
  vol = 0.08,
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
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

const playSend = () => {
  playTone(880, 0.08, 0.07, "sine");
  setTimeout(() => playTone(1100, 0.1, 0.05, "sine"), 60);
};

const playReceive = () => {
  playTone(520, 0.12, 0.06, "sine");
  setTimeout(() => playTone(660, 0.14, 0.05, "sine"), 80);
};

// ── Message types ────────────────────────────────────────────────────────────
type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  animate?: boolean;
};

// ── Typewriter message component ─────────────────────────────────────────────
function AssistantMessage({
  content,
  animate,
}: {
  content: string;
  animate?: boolean;
}) {
  const { displayed, done } = useTypewriter(animate ? content : "", 16);
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

// ── Suggested questions ──────────────────────────────────────────────────────
const SUGGESTIONS = [
  "What's Aanan's best project?",
  "Is he available for hire?",
  "What's his tech stack?",
];

// ── Main component ───────────────────────────────────────────────────────────
export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "assistant",
      content:
        "Hey! 👋 I'm NOVA — Aanan's AI sidekick. Ask me anything about him, his work, or if he's the right fit for your team!",
      animate: false,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const msgIdRef = useRef(1);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 400);
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMessage = text.trim();
    setInput("");
    setShowSuggestions(false);
    playSend();

    const userMsg: Message = {
      id: msgIdRef.current++,
      role: "user",
      content: userMessage,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
      });

      const prompt = `
You are NOVA, the AI assistant for Aanan Munna's personal portfolio website.
Your personality: warm, friendly, witty — like a close friend who genuinely wants to help.
You're proud of Aanan and love talking about his work.

About Aanan:
- Full-Stack Developer (MERN stack) based in Dhaka, Bangladesh
- Expert in React, Next.js, TypeScript, Tailwind, Framer Motion
- Built projects: TripTale (travel platform), StudySync (group study app), Othoba clone, ValoDeal, Garden Hub
- Strong eye for UI/UX — builds cinematic, pixel-perfect interfaces
- Available for freelance and full-time opportunities
- GitHub: github.com/AananMunna
- LinkedIn: linkedin.com/in/aanan-munna

Rules:
- Keep replies SHORT (2-4 sentences max)
- Be warm and conversational, not formal
- Use occasional light humor or emojis (don't overdo it)
- Always make Aanan sound impressive but authentic
- If asked something you don't know, be honest and charming about it

User asked: ${userMessage}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const replyText =
        response.text || "Hmm, I got a bit lost there. Try asking again?";
      playReceive();

      const assistantMsg: Message = {
        id: msgIdRef.current++,
        role: "assistant",
        content: replyText,
        animate: true,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      playReceive();
      setMessages((prev) => [
        ...prev,
        {
          id: msgIdRef.current++,
          role: "assistant",
          content: "Oops, my circuits got a bit fuzzy 😅 Try again in a sec!",
          animate: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* ── FAB ── */}
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
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-accent/30 animate-ping" />
            <div className="relative w-16 h-16 bg-bg border border-accent/40 rounded-full flex flex-col items-center justify-center shadow-[0_0_24px_rgba(0,255,136,0.2)] gap-0.5">
              <Zap size={20} className="text-accent" />
              <span className="font-mono text-[8px] text-accent tracking-widest uppercase">
                NOVA
              </span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 32, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.94 }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 w-[calc(100vw-3rem)] sm:w-[400px] h-[580px] max-h-[85vh] z-[100] flex flex-col rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#0a0a0a]"
          >
            {/* Scanline overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,136,0.015)_50%)] bg-[length:100%_4px] pointer-events-none z-10" />

            {/* ── Header ── */}
            <div className="relative z-20 flex items-center justify-between px-5 py-4 border-b border-white/5 bg-[#0d0d0d]">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-bg border border-accent/30 flex items-center justify-center shadow-[0_0_12px_rgba(0,255,136,0.2)]">
                    <Zap size={16} className="text-accent" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-accent rounded-full border-2 border-[#0d0d0d]" />
                </div>
                <div>
                  <p className="font-display font-bold text-white text-sm leading-none">
                    NOVA
                  </p>
                  <p className="font-mono text-[9px] text-accent/70 uppercase tracking-widest mt-0.5">
                    Aanan's AI · Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-muted hover:text-white transition-colors rounded-full hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            {/* ── Messages ── */}
            <div
              className="relative z-20 flex-1 overflow-y-auto px-4 py-5 space-y-4"
              data-lenis-prevent="true"
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-full bg-bg border border-accent/20 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                      <Zap size={10} className="text-accent" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-accent text-bg font-medium rounded-tr-sm"
                        : "bg-white/5 border border-white/8 text-white/90 rounded-tl-sm"
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
                </motion.div>
              ))}

              {/* Loading */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start items-end gap-2"
                >
                  <div className="w-6 h-6 rounded-full bg-bg border border-accent/20 flex items-center justify-center flex-shrink-0">
                    <Zap size={10} className="text-accent" />
                  </div>
                  <div className="bg-white/5 border border-white/8 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 bg-accent rounded-full"
                        animate={{ y: [0, -4, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Suggestions */}
              <AnimatePresence>
                {showSuggestions && messages.length === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="flex flex-col gap-2 pt-1"
                  >
                    <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest px-1">
                      Quick questions
                    </p>
                    {SUGGESTIONS.map((s, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        onClick={() => sendMessage(s)}
                        className="text-left text-xs text-white/60 hover:text-white border border-white/8 hover:border-accent/40 hover:bg-accent/5 px-4 py-2.5 rounded-xl transition-all duration-200 font-mono"
                      >
                        → {s}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input ── */}
            <div className="relative z-20 px-4 pb-4 pt-3 border-t border-white/5 bg-[#0d0d0d]">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 focus-within:border-accent/40 transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  placeholder="Ask NOVA anything..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none font-mono"
                />
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="w-8 h-8 bg-accent text-bg rounded-xl flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-opacity flex-shrink-0"
                >
                  {isLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={13} className="ml-0.5" />
                  )}
                </motion.button>
              </div>
              <p className="font-mono text-[9px] text-white/15 text-center mt-2 tracking-wider">
                NOVA
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
