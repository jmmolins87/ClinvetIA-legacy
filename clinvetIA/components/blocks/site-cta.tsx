import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export interface SiteCtaProps {
  className?: string;
  title?: string;
  description?: string;
  icon?: IconName;

  demoLabel?: string;
  demoHref?: string;
  roiLabel?: string;
  roiHref?: string;

  contactLabel?: string;
  contactHref?: string;
}

export function SiteCta({
  className,
  title = "Listo para verlo en tu clinica?",
  description = "Reserva una demo o calcula el impacto en tu ROI.",
  icon = "Sparkles",
  demoLabel = "Reservar demo",
  demoHref = "/reservar",
  roiLabel = "ROI",
  roiHref = "/roi",

  contactLabel = "Contacto",
  contactHref = "/contacto",
}: SiteCtaProps) {
  return (
    <section
      aria-label="Llamada a la accion"
      className={cn(
        "rounded-2xl border border-border bg-background/50 backdrop-blur-sm p-7 md:p-8 text-center home-reflections ambient-section shadow-xl dark:shadow-primary/10",
        className
      )}
    >
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gradient-from to-gradient-to flex items-center justify-center dark:glow-primary">
          <Icon name={icon} className="w-6 h-6 text-white dark:text-black" />
        </div>
      </div>
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
        {title}
      </h2>
      <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
        {description}
      </p>
      <div className="mt-6 flex flex-col md:flex-row gap-3 justify-center">
        <Button
          variant="default"
          size="lg"
          asChild
          className="h-12 w-full md:w-auto dark:glow-primary"
        >
          <Link href={roiHref}>{roiLabel}</Link>
        </Button>
        <Button
          variant="secondary"
          size="lg"
          asChild
          className="h-12 w-full md:w-auto"
        >
          <Link href={demoHref}>{demoLabel}</Link>
        </Button>
        <Button
          variant="tertiary"
          size="lg"
          asChild
          className="h-12 w-full md:w-auto"
        >
          <Link href={contactHref}>{contactLabel}</Link>
        </Button>
      </div>
    </section>
  );
}
