"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Loader2, Send, AlertCircle } from "lucide-react";

const TYPES = ["Full-time role", "Freelance project", "Collaboration", "Something else"];

type Status = "idle" | "sending" | "success" | "error";

const field =
  "w-full rounded-xl border hairline bg-white/[0.04] px-4 py-3.5 text-[15.5px] text-fg placeholder:text-muted/70 outline-none transition-all duration-200 focus:border-accent focus:bg-transparent focus:ring-4 focus:ring-accent/15";

const label = "mb-2 block text-[13px] font-medium text-fg/80";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", type: TYPES[1], message: "", website: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setStatus("success");
      setForm({ name: "", email: "", subject: "", type: TYPES[1], message: "", website: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="card relative overflow-hidden p-6 sm:p-9">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="ok"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex min-h-[420px] flex-col items-center justify-center text-center"
            role="status"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-bg"
            >
              <Check size={30} strokeWidth={2.6} />
            </motion.span>
            <h3 className="mt-6 text-2xl font-semibold tracking-tight text-fg">Message sent.</h3>
            <p className="mt-2 max-w-sm text-[15.5px] leading-relaxed text-muted">
              Thanks for reaching out. I read every message and usually reply within a day.
            </p>
            <button onClick={() => setStatus("idle")} className="hover-target btn-ghost mt-8">
              Send another
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={onSubmit} noValidate={false} exit={{ opacity: 0 }} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="c-name" className={label}>Your name</label>
                <input id="c-name" required minLength={2} maxLength={100} autoComplete="name" placeholder="Jane Doe" value={form.name} onChange={set("name")} className={field} />
              </div>
              <div>
                <label htmlFor="c-email" className={label}>Email</label>
                <input id="c-email" required type="email" maxLength={200} autoComplete="email" placeholder="jane@company.com" value={form.email} onChange={set("email")} className={field} />
              </div>
            </div>

            <div>
              <span className={label}>What is this about?</span>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Inquiry type">
                {TYPES.map((t) => {
                  const on = form.type === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setForm((f) => ({ ...f, type: t }))}
                      className={`hover-target rounded-full border px-4 py-2 text-[13.5px] font-medium transition-all duration-200 ${
                        on
                          ? "border-accent bg-accent text-bg shadow-[0_8px_20px_-10px_var(--phosphor)]"
                          : "hairline text-fg/70 hover:border-accent/60 hover:text-accent"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="c-subject" className={label}>Subject</label>
              <input id="c-subject" required minLength={3} maxLength={150} placeholder="A short headline" value={form.subject} onChange={set("subject")} className={field} />
            </div>

            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <label htmlFor="c-message" className="text-[13px] font-medium text-fg/80">Message</label>
                <span className="font-mono text-[11px] text-muted">{form.message.length}/5000</span>
              </div>
              <textarea id="c-message" required minLength={10} maxLength={5000} rows={7} placeholder="Tell me about the project, the role, or just say hi." value={form.message} onChange={set("message")} className={`${field} resize-none`} />
            </div>

            {/* honeypot: hidden from people, bots fill it */}
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>
                Website
                <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} />
              </label>
            </div>

            <AnimatePresence>
              {status === "error" && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[14px] text-red-600 dark:text-red-300"
                >
                  <AlertCircle size={17} className="mt-0.5 shrink-0" /> {error}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="flex flex-col-reverse items-stretch gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[12.5px] text-muted">Your message goes straight to my inbox.</p>
              <button type="submit" disabled={status === "sending"} className="hover-target btn-primary !px-7 !py-3.5 disabled:opacity-70">
                {status === "sending" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Sending…
                  </>
                ) : (
                  <>
                    Send message <Send size={15} />
                  </>
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
