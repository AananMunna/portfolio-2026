import Link from "next/link";
import CustomCursor from "@/components/CustomCursor";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-bg">
      <CustomCursor />
      <header className="sticky top-0 z-30 border-b border-white/10 bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 font-mono text-xs uppercase tracking-widest">
          <Link href="/" className="hover-target text-fg transition-colors hover:text-accent">
            Aanan<span className="text-accent">.</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/blog" className="hover-target text-fg/70 transition-colors hover:text-accent">
              Blog
            </Link>
            <Link href="/#work" className="hover-target text-fg/70 transition-colors hover:text-accent">
              Work
            </Link>
            <Link href="/#get-in-touch" className="hover-target text-fg/70 transition-colors hover:text-accent">
              Contact
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
