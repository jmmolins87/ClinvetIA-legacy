"use client";

import Link from "next/link";

import { HomeEffects } from "@/app/home-effects";
import { HeroBackground } from "@/components/blocks/hero-background";
import { ActiveSectionIndicator } from "@/components/blocks/active-section-indicator";
import { SectionCtaFooter } from "@/components/blocks/section-cta-footer";
import { Logo } from "@/components/logo";
import { useTranslation } from "@/components/providers/i18n-provider";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { Icon, type IconName } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { ScrollDownButton } from "@/components/ui/scroll-down-button";
import {
  NeonCard,
  NeonCardDescription,
  NeonCardHeader,
  NeonCardTitle,
} from "@/components/ui/neon-card";
import { Stepper } from "@/components/ui/stepper";

export default function Home() {
  const { t } = useTranslation();

  const parseCountup = (text: string) => {
    const trimmed = text.trim();
    const firstDigit = trimmed.search(/[0-9]/);
    if (firstDigit < 0) return null;

    let last = -1;
    for (let i = trimmed.length - 1; i >= 0; i -= 1) {
      if (/[0-9]/.test(trimmed[i])) {
        last = i;
        break;
      }
    }
    if (last < firstDigit) return null;

    const prefix = trimmed.slice(0, firstDigit);
    const numberPart = trimmed.slice(firstDigit, last + 1);
    const suffix = trimmed.slice(last + 1);

    const normalized = numberPart.replace(",", ".");
    const end = Number.parseFloat(normalized);
    if (!Number.isFinite(end)) return null;

    const decimals = normalized.includes(".") ? normalized.split(".")[1]!.length : 0;
    return { prefix, suffix, end, decimals };
  };

  const problemCards = [
    {
      icon: "MessageCircle",
      titleKey: "home.problem.cards.late.title",
      textKey: "home.problem.cards.late.text",
      extraKey: "home.problem.cards.late.extra",
    },
    {
      icon: "Users",
      titleKey: "home.problem.cards.overload.title",
      textKey: "home.problem.cards.overload.text",
      extraKey: "home.problem.cards.overload.extra",
    },
    {
      icon: "CircleAlert",
      titleKey: "home.problem.cards.missed.title",
      textKey: "home.problem.cards.missed.text",
      extraKey: "home.problem.cards.missed.extra",
    },
    {
      icon: "Calendar",
      titleKey: "home.problem.cards.manual.title",
      textKey: "home.problem.cards.manual.text",
      extraKey: "home.problem.cards.manual.extra",
    },
  ] satisfies Array<{ icon: IconName; titleKey: string; textKey: string; extraKey: string }>;

  const featureCards = [
    {
      icon: "Brain",
      titleKey: "home.features.cards.understand.title",
      textKey: "home.features.cards.understand.text",
    },
    {
      icon: "Clock",
      titleKey: "home.features.cards.availability.title",
      textKey: "home.features.cards.availability.text",
    },
    {
      icon: "CalendarCheck",
      titleKey: "home.features.cards.booking.title",
      textKey: "home.features.cards.booking.text",
    },
    {
      icon: "BellRing",
      titleKey: "home.features.cards.followup.title",
      textKey: "home.features.cards.followup.text",
    },
  ] satisfies Array<{ icon: IconName; titleKey: string; textKey: string }>;

  const benefitCards = [
    {
      icon: "Zap",
      titleKey: "home.benefits.cards.urgent.title",
      textKey: "home.benefits.cards.urgent.text",
    },
    {
      icon: "TrendingUp",
      titleKey: "home.benefits.cards.lessCalls.title",
      textKey: "home.benefits.cards.lessCalls.text",
    },
    {
      icon: "Heart",
      titleKey: "home.benefits.cards.calm.title",
      textKey: "home.benefits.cards.calm.text",
    },
    {
      icon: "Target",
      titleKey: "home.benefits.cards.reminders.title",
      textKey: "home.benefits.cards.reminders.text",
    },
  ] satisfies Array<{ icon: IconName; titleKey: string; textKey: string }>;

  const scenarioCards = [
    {
      icon: "CircleAlert",
      titleKey: "home.scenarios.cards.emergency.title",
      textKey: "home.scenarios.cards.emergency.text",
    },
    {
      icon: "Syringe",
      titleKey: "home.scenarios.cards.preventive.title",
      textKey: "home.scenarios.cards.preventive.text",
    },
    {
      icon: "Activity",
      titleKey: "home.scenarios.cards.chronic.title",
      textKey: "home.scenarios.cards.chronic.text",
    },
    {
      icon: "Scissors",
      titleKey: "home.scenarios.cards.multi.title",
      textKey: "home.scenarios.cards.multi.text",
    },
  ] satisfies Array<{ icon: IconName; titleKey: string; textKey: string }>;

  const roiStats = [
    {
      key: "response",
      valueKey: "home.kpi.stats.response.value",
      labelKey: "home.kpi.stats.response.label",
    },
    {
      key: "lost",
      valueKey: "home.kpi.stats.lost.value",
      labelKey: "home.kpi.stats.lost.label",
    },
    {
      key: "growth",
      valueKey: "home.kpi.stats.growth.value",
      labelKey: "home.kpi.stats.growth.label",
    },
  ] as const;

  return (
    <LenisProvider>
      <div className="w-full">
        <HomeEffects />
        <ActiveSectionIndicator />

      <section
        id="hero"
        className="home-section home-hero home-reflections relative w-full overflow-hidden bg-background text-foreground flex flex-col"
        aria-label="Hero"
      >
        <HeroBackground
          className="home-bg parallax-y"
          data-parallax
          data-parallax-speed="0.9"
          gif={{ srcGif: "/gifs/background-home.gif", alt: "Background" }}
        />
        <div
          aria-hidden
          data-parallax
          data-parallax-speed="0.45"
          className="home-bg parallax-y absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent"
        />

        <div
          className="home-section-content mx-auto w-full max-w-screen-2xl px-4 flex-1 flex flex-col"
          data-reveal
          data-reveal-children
        >
            <div className="flex-1 flex flex-col justify-center">
              <div className="mx-auto w-full max-w-7xl text-center">
              <div className="hidden md:flex justify-center" data-reveal-item>
                <Logo
                  width={960}
                  height={240}
                  className="h-20 w-auto sm:h-24 md:h-32 lg:h-40 xl:h-48"
                  priority
                />
              </div>

               <h1
                 className="hero-title mt-6 text-4xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
                 data-reveal-item
               >
                 {t("home.hero.title")}
               </h1>
               <p
                 className="hero-subtitle mx-auto mt-4 max-w-4xl text-lg font-medium text-foreground/85 sm:text-lg md:text-xl lg:max-w-5xl lg:text-2xl"
                 data-reveal-item
               >
                 {t("home.hero.subtitle")}
               </p>

              <div
                className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row"
                data-reveal-item
              >
                <Button
                  variant="secondary"
                  size="lg"
                  className="h-12 w-full sm:w-auto"
                  asChild
                >
                  <Link href="/reservar" data-cta-anim>{t("home.hero.ctaPrimary")}</Link>
                </Button>
                <Button
                  variant="default"
                  size="lg"
                  className="h-12 w-full sm:w-auto dark:glow-primary"
                  asChild
                >
                  <Link href="/roi" data-cta-anim>{t("home.hero.ctaSecondary")}</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="text-center" data-reveal-item>
            <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span>{t("common.discoverMore")}</span>
            </div>
            <div className="flex justify-center">
              <ScrollDownButton
                aria-label={t("common.discoverMore")}
                targetId="problem-section"
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        id="problem-section"
        data-parallax-speed="0.4"
        className="home-section ambient-section flex"
        aria-label={t("home.problem.eyebrow")}
      >
        <div
          className="home-section-content mx-auto w-full max-w-screen-2xl px-4 flex flex-col justify-center"
          data-reveal
          data-reveal-children
        >
          <div className="mx-auto max-w-4xl text-center" data-reveal-item>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {t("home.problem.eyebrow")}
            </h2>
            <p className="mt-3 text-xl font-semibold text-destructive sm:text-2xl">
              {t("home.problem.headline")}
            </p>
            <p className="mt-4 text-base text-foreground/80 sm:text-lg">{t("home.problem.lead")}</p>
          </div>

          <div
            className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-2 md:gap-6"
            data-reveal-item
          >
            {problemCards.map((item) => (
              <NeonCard key={item.titleKey} className="bg-card/80 backdrop-blur-sm" hover glow>
                <NeonCardHeader className="flex-row items-start gap-4">
                  <div className="mt-0.5 shrink-0 text-destructive">
                    <Icon name={item.icon} size={34} aria-label={t(item.titleKey)} />
                  </div>
                  <div className="min-w-0">
                    <NeonCardTitle className="text-xl leading-tight">{t(item.titleKey)}</NeonCardTitle>
                    <NeonCardDescription className="mt-1 text-sm">{t(item.textKey)}</NeonCardDescription>
                    <p className="mt-2 text-xs text-muted-foreground/90">{t(item.extraKey)}</p>
                  </div>
                </NeonCardHeader>
              </NeonCard>
            ))}
          </div>
        </div>
      </section>

      <section
        id="system-section"
        data-parallax-speed="0.35"
        className="home-section ambient-section flex"
        aria-label={t("home.features.title")}
      >
        <div
          className="home-section-content mx-auto w-full max-w-screen-2xl px-4 flex flex-col justify-center"
          data-reveal
          data-reveal-children
        >
          <div className="mx-auto max-w-4xl text-center" data-reveal-item>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {t("home.features.title")}
            </h2>
            <p className="mt-4 text-base text-foreground/80 sm:text-lg">{t("home.features.lead")}</p>
          </div>

          <div
            className="mx-auto mt-10 grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-6"
            data-reveal-item
          >
            {featureCards.map((item) => (
              <NeonCard key={item.titleKey} className="bg-card/80 backdrop-blur-sm" hover glow>
                <NeonCardHeader className="items-center text-center">
                  <div className="text-gradient-to dark:text-primary">
                    <Icon name={item.icon} size={34} aria-label={t(item.titleKey)} />
                  </div>
                  <NeonCardTitle className="mt-4 text-lg">{t(item.titleKey)}</NeonCardTitle>
                  <NeonCardDescription className="mt-2">{t(item.textKey)}</NeonCardDescription>
                </NeonCardHeader>
              </NeonCard>
            ))}
          </div>

          <div className="mx-auto mt-14 max-w-5xl md:mt-16" data-reveal-item>
            <NeonCard className="relative overflow-visible bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20">
              <div className="absolute left-1/2 top-0 z-10 w-fit -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-primary px-6 py-2.5 text-sm font-semibold leading-none text-primary-foreground shadow-sm dark:glow-primary md:px-8 md:text-base">
                {t("home.features.stat")}
              </div>
              <NeonCardHeader className="pt-10 text-center">
                <NeonCardDescription className="text-base text-foreground/80 md:text-lg">
                  {t("home.features.statNote")}
                </NeonCardDescription>
              </NeonCardHeader>
            </NeonCard>
          </div>
        </div>
      </section>

      <section
        id="flow-section"
        data-parallax-speed="0.35"
        className="home-section ambient-section flex"
        aria-label={t("home.flow.title")}
      >
        <div
          className="home-section-content mx-auto w-full max-w-screen-2xl px-4 flex flex-col justify-center"
          data-reveal
          data-reveal-children
        >
          <div className="mx-auto max-w-4xl text-center" data-reveal-item>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {t("home.flow.title")}
            </h2>
            <p className="mt-4 text-base text-foreground/80 sm:text-lg">{t("home.flow.lead")}</p>
          </div>

          <div className="mx-auto mt-10 max-w-6xl" data-reveal-item>
            <Stepper
              variant="cards"
              className="md:grid-cols-2"
              steps={[
                {
                  key: "1",
                  icon: "MessageCircle",
                  title: t("home.flow.steps.1.title"),
                  description: t("home.flow.steps.1.text"),
                },
                {
                  key: "2",
                  icon: "Brain",
                  title: t("home.flow.steps.2.title"),
                  description: t("home.flow.steps.2.text"),
                },
                {
                  key: "3",
                  icon: "CalendarCheck",
                  title: t("home.flow.steps.3.title"),
                  description: t("home.flow.steps.3.text"),
                },
                {
                  key: "4",
                  icon: "BellRing",
                  title: t("home.flow.steps.4.title"),
                  description: t("home.flow.steps.4.text"),
                },
              ]}
            />
          </div>
        </div>
      </section>

      <section
        id="benefits-section"
        data-parallax-speed="0.35"
        className="home-section ambient-section flex"
        aria-label={t("home.benefits.title")}
      >
        <div
          className="home-section-content mx-auto w-full max-w-screen-2xl px-4 flex flex-col justify-center"
          data-reveal
          data-reveal-children
        >
          <div className="mx-auto max-w-4xl text-center" data-reveal-item>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {t("home.benefits.title")}
            </h2>
            <p className="mt-4 text-base text-foreground/80 sm:text-lg">{t("home.benefits.lead")}</p>
          </div>

          <div
            className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-2 md:gap-6"
            data-reveal-item
          >
            {benefitCards.map((item) => (
              <NeonCard key={item.titleKey} className="bg-card/80 backdrop-blur-sm" hover glow>
                <NeonCardHeader className="flex-row items-start gap-4">
                  <div className="mt-0.5 shrink-0 text-gradient-to dark:text-primary">
                    <Icon name={item.icon} size={34} aria-label={t(item.titleKey)} />
                  </div>
                  <div className="min-w-0">
                    <NeonCardTitle className="text-xl leading-tight text-gradient-to dark:text-primary">
                      {t(item.titleKey)}
                    </NeonCardTitle>
                    <NeonCardDescription className="mt-1 text-sm">{t(item.textKey)}</NeonCardDescription>
                  </div>
                </NeonCardHeader>
              </NeonCard>
            ))}
          </div>
        </div>
      </section>

      <section
        id="scenarios-section"
        data-parallax-speed="0.4"
        className="home-section ambient-section flex"
        aria-label={t("home.scenarios.title")}
      >
        <div
          className="home-section-content mx-auto w-full max-w-screen-2xl px-4 flex flex-col justify-center"
          data-reveal
          data-reveal-children
        >
          <div className="mx-auto max-w-4xl text-center" data-reveal-item>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {t("home.scenarios.title")}
            </h2>
            <p className="mt-4 text-base text-foreground/80 sm:text-lg">{t("home.scenarios.lead")}</p>
          </div>

          <div
            className="mx-auto mt-10 grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-6"
            data-reveal-item
          >
            {scenarioCards.map((item) => (
              <NeonCard key={item.titleKey} className="bg-background/55 backdrop-blur-sm" hover glow>
                <NeonCardHeader className="items-center text-center">
                  <div className="text-gradient-to dark:text-primary">
                    <Icon name={item.icon} size={34} aria-label={t(item.titleKey)} />
                  </div>
                  <NeonCardTitle className="mt-4 text-lg">{t(item.titleKey)}</NeonCardTitle>
                  <NeonCardDescription className="mt-2">{t(item.textKey)}</NeonCardDescription>
                </NeonCardHeader>
              </NeonCard>
            ))}
          </div>

          <div className="mt-10 text-center" data-reveal-item>
            <Button variant="secondary" size="lg" className="h-12" asChild>
              <Link href="/escenarios" data-cta-anim>{t("home.scenarios.ctaButton")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section
        id="roi-section"
        data-parallax-speed="0.35"
        className="home-section ambient-section flex"
        aria-label={t("home.kpi.title")}
      >
        <div
          className="home-section-content mx-auto w-full max-w-screen-2xl px-4 flex flex-col justify-center"
          data-reveal
          data-reveal-children
        >
          <div className="mx-auto max-w-4xl text-center" data-reveal-item>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {t("home.kpi.title")}
            </h2>
            <p className="mt-4 text-base text-foreground/80 sm:text-lg">{t("home.kpi.lead")}</p>
          </div>

          <div
            className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3 md:gap-6"
            data-reveal-item
          >
            {roiStats.map((stat) => {
              const valueText = t(stat.valueKey);
              const parsed = parseCountup(valueText);

              return (
                <NeonCard key={stat.key} className="bg-card/80 backdrop-blur-sm" hover glow>
                  <NeonCardHeader className="items-center text-center">
                    <div
                      className="text-4xl font-bold text-gradient-to tabular-nums dark:text-primary"
                      data-countup={parsed ? "true" : undefined}
                      data-countup-end={parsed ? String(parsed.end) : undefined}
                      data-countup-prefix={parsed ? parsed.prefix : undefined}
                      data-countup-suffix={parsed ? parsed.suffix : undefined}
                      data-countup-decimals={parsed ? String(parsed.decimals) : undefined}
                    >
                      {valueText}
                    </div>
                    <NeonCardDescription className="mt-2 text-sm">{t(stat.labelKey)}</NeonCardDescription>
                  </NeonCardHeader>
                </NeonCard>
              );
            })}
          </div>

          <div className="mx-auto mt-6 grid max-w-5xl gap-4 md:grid-cols-2 md:gap-6" data-reveal-item>
            <NeonCard className="bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20">
              <NeonCardHeader className="flex-row items-start gap-4">
                <div className="mt-0.5 shrink-0 text-gradient-to dark:text-primary">
                  <Icon name="Euro" size={34} aria-label={t("home.kpi.impact.money.title")} />
                </div>
                <div className="min-w-0">
                  <NeonCardTitle className="text-xl">{t("home.kpi.impact.money.title")}</NeonCardTitle>
                  <NeonCardDescription className="mt-1 text-sm">{t("home.kpi.impact.money.text")}</NeonCardDescription>
                </div>
              </NeonCardHeader>
            </NeonCard>

            <NeonCard className="bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20">
              <NeonCardHeader className="flex-row items-start gap-4">
                <div className="mt-0.5 shrink-0 text-gradient-to dark:text-primary">
                  <Icon name="Clock" size={34} aria-label={t("home.kpi.impact.time.title")} />
                </div>
                <div className="min-w-0">
                  <NeonCardTitle className="text-xl">{t("home.kpi.impact.time.title")}</NeonCardTitle>
                  <NeonCardDescription className="mt-1 text-sm">{t("home.kpi.impact.time.text")}</NeonCardDescription>
                </div>
              </NeonCardHeader>
            </NeonCard>
          </div>

          <div className="mt-10 text-center" data-reveal-item>
            <Button variant="default" size="lg" className="h-12 dark:glow-primary" asChild>
              <Link href="/roi" data-cta-anim>{t("home.kpi.cta")}</Link>
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
    </LenisProvider>
  );
}
