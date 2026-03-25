import * as React from "react";

import { SiteCta } from "@/components/blocks/site-cta";
import { SiteFooter } from "@/components/blocks/site-footer";
import { cn } from "@/lib/utils";

export interface SectionCtaFooterProps {
  id?: string;
  ariaLabel: string;
  title: string;
  description: string;
  demoLabel: string;
  demoHref: string;
  roiLabel: string;
  roiHref: string;
  sectionClassName?: string;
  surfaceClassName?: string;
  shadowClassName?: string;
  parallaxSpeed?: number;
}

export function SectionCtaFooter({
  id,
  ariaLabel,
  title,
  description,
  demoLabel,
  demoHref,
  roiLabel,
  roiHref,
  sectionClassName,
  surfaceClassName,
  shadowClassName,
  parallaxSpeed,
}: SectionCtaFooterProps): React.JSX.Element {
  return (
    <section
      id={id}
      data-parallax-speed={
        typeof parallaxSpeed === "number" ? String(parallaxSpeed) : undefined
      }
      className={cn(
        "home-section flex flex-col",
        "final-cta-section",
        "overflow-hidden",
        surfaceClassName,
        shadowClassName,
        sectionClassName,
      )}
      aria-label={ariaLabel}
    >
      <div className="flex-1 flex items-center">
        <div
          className="home-section-content mx-auto w-full max-w-screen-2xl px-4 flex flex-col justify-center"
          data-reveal
          data-reveal-children
        >
          <div className="max-w-3xl mx-auto" data-reveal-item>
            <SiteCta
              title={title}
              description={description}
              demoLabel={demoLabel}
              demoHref={demoHref}
              roiLabel={roiLabel}
              roiHref={roiHref}
            />
          </div>
        </div>
      </div>

      <SiteFooter density="compact" className="bg-transparent" />
    </section>
  );
}
