"use client";

import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import { AppShell } from "@/components/blocks/app-shell";
import { useTranslation } from "@/components/providers/i18n-provider";
import { SectionCtaFooter } from "@/components/blocks/section-cta-footer";
import { Icon, type IconName } from "@/components/ui/icon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const SCENARIO = {
  id: "veterinary",
  icon: "Heart",
  color: "from-pink-500 via-fuchsia-600 to-pink-600 dark:from-orange-500 dark:via-amber-600 dark:to-amber-500",
} as const;

const CASES = ["midnight", "postSurgery", "chronic", "vaccines", "preventive", "multiservice", "results", "firstVisit"] as const;

const BADGE_ICONS: Record<string, IconName> = {
  midnight: "BellRing",
  postSurgery: "ClipboardList",
  chronic: "HeartPulse",
  vaccines: "Syringe",
  preventive: "ShieldCheck",
  multiservice: "Layers",
  results: "FileText",
  firstVisit: "Users",
};

const CASE_IMAGES: Record<string, string> = {
  midnight: "/use-cases/urgencia-nocturna.jpeg",
  postSurgery: "/use-cases/post-operatorio.jpeg",
  chronic: "/use-cases/enfermedad-cronica.jpeg",
  vaccines: "/use-cases/recordatorio-vac.jpeg",
  preventive: "/use-cases/deteccion-temprana.jpeg",
  multiservice: "/use-cases/peluqueria-consulta.jpeg",
  results: "/use-cases/comun-proactiva.jpeg",
  firstVisit: "/use-cases/cachorro.jpeg",
};


