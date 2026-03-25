"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { useTranslation } from "@/components/providers/i18n-provider";

const FOOTER_LINKS = {
  product: [
    { href: "/solucion", labelKey: "footer.links.solution" },
    { href: "/escenarios", labelKey: "footer.links.useCases" },
    { href: "/roi", labelKey: "footer.links.roiCalc" },
    { href: "/como-funciona", labelKey: "footer.links.howItWorks" },
  ],
  company: [
    { href: "/faqs", labelKey: "footer.links.faqs" },
    { href: "/contacto", labelKey: "footer.links.contact" },
  ],
} as const;

export function SiteFooter({
  className,
  density = "default",
}: {
  className?: string;
  density?: "default" | "compact";
}) {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  const isCompact = density === "compact";

  return (
    <footer className={cn("border-t border-border/40 bg-background home-reflections home-surface-footer home-shadow-footer", className)}>
      <div
        className={cn(
          "container mx-auto max-w-screen-2xl px-4",
          isCompact ? "py-8" : "py-12"
        )}
      >
        <div className={cn("grid md:grid-cols-2 lg:grid-cols-4", isCompact ? "gap-6" : "gap-8")}>
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-block cursor-pointer rounded-md outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              aria-label={t("common.scrollTop")}
            >
              <Logo className="h-14" />
            </button>
            <p className="text-sm text-muted-foreground">
              {t("footer.about")}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t("footer.product")}</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t("footer.company")}</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t("footer.start")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("footer.startLead")}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="default"
                size="lg"
                className="h-12 dark:glow-primary"
                asChild
              >
                <Link href="/roi">
                  <span className="flex items-center gap-2">
                    <Icon name="Calculator" className="h-4 w-4" />
                    {t("common.roi")}
                  </span>
                </Link>
              </Button>
              <Button variant="secondary" size="lg" className="h-12" asChild>
                <Link href="/reservar">
                  <span className="flex items-center gap-2">
                    <Icon name="Calendar" className="h-4 w-4" />
                    {t("common.bookDemo")}
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <Separator className={cn(isCompact ? "my-6" : "my-8")} />

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {year} Clinvetia. {t("footer.rights")}
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacidad"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("footer.privacy")}
            </Link>
            <Link
              href="/terminos"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("footer.terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
