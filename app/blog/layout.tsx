import Link from "next/link";
import CustomCursor from "@/components/CustomCursor";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-bg">
      <CustomCursor />
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-8 font-mono text-xs uppercase tracking-widest">
        <Link href="/" className="hover-target text-muted transition-colors hover:text-accent">
          ← Portfolio
        </Link>
        <Link href="/blog" className="hover-target text-fg/70 transition-colors hover:text-accent">
          Blog
        </Link>
      </header>
      {children}
    </div>
  );
}