export default function EscenariosPage() {
  const { t } = useTranslation();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const toggleCard = (caseId: string) => {
    setExpandedCard((prev) => (prev === caseId ? null : caseId));
  };

  return (
    <AppShell>
      <section className="ambient-section home-surface-footer home-shadow-footer text-foreground pb-[80px]">
        <div className="page-hero-content container relative z-10 mx-auto max-w-screen-xl px-4 pb-12 md:pb-16">
          <div className="max-w-4xl mx-auto text-center space-y-4 mb-12">
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${SCENARIO.color} flex items-center justify-center shadow-lg dark:glow-primary`}>
                <Icon name={SCENARIO.icon} className="w-8 h-8 text-white dark:text-black" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {t(`scenarios.${SCENARIO.id}.title`)}
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto">
              {t(`scenarios.${SCENARIO.id}.subtitle`)}
            </p>
          </div>
          <div className="max-w-7xl mx-auto">
            <div className="grid gap-6 md:grid-cols-2">
              {CASES.map((caseId) => (
                <div key={caseId} className="flex flex-col gap-3">
                  <h3 className="text-2xl font-medium text-gradient-to dark:text-primary flex items-center gap-2">
                    <Icon name={BADGE_ICONS[caseId]} size={30} />
                    {t(`scenarios.veterinary.cases.items.${caseId}.badge`)}
                  </h3>
                  <div className="md:hidden">
                    <Dialog>
                      <DialogTrigger asChild>
                        <div
                          className="group relative rounded-2xl border border-border bg-card/80 backdrop-blur-sm transition-all hover:border-primary/40 hover:shadow-xl dark:hover:shadow-primary/15 overflow-hidden aspect-video cursor-pointer"
                        >
                          <Image 
                            src={CASE_IMAGES[caseId]} 
                            alt={t(`scenarios.veterinary.cases.items.${caseId}.title`)} 
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Icon name="Eye" className="w-10 h-10 text-white/30" />
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl">
                            {t(`scenarios.veterinary.cases.items.${caseId}.title`)}
                          </DialogTitle>
                          <DialogDescription className="text-base">
                            {t(`scenarios.veterinary.cases.items.${caseId}.story`)}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="rounded-xl border border-destructive/60 bg-destructive/10 p-4">
                          <p className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                            <Icon name="MessageCircleQuestionMark" />
                            {t("scenarios.veterinary.cases.ownerMessageLabel")}
                          </p>
                          <p className="text-sm text-foreground leading-relaxed">
                            &quot;{t(`scenarios.veterinary.cases.items.${caseId}.ownerMessage`)}&quot;
                          </p>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2 mt-4">
                          <div className="rounded-xl border border-green-500/60 bg-green-500/10 p-4">
                            <p className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                              <Icon name="Lightbulb" />
                              {t("scenarios.veterinary.cases.systemDoesLabel")}
                            </p>
                            <p className="text-sm text-foreground/80 leading-relaxed">
                              {t(`scenarios.veterinary.cases.items.${caseId}.system`)}
                            </p>
                          </div>
                          <div className="rounded-xl border border-green-500/60 bg-green-500/10 p-4">
                            <p className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                              <Icon name="Check" />
                              {t("scenarios.veterinary.cases.outcomeLabel")}
                            </p>
                            <p className="text-sm text-foreground/80 leading-relaxed">
                              {t(`scenarios.veterinary.cases.items.${caseId}.outcome`)}
                            </p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div
                    className={`hidden md:block group relative rounded-2xl border border-border bg-card/80 backdrop-blur-sm transition-all hover:border-primary/40 hover:shadow-xl dark:hover:shadow-primary/15 overflow-hidden aspect-video cursor-auto ${expandedCard === caseId ? "expanded" : ""}`}
                    onClick={() => toggleCard(caseId)}
                    onKeyDown={(e) => e.key === "Enter" && toggleCard(caseId)}
                    role="button"
                    tabIndex={0}
                    aria-expanded={expandedCard === caseId}
                  >
                    <Image 
                      src={CASE_IMAGES[caseId]} 
                      alt={t(`scenarios.veterinary.cases.items.${caseId}.title`)} 
                      fill
                      className="object-cover transition-all duration-300 group-hover:scale-110 group-hover:brightness-50 group-hover:blur-[2px] md:group-[&:not(:hover)]:group-[&:not(.expanded)]:brightness-100"
                    />
                    <div 
                      className="absolute inset-0 bg-black/80 p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:[&:not(:hover)]:opacity-0 data-[expanded=true]:opacity-100"
                      data-expanded={expandedCard === caseId}
                    >
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h4 className="text-lg md:text-xl font-bold text-white">
                            {t(`scenarios.veterinary.cases.items.${caseId}.title`)}
                          </h4>
                        </div>

                        <p className="text-sm text-white/80 leading-relaxed">
                          {t(`scenarios.veterinary.cases.items.${caseId}.story`)}
                        </p>

                        <div className="rounded-xl border border-destructive/60 bg-destructive/10 p-4">
                          <p className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                            <Icon name="MessageCircleQuestionMark" />
                            {t("scenarios.veterinary.cases.ownerMessageLabel")}
                          </p>
                          <p className="text-sm text-white leading-relaxed">
                            &quot;{t(`scenarios.veterinary.cases.items.${caseId}.ownerMessage`)}&quot;
                          </p>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="rounded-xl border border-green-500/60 bg-green-500/10 p-4">
                            <p className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                              <Icon name="Lightbulb" />
                              {t("scenarios.veterinary.cases.systemDoesLabel")}
                            </p>
                            <p className="text-sm text-white/80 leading-relaxed">
                              {t(`scenarios.veterinary.cases.items.${caseId}.system`)}
                            </p>
                          </div>
                          <div className="rounded-xl border border-green-500/60 bg-green-500/10 p-4">
                            <p className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                              <Icon name="Check" />
                              {t("scenarios.veterinary.cases.outcomeLabel")}
                            </p>
                            <p className="text-sm text-white/80 leading-relaxed">
                              {t(`scenarios.veterinary.cases.items.${caseId}.outcome`)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionCtaFooter
        ariaLabel={t("scenarios.cta.title")}
        title={t("scenarios.cta.title")}
        description={t("scenarios.cta.description")}
        demoLabel={t("scenarios.cta.demo")}
        demoHref="/reservar"
        roiLabel={t("scenarios.cta.roi")}
        roiHref="/roi"
        sectionClassName="ambient-section"
      />
    </AppShell>
  );
}
