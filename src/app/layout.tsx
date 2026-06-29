import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "TerraMaps — Topographie & Cartographie",
  description:
    "Professional SaaS platform for surveying, terrain modeling, road design, and civil engineering — inspired by AutoCAD Covadis.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

