"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

const LINKS = [
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Missão", href: "#missao" },
];

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 z-50 flex w-full justify-center px-4 pt-4"
    >
      <nav className="glass flex w-full max-w-5xl items-center justify-between rounded-full px-5 py-3">
        <a href="#" className="flex items-center gap-2 font-display text-[15px] font-semibold tracking-tight">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mint text-ink text-[11px] font-bold">
            ƒ
          </span>
          Finance AI
        </a>
        <div className="hidden items-center gap-7 text-sm text-text-dim md:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-text">
              {link.label}
            </a>
          ))}
        </div>
        <Button variant="secondary" href="/login" className="!px-4 !py-2 text-[13px]">
          Entrar
        </Button>
      </nav>
    </motion.header>
  );
}
