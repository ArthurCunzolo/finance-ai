import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  href?: string;
}

const VARIANT_STYLES: Record<Variant, string> = {
  primary:
    "bg-mint text-ink hover:bg-mint-soft shadow-[0_0_0_1px_rgba(47,191,131,0.4),0_8px_24px_-8px_rgba(47,191,131,0.55)]",
  secondary:
    "glass text-text hover:border-line-strong hover:bg-white/[0.06]",
  ghost: "text-text-dim hover:text-text",
};

export function Button({ variant = "primary", className, href, ...props }: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-tight transition-all duration-200 ease-out active:scale-[0.97]",
    VARIANT_STYLES[variant],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {props.children}
      </Link>
    );
  }

  return <button className={classes} {...props} />;
}
