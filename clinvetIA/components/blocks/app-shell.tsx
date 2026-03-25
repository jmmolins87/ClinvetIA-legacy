"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { SiteFooter } from "@/components/blocks/site-footer";
import { SiteHeader } from "@/components/blocks/site-header";
import { AiAssistantDock } from "@/components/blocks/ai-assistant-dock";

export function AppShell({ children }: { children: React.ReactNode }): React.JSX.Element {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  // Pages that have integrated footer (using SectionCtaFooter component)
  const hasIntegratedFooter = ["/", "/solucion", "/escenarios", "/como-funciona", "/roi"].includes(pathname);

  // Pages without header/footer/AI dock (404, etc)
  const noShell = pathname === "/404";

  if (noShell) {
    return (
      <div className="min-h-dvh w-full">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <SiteHeader mobileMenuOpen={isMobileMenuOpen} onMobileMenuChange={setIsMobileMenuOpen} />
      <main
        className={isHome ? "w-full flex-1 mt-[calc(-1*var(--site-header-h))]" : "w-full flex-1 flex flex-col mt-[calc(-1*var(--site-header-h))]"}
      >
        {children}
      </main>
      {hasIntegratedFooter ? null : <SiteFooter />}
      {!isMobileMenuOpen && <AiAssistantDock />}
    </div>
  );
}
