import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";

import { I18nProvider } from "@/components/providers/i18n-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { PageLoaderProvider } from "@/components/providers/page-loader-provider";
import { AppShell } from "@/components/blocks/app-shell";

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

export default function MainLayout({
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
          <I18nProvider>
            <PageLoaderProvider>
              <AppShell>{children}</AppShell>
            </PageLoaderProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
