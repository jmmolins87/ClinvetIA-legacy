import * as React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { PageTransition } from "@/components/providers/page-transition";
import { SkipLinks } from "@/components/ui/skip-links";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClinvetIA - IA para Clínicas Veterinarias",
  description: "Sistema de atención inteligente para clínicas veterinarias. Automatiza la atención al cliente, gestiona citas y mejora la experiencia de tus clientes.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={
          `${geistSans.variable} ${geistMono.variable} min-h-dvh bg-background text-foreground font-sans antialiased`
        }
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <SkipLinks />
          <React.Suspense fallback={null}>
            <PageTransition>
              {children}
            </PageTransition>
          </React.Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
