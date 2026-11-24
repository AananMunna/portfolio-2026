"use client";

import { motion } from "motion/react";
import { useState } from "react";

const EMAIL = "aananmunna420@gmail.com";
const WHATSAPP = "https://wa.me/8801310468353";

const inquiryTypes = [
  "Full-time role",
  "Freelance project",
  "Collaboration",
  "Something else",
];

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-fg placeholder:text-muted/60 outline-none transition-colors focus:border-accent/60";

export default function ContactDetails() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    type: inquiryTypes[0],
    message: "",
  });

  const update =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  // No backend needed: opens the visitor's mail client with the message prefilled.
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `[${form.type}] ${form.subject}`;
    const body = `${form.message}\n\n— ${form.name} (${form.email})`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section
      id="get-in-touch"
      className="relative z-20 mx-auto max-w-7xl bg-bg px-4 py-32 sm:px-8"
    >
      <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-20">
        {/* LEFT */}
        <div className="md:col-span-5">
          <h2 className="font-display text-4xl font-bold uppercase leading-[0.9] tracking-tighter sm:text-6xl">
            Let&apos;s talk about <br />
            <span className="italic text-accent">your next project.</span>
          </h2>

          <div className="mt-10 space-y-4 font-mono text-sm">
            <a
              href={`mailto:${EMAIL}`}
              className="hover-target block text-fg/80 transition-colors hover:text-accent"
            >
              ✉ {EMAIL}
            </a>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="hover-target block text-fg/80 transition-colors hover:text-accent"
            >
              ☎ WhatsApp · +880 1310 468353
            </a>
            <p className="text-muted">Bangladesh · GMT+6 (BST)</p>
          </div>

          {/* Availability panel */}
          <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-5 flex items-center justify-between">
              <p className="font-mono text-xs uppercase tracking-widest text-muted">
                Open for roles
              </p>
              <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-accent">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                Active
              </span>
            </div>
            <ul className="space-y-2 text-fg/75">
              <li>• Full-time remote frontend or full-stack roles</li>
              <li>• Freelance contracts</li>
              <li>• Building SaaS products end to end</li>
            </ul>
            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 font-mono text-xs">
              <div>
                <dt className="uppercase tracking-widest text-muted">Location</dt>
                <dd className="mt-1 text-fg">Remote / UTC+6</dd>
              </div>
              <div>
                <dt className="uppercase tracking-widest text-muted">Primary stack</dt>
                <dd className="mt-1 text-fg">React, Next.js, Node.js</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* RIGHT: form */}
        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4 md:col-span-7"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="Your name"
              value={form.name}
              onChange={update("name")}
              className={inputClass}
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={update("email")}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="Subject"
              value={form.subject}
              onChange={update("subject")}
              className={inputClass}
            />
            <select
              value={form.type}
              onChange={update("type")}
              aria-label="Inquiry type"
              className={`${inputClass} appearance-none`}
            >
              {inquiryTypes.map((t) => (
                <option key={t} value={t} className="bg-[#070b16]">
                  {t}
                </option>
              ))}
            </select>
          </div>
          <textarea
            required
            rows={7}
            placeholder="Message"
            value={form.message}
            onChange={update("message")}
            className={`${inputClass} resize-none`}
          />
          <button
            type="submit"
            className="hover-target rounded-full bg-accent px-8 py-4 font-mono text-xs font-semibold uppercase tracking-widest text-bg transition-opacity hover:opacity-80"
          >
            Send message →
          </button>
        </motion.form>
      </div>
    </section>
  );
}
