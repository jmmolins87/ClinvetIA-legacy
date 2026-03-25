"use client";

import Link from "next/link";

import { SectionCtaFooter } from "@/components/blocks/section-cta-footer";
import { HeroBackground } from "@/components/blocks/hero-background";
import { useTranslation } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import {
  NeonCard,
  NeonCardDescription,
  NeonCardHeader,
  NeonCardTitle,
} from "@/components/ui/neon-card";
import { Stepper } from "@/components/ui/stepper";

const DAY_ITEMS_COUNT = 5;
const HOW_STEPS_COUNT = 4;
const FLOW_ITEMS_COUNT = 4;
const GUARDRAILS_COUNT = 4;

const FLOW_ICONS: IconName[] = [
  "MessageCircle",
  "CircleCheck",
  "Calendar",
  "BellRing",
];

const GUARDRAIL_ICONS: IconName[] = [
  "Shield",
  "UserCheck",
  "CircleAlert",
  "MessageSquare",
];

const FIT_CARD_TYPES = [
  "aesthetics",
  "dental",
  "physio",
  "veterinary",
  "emergency",
  "vaccines",
  "chronic",
  "multiservice",
] as const;

export default function SolucionPage(): React.JSX.Element {
  const { t } = useTranslation();

  const dayItems = Array.from({ length: DAY_ITEMS_COUNT }, (_, idx) =>
    t(`solution.day.items.${idx}`)
  );

  const howSteps = Array.from({ length: HOW_STEPS_COUNT }, (_, idx) =>
    t(`solution.how.steps.${idx}`)
  );

  const flowItems = Array.from({ length: FLOW_ITEMS_COUNT }, (_, idx) =>
    t(`solution.flow.items.${idx}`)
  );

  const guardrails = Array.from({ length: GUARDRAILS_COUNT }, (_, idx) =>
    t(`solution.guardrails.items.${idx}`)
  );

  return (
    <div className="w-full">
      <section
        className="ambient-section relative overflow-hidden text-foreground"
        aria-label={t("solution.hero.title")}
      >
        <HeroBackground className="absolute inset-0" />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent"
        />

        <div className="page-hero-content mx-auto w-full max-w-screen-2xl px-4">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-gradient-from to-gradient-to text-primary-foreground shadow-sm dark:glow-sm">
              <Icon name="Sparkles" size={30} aria-label={t("solution.hero.title")} />
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t("solution.hero.heading")}
            </h1>
            <p className="mt-4 text-xl font-semibold text-gradient-to dark:text-primary sm:text-2xl">
              {t("solution.hero.claimLight")}
            </p>
            <p className="mx-auto mt-4 max-w-3xl text-base font-medium text-foreground/85 sm:text-lg lg:max-w-4xl lg:text-xl">
              {t("solution.hero.subheading")}
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button variant="secondary" size="lg" className="h-12 w-full sm:w-auto" asChild>
                <Link href="/reservar">{t("solution.cta.primary")}</Link>
              </Button>
              <Button
                variant="default"
                size="lg"
                className="h-12 w-full sm:w-auto dark:glow-primary"
                asChild
              >
                <Link href="/roi">{t("solution.cta.secondary")}</Link>
              </Button>
            </div>

            <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground">
              {t("solution.cta.note")}
            </p>
          </div>
        </div>
      </section>

      <section className="ambient-section text-foreground" aria-label={t("solution.what.title")}>
        <div className="mx-auto w-full max-w-screen-2xl px-4 py-14 md:py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              {t("solution.what.title")}
            </h2>

            <div className="mx-auto mt-6 max-w-4xl space-y-4 text-center">
              <p className="text-base text-foreground/85 sm:text-lg">
                {t("solution.what.p1")}
              </p>
              <p className="text-sm text-muted-foreground sm:text-base">
                {t("solution.what.p2")}
              </p>
            </div>

            <NeonCard className="mx-auto mt-10 max-w-4xl bg-gradient-to-br from-destructive/10 to-accent/10 dark:from-destructive/15 dark:to-accent/15">
              <NeonCardHeader className="items-center text-center">
                <div className="text-destructive">
                  <Icon name="CircleAlert" size={28} aria-label={t("solution.keyMessage")} />
                </div>
                <NeonCardTitle className="mt-3 text-xl text-destructive">
                  {t("solution.keyMessage")}
                </NeonCardTitle>
              </NeonCardHeader>
            </NeonCard>
          </div>
        </div>
      </section>

      <section className="ambient-section text-foreground" aria-label={t("solution.day.title")}>
        <div className="mx-auto w-full max-w-screen-2xl px-4 py-14 md:py-20">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("solution.day.title")}
            </h2>
          </div>

          <div className="mx-auto mt-10 grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {dayItems.map((item) => (
              <NeonCard key={item} className="bg-card/80 backdrop-blur-sm" hover glow>
                <NeonCardHeader className="flex-row items-start gap-4">
                  <div className="mt-0.5 shrink-0 text-gradient-to dark:text-primary">
                    <Icon name="CircleCheck" size={28} aria-label={t("solution.day.title")} />
                  </div>
                  <NeonCardDescription className="mt-0 text-sm leading-relaxed text-foreground/85">
                    {item}
                  </NeonCardDescription>
                </NeonCardHeader>
              </NeonCard>
            ))}
          </div>
        </div>
      </section>

      <section className="ambient-section text-foreground" aria-label={t("solution.how.title")}>
        <div className="mx-auto w-full max-w-screen-2xl px-4 py-14 md:py-20">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("solution.how.title")}
            </h2>
          </div>

          <div className="mx-auto mt-10 max-w-6xl">
            <Stepper
              variant="cards"
              className="md:grid-cols-2"
              steps={howSteps.map((step, idx) => {
                const icons: IconName[] = ["Settings", "Workflow", "Shield", "Play"];
                return {
                  key: String(idx),
                  icon: icons[idx] ?? "Sparkles",
                  title: step,
                };
              })}
            />
          </div>
        </div>
      </section>

      <section className="ambient-section text-foreground" aria-label={t("solution.flow.title")}>
        <div className="mx-auto w-full max-w-screen-2xl px-4 py-14 md:py-20">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("solution.flow.title")}
            </h2>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-2 md:gap-6">
            {flowItems.map((label, idx) => (
              <NeonCard key={label} className="bg-card/80 backdrop-blur-sm" hover glow>
                <NeonCardHeader className="flex-row items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-gradient-from to-gradient-to text-primary-foreground shadow-sm dark:glow-sm">
                    <Icon name={FLOW_ICONS[idx] ?? "Sparkles"} size={22} aria-label={label} />
                  </div>
                  <NeonCardTitle className="text-xl leading-tight">{label}</NeonCardTitle>
                </NeonCardHeader>
              </NeonCard>
            ))}
          </div>
        </div>
      </section>

      <section
        className="ambient-section text-foreground"
        aria-label={t("solution.guardrails.title")}
      >
        <div className="mx-auto w-full max-w-screen-2xl px-4 py-14 md:py-20">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("solution.guardrails.title")}
            </h2>
          </div>

          <div className="mx-auto mt-10 grid max-w-6xl gap-4 md:grid-cols-2 md:gap-6">
            {guardrails.map((item, idx) => (
              <NeonCard
                key={item}
                className="bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/15 dark:to-accent/15"
                hover
                glow
              >
                <NeonCardHeader className="flex-row items-start gap-4">
                  <div className="mt-0.5 shrink-0 text-gradient-to dark:text-primary">
                    <Icon
                      name={GUARDRAIL_ICONS[idx] ?? "Sparkles"}
                      size={28}
                      aria-label={t("solution.guardrails.title")}
                    />
                  </div>
                  <NeonCardDescription className="mt-0 text-sm leading-relaxed text-foreground/85">
                    {item}
                  </NeonCardDescription>
                </NeonCardHeader>
              </NeonCard>
            ))}
          </div>
        </div>
      </section>

      <section className="ambient-section text-foreground" aria-label={t("solution.fit.title")}>
        <div className="mx-auto w-full max-w-screen-2xl px-4 py-14 md:py-20">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("solution.fit.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-base text-foreground/80 sm:text-lg">
              {t("solution.fit.description")}
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-6">
            {FIT_CARD_TYPES.map((type) => (
              <NeonCard key={type} className="bg-card/80 backdrop-blur-sm" hover glow>
                <NeonCardHeader className="items-center text-center">
                  <NeonCardTitle className="text-lg text-gradient-to dark:text-primary">
                    {t(`solution.fit.cards.${type}.title`)}
                  </NeonCardTitle>
                  <div className="mt-4 w-full space-y-3 text-left">
                    <div className="text-sm text-muted-foreground">
                      {t(`solution.fit.cards.${type}.situation`)}
                    </div>
                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                      {t(`solution.fit.cards.${type}.problem`)}
                    </div>
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                      {t(`solution.fit.cards.${type}.change`)}
                    </div>
                  </div>
                </NeonCardHeader>
              </NeonCard>
            ))}
          </div>

          <div className="mx-auto mt-10 flex max-w-6xl justify-center">
            <Button variant="secondary" size="lg" className="h-12" asChild>
              <Link href="/escenarios">{t("solution.fit.linkText")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <SectionCtaFooter
        id="final-cta-section"
        parallaxSpeed={0.35}
        ariaLabel={t("home.final.title")}
        title={t("home.final.title")}
        description={t("home.final.lead")}
        demoLabel={t("home.final.ctaPrimary")}
        demoHref="/reservar"
        roiLabel={t("home.final.ctaSecondary")}
        roiHref="/roi"
        sectionClassName="ambient-section"
      />
    </div>
  );
}
