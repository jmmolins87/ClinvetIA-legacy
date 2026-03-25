"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

import { SiteLanguageSwitcher } from "@/components/blocks/site-language-switcher";
import { SiteThemeDropdown } from "@/components/blocks/site-theme-dropdown";
import { Logo } from "@/components/logo";
import { useTranslation } from "@/components/providers/i18n-provider";

const NAV_LINKS = [
  { href: "/solucion", labelKey: "nav.solution" },
  { href: "/escenarios", labelKey: "nav.scenarios" },
  { href: "/como-funciona", labelKey: "nav.howItWorks" },

  { href: "/contacto", labelKey: "nav.contact" },
] as const;

export function SiteHeader({ 
  className, 
  mobileMenuOpen, 
  onMobileMenuChange 
}: { 
  className?: string;
  mobileMenuOpen?: boolean;
  onMobileMenuChange?: (open: boolean) => void;
}) {
  const { t, lang, setLang } = useTranslation();
  const [internalIsOpen, setInternalIsOpen] = React.useState(false);
  
  // Use controlled state if props are provided, otherwise use internal state
  const isOpen = mobileMenuOpen !== undefined ? mobileMenuOpen : internalIsOpen;
  const setIsOpen = onMobileMenuChange || setInternalIsOpen;
  const pathnameFromNext = usePathname();
  const router = useRouter();
  const pathname = pathnameFromNext;
  const isHomePage = pathname === "/";

  const [showHeaderLogo, setShowHeaderLogo] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const showSurface = isScrolled;

  const handleMobileLogoClick = React.useCallback(() => {
    setIsOpen(false);

    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    router.push("/");
  }, [pathname, router, setIsOpen]);

  const navRef = React.useRef<HTMLElement | null>(null);
  const linkRefs = React.useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicator, setIndicator] = React.useState<{
    left: number;
    width: number;
    opacity: number;
  }>({ left: 0, width: 0, opacity: 0 });

  const activeHref = React.useMemo(() => {
    const activeLink = NAV_LINKS.find((l) => l.href === pathname);
    return activeLink?.href ?? null;
  }, [pathname]);

  const setIndicatorToHref = React.useCallback((href: string) => {
    const navEl = navRef.current;
    const linkEl = linkRefs.current[href];

    if (!navEl || !linkEl) {
      setIndicator((prev) => ({ ...prev, opacity: 0 }));
      return;
    }

    const navRect = navEl.getBoundingClientRect();
    const linkRect = linkEl.getBoundingClientRect();
    const left = linkRect.left - navRect.left;
    const width = linkRect.width;
    setIndicator({ left, width, opacity: 1 });
  }, []);

  React.useLayoutEffect(() => {
    if (!activeHref) {
      setIndicator((prev) => ({ ...prev, opacity: 0 }));
      return;
    }

    setIndicatorToHref(activeHref);
  }, [activeHref, setIndicatorToHref]);

  React.useEffect(() => {
    if (!activeHref) return;

    const handleResize = () => setIndicatorToHref(activeHref);
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [activeHref, setIndicatorToHref]);

  const handleNavMouseLeave = () => {
    if (!activeHref) {
      setIndicator((prev) => ({ ...prev, opacity: 0 }));
      return;
    }

    setIndicatorToHref(activeHref);
  };

  const handleNavBlurCapture = (event: React.FocusEvent<HTMLElement>) => {
    if (!activeHref) {
      setIndicator((prev) => ({ ...prev, opacity: 0 }));
      return;
    }

    const next = event.relatedTarget as Node | null;
    if (next && navRef.current?.contains(next)) return;
    setIndicatorToHref(activeHref);
  };

  const indicatorStyle: React.CSSProperties = {
    left: 0,
    width: indicator.width,
    opacity: indicator.opacity,
    transform: `translateX(${indicator.left}px)`,
  };

  React.useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.documentElement.style.overflow = "hidden";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.documentElement.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseFloat(scrollY.slice(1)) * -1);
      }
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollThreshold = 300;

      setIsScrolled(scrollY > 50);
      if (isHomePage) setShowHeaderLogo(scrollY > scrollThreshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        showSurface
          ? "site-header-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          : "bg-transparent",
        className
      )}
    >
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4">
        {isHomePage ? (
          <>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center cursor-pointer md:hidden rounded-md outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              aria-label={t("common.scrollTop")}
            >
              <Logo priority className="h-12" />
            </button>
            {showHeaderLogo && (
              <button
                type="button"
                 onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                 className="hidden md:flex items-center cursor-pointer rounded-md outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                 aria-label={t("common.scrollTop")}
               >
                 <Logo width={220} height={55} className="h-14" />
               </button>
            )}
          </>
        ) : (
          <Link
            href="/"
            className="flex items-center cursor-pointer rounded-md outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            aria-label={t("common.brand")}
          >
            <Logo priority className="h-12 md:h-14" />
          </Link>
        )}

        <div className="flex items-center gap-6 ml-auto">
          <nav
            ref={navRef}
            className="hidden relative items-center gap-6 md:flex"
            aria-label={t("common.primaryNav")}
            onMouseLeave={handleNavMouseLeave}
            onBlurCapture={handleNavBlurCapture}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-1 h-0.5 rounded-full bg-linear-to-r from-gradient-from to-gradient-to transition-[transform,width,opacity] duration-300 ease-out motion-reduce:transition-none"
              style={indicatorStyle}
            />
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  ref={(el) => {
                    linkRefs.current[link.href] = el;
                  }}
                  onMouseEnter={() => setIndicatorToHref(link.href)}
                  onFocus={() => setIndicatorToHref(link.href)}
                  className={cn(
                    "relative z-10 py-1 text-sm font-medium transition-colors hover:text-gradient-to focus-visible:outline-none",
                    isActive ? "text-gradient-to" : "text-foreground"
                  )}
                >
                  {t(link.labelKey)}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <SiteLanguageSwitcher
              defaultLanguage={lang}
              onChange={setLang}
              className="h-12 rounded-md border border-border/40 bg-transparent px-3 hover:bg-gradient-to/10 dark:hover:bg-primary/10"
            />
            <SiteThemeDropdown />
            <Button
              variant="default"
              size="lg"
              className="h-12 dark:glow-primary"
              asChild
            >
              <Link href="/roi">{t("common.roi")}</Link>
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="h-12"
              asChild
            >
              <Link href="/reservar">{t("common.bookDemo")}</Link>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-12 w-12"
            aria-label={t("common.menu")}
            onClick={() => setIsOpen(true)}
          >
            <Icon name="Menu" className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-[60] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={t("common.menu")}
        >
          <div
            className="fixed inset-0 bg-background/70 supports-[backdrop-filter]:bg-background/55 backdrop-blur-2xl"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-x-0 top-0 h-[100dvh] w-full flex flex-col bg-background/80 supports-[backdrop-filter]:bg-background/60 backdrop-blur-xl animate-in slide-in-from-top duration-300 overflow-hidden">
            <div className="flex-1 flex flex-col justify-center p-6">
              <div className="mb-6 flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleMobileLogoClick}
                  className="inline-flex cursor-pointer rounded-md outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  aria-label={t("common.scrollTop")}
                >
                  <Logo width={220} height={55} className="h-14" priority />
                </button>
              </div>

              <nav className="flex flex-col items-center gap-5">
                {NAV_LINKS.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "text-xl font-medium transition-colors text-center",
                        isActive
                          ? "text-gradient-to"
                          : "text-foreground hover:text-gradient-to"
                      )}
                    >
                      {t(link.labelKey)}
                    </Link>
                  );
                })}

                <div className="mx-auto mt-4 flex flex-col items-center justify-center gap-3">
                  <SiteLanguageSwitcher
                    defaultLanguage={lang}
                    onChange={setLang}
                    className="h-12 rounded-lg border border-border/40 bg-transparent px-4"
                  />
                  <SiteThemeDropdown size="large" />
                </div>

                <div className="mt-3 flex flex-col gap-3 w-full max-w-sm">
                  <Button
                    variant="default"
                    size="lg"
                    className="h-12 dark:glow-primary"
                    asChild
                  >
                    <Link href="/roi" onClick={() => setIsOpen(false)}>
                      {t("common.roi")}
                    </Link>
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="h-12"
                    asChild
                  >
                    <Link href="/reservar" onClick={() => setIsOpen(false)}>
                      {t("common.bookDemo")}
                    </Link>
                  </Button>
                </div>
              </nav>
            </div>

            <div className="p-6 border-t border-border/50 backdrop-blur-sm">
              <Button
                variant="ghost"
                size="default"
                onClick={() => setIsOpen(false)}
                className="w-full cursor-pointer flex items-center justify-center gap-2 text-lg font-medium hover:bg-primary/10"
                aria-label={t("common.close")}
              >
                <Icon name="X" className="h-6 w-6" />
                {t("common.close")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
