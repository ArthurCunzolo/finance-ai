import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finance AI — Seu dinheiro, distribuído com inteligência",
  description: "Motor de distribuição financeira.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-ink text-text grain">{children}</body>
    </html>
  );
}
