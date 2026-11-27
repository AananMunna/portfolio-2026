"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { scrollToY } from "@/lib/scroll";

/**
 * Sidebar link between posts. If the reader is part-way down the current post,
 * glide back to the top first so the switch feels like one smooth motion.
 */
export default function PostLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const onClick = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    if (window.scrollY < 160) return; // already near the top: normal navigation
    e.preventDefault();
    router.prefetch(href);
    scrollToY(0);
    window.setTimeout(() => router.push(href), 380);
  };

  return (
    <Link href={href} onClick={onClick} className={className}>
      {children}
    </Link>
  );
}
