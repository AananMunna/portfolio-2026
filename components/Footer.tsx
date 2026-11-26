"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Github, Linkedin, Instagram, Facebook, Twitter, Mail } from "lucide-react";

const EMAIL = "aananmunna420@gmail.com";

const nav = [
  { label: "Home", href: "/" },
  { label: "Experience", href: "/#experience" },
  { label: "Stack", href: "/#skills" },
  { label: "Projects", href: "/#work" },
  { label: "About", href: "/#about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const WhatsApp = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const socials = [
  { name: "GitHub", href: "https://github.com/AananMunna", icon: Github },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/aanan-munna/", icon: Linkedin },
  { name: "X", href: "https://x.com/aanan_munna", icon: Twitter },
  { name: "Instagram", href: "https://www.instagram.com/aanan_munna/", icon: Instagram },
  { name: "Facebook", href: "https://www.facebook.com/aanan.munna/", icon: Facebook },
  { name: "WhatsApp", href: "https://wa.me/8801310468353", icon: WhatsApp },
  { name: "Email", href: `mailto:${EMAIL}`, icon: Mail },
];

export default function Footer() {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  const backToTop = () => {
    const lenis = (window as any).lenis;
    if (lenis) lenis.scrollTo(0, { duration: 1.6 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative z-20 border-t hairline bg-bg">
      <div className="mx-auto max-w-7xl px-5 pb-8 pt-16 sm:px-8 sm:pt-20">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12">
          {/* statement */}
          <div className="lg:col-span-6">
            <Link href="/" className="hover-target inline-flex items-center gap-3">
              <img src="/favicon.svg" alt="" width={40} height={40} className="h-10 w-10 rounded-[11px]" />
              <span className="text-lg font-semibold tracking-tight text-fg">Aanan Munna</span>
            </Link>

            <p className="mt-6 max-w-lg text-[19px] leading-[1.55] tracking-tight text-fg/85 sm:text-[22px]">
              I build web apps from the database to the button. Mostly Next.js, Node and Postgres. I learned by shipping real projects, and I care more about things working well than looking clever.
            </p>

            <ul className="mt-8 flex flex-wrap gap-2.5">
              {socials.map(({ name, href, icon: Icon }) => (
                <li key={name}>
                  <a
                    href={href}
                    target={href.startsWith("mailto") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    aria-label={name}
                    title={name}
                    className="hover-target flex h-11 w-11 items-center justify-center rounded-full border hairline text-fg/65 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:bg-accent hover:text-bg"
                  >
                    <Icon size={18} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* links */}
          <nav aria-label="Footer" className="lg:col-span-3">
            <p className="eyebrow">Navigate</p>
            <ul className="mt-5 space-y-3">
              {nav.map((n) => {
                const here = n.href === pathname;
                return (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      className={`hover-target group inline-flex items-center gap-1.5 text-[17px] font-medium tracking-tight transition-colors ${
                        here ? "text-accent" : "text-fg/80 hover:text-accent"
                      }`}
                    >
                      {n.label}
                      <ArrowUpRight
                        size={15}
                        className="-translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* contact */}
          <div className="lg:col-span-3">
            <p className="eyebrow">Say hello</p>
            <a
              href={`mailto:${EMAIL}`}
              className="hover-target mt-5 block break-all text-[17px] font-medium tracking-tight text-fg underline decoration-accent decoration-2 underline-offset-[6px] transition-colors hover:text-accent"
            >
              {EMAIL}
            </a>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              Kushtia, Bangladesh · GMT+6
              <br />
              Usually replies within a day.
            </p>
            <Link href="/contact" className="hover-target btn-primary mt-6 !py-2.5 !text-[13.5px]">
              Start a conversation
            </Link>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t hairline pt-6 text-[13px] text-muted sm:flex-row sm:items-center">
          <p>© {year} Aanan Munna. Designed and built by me.</p>
          <button onClick={backToTop} className="hover-target font-medium transition-colors hover:text-accent">
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
