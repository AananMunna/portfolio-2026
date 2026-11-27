import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { Mail, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Aanan Munna for full-time roles, freelance projects or collaborations.",
};

const EMAIL = "aananmunna420@gmail.com";

export default function ContactPage() {
  return (
    <main className="relative bg-bg">
      <div className="hero-ambient pointer-events-none absolute inset-x-0 top-0 h-[70vh]" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8 sm:pb-32 sm:pt-40">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-20">
          {/* left */}
          <div className="lg:col-span-5">
            <p className="eyebrow">Contact</p>
            <h1 className="mt-3 text-[clamp(2.4rem,5.4vw,4rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-fg">
              Let&apos;s talk about your <span className="text-accent">next project.</span>
            </h1>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-muted">
              A full-time role, a freelance build, or just a hello. Send a message and I&apos;ll get back to you.
            </p>

            <dl className="mt-10 space-y-6">
              <div className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border hairline text-accent">
                  <Mail size={18} />
                </span>
                <div>
                  <dt className="text-[13px] text-muted">Email</dt>
                  <dd>
                    <a href={`mailto:${EMAIL}`} className="hover-target text-[17px] font-medium text-fg hover:text-accent">
                      {EMAIL}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border hairline text-accent">
                  <MapPin size={18} />
                </span>
                <div>
                  <dt className="text-[13px] text-muted">Based in</dt>
                  <dd className="text-[17px] font-medium text-fg">Kushtia, Bangladesh · Remote</dd>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border hairline text-accent">
                  <Clock size={18} />
                </span>
                <div>
                  <dt className="text-[13px] text-muted">Timezone &amp; reply time</dt>
                  <dd className="text-[17px] font-medium text-fg">GMT+6 · usually within a day</dd>
                </div>
              </div>
            </dl>

            <div className="card mt-10 p-6">
              <div className="flex items-center justify-between">
                <p className="text-[15px] font-semibold text-fg">Currently open to</p>
                <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-[12px] font-medium text-accent">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> Available
                </span>
              </div>
              <ul className="mt-4 space-y-2.5 text-[15px] text-fg/75">
                <li className="flex gap-2.5"><span className="text-accent">→</span> Full-time remote roles (full-stack or frontend)</li>
                <li className="flex gap-2.5"><span className="text-accent">→</span> Freelance projects</li>
                <li className="flex gap-2.5"><span className="text-accent">→</span> Early-stage products that need someone to build them</li>
              </ul>
            </div>
          </div>

          {/* right */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </div>
    </main>
  );
}
