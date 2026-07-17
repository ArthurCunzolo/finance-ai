import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6 py-16">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 font-display text-sm font-semibold tracking-tight text-text-dim hover:text-text"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mint text-ink text-[11px] font-bold">
            ƒ
          </span>
          Finance AI
        </Link>
        {children}
      </div>
    </div>
  );
}
