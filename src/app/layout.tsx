import type { Metadata, Viewport } from "next";
import WhatsAppButton from "@/components/WhatsAppButton";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "TerraMaps — Topographie & Cartographie",
  description: "Plateforme professionnelle de topographie, cartographie et conception routière — compatible Covadis & LandXML.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TerraMaps",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: "#F97316",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased" suppressHydrationWarning style={{ margin: 0, padding: 0 }}>
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
