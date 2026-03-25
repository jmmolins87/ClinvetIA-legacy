"use client";

import * as React from "react";

import { useTranslation } from "@/components/providers/i18n-provider";
import { useLenis } from "@/components/providers/lenis-provider";

type Section = {
  id: string;
  labelKey: string;
};

const SECTIONS: Section[] = [
  { id: "hero", labelKey: "home.sectionNav.hero" },
  { id: "problem-section", labelKey: "home.sectionNav.problem" },
  { id: "system-section", labelKey: "home.sectionNav.system" },
  { id: "flow-section", labelKey: "home.sectionNav.flow" },
  { id: "benefits-section", labelKey: "home.sectionNav.benefits" },
  { id: "scenarios-section", labelKey: "home.sectionNav.scenarios" },
  { id: "roi-section", labelKey: "home.sectionNav.roi" },
  { id: "final-cta-section", labelKey: "home.sectionNav.final" },
];

function getHeaderHeightPx(): number {
  if (typeof window === "undefined") return 64;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--site-header-h")
    .trim();
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 64;
}

export function ActiveSectionIndicator(): React.JSX.Element {
  const { t } = useTranslation();
  const { lenis } = useLenis();
  const [activeSection, setActiveSection] = React.useState<string>("hero");

  React.useEffect(() => {
    const headerH = getHeaderHeightPx();

    const handleScroll = () => {
      const referenceY = window.scrollY + headerH + 1;
      let next = "hero";

      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (!el) continue;
        const top = el.offsetTop;
        const bottom = top + el.offsetHeight;
        if (referenceY >= top && referenceY < bottom) {
          next = section.id;
          break;
        }
      }

      setActiveSection((prev) => (prev === next ? prev : next));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const handleClick = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (!el) return;

    if (lenis) {
      lenis.scrollTo(el, { offset: 0 });
      return;
    }

    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <nav
      className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden xl:block"
      aria-label={t("aria.sectionNavigation")}
    >
      <ul className="flex flex-col gap-3">
        {SECTIONS.map((section) => (
          <li key={section.id}>
            <button
              type="button"
              onClick={() => handleClick(section.id)}
              className={
                "group relative block transition-all duration-300 cursor-pointer " +
                (activeSection === section.id ? "scale-110" : "scale-100 hover:scale-110")
              }
              aria-label={t(section.labelKey)}
              aria-current={activeSection === section.id ? "location" : undefined}
            >
              <div
                className={
                  "h-3 w-3 rounded-full border-2 transition-all duration-300 " +
                  (activeSection === section.id
                    ? "bg-gradient-to border-gradient-to shadow-lg shadow-gradient-to/50 dark:bg-primary dark:border-primary dark:shadow-primary/50 dark:glow-primary"
                    : "bg-transparent border-muted-foreground/30 hover:border-gradient-to/50 dark:hover:border-primary/50")
                }
              />
              <span
                className={
                  "pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium bg-card border border-border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 " +
                  (activeSection === section.id ? "text-gradient-to dark:text-primary" : "text-foreground")
                }
              >
                {t(section.labelKey)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
