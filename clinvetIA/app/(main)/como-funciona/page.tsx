"use client";

import { useTranslation } from "@/components/providers/i18n-provider";
import { SectionCtaFooter } from "@/components/blocks/section-cta-footer";
import { Icon } from "@/components/ui/icon";
import { StepsTimeline } from "@/components/como-funciona/steps-timeline";
import { DataNeeded } from "@/components/como-funciona/data-needed";
import { Supervision } from "@/components/como-funciona/supervision";
import { PatientExperience } from "@/components/como-funciona/patient-experience";
import { HowFaq } from "@/components/como-funciona/how-faq";

export default function ComoFuncionaPage(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section
        className="ambient-section pb-16 text-foreground md:pb-10"
        data-reveal
        data-parallax-speed="0.4"
      >
        <div className="page-hero-content mx-auto w-full max-w-screen-2xl px-4">
          <div className="mx-auto max-w-4xl text-center">
            {/* Icon */}
            <div className="mb-6 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg">
                <Icon name="Workflow" className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t("howItWorks.hero.heading")}
            </h1>

            <p className="mt-6 text-lg text-primary sm:text-xl">
              {t("howItWorks.hero.claimLight")}
            </p>

            <p className="mt-4 text-base text-foreground/80 sm:text-lg lg:text-xl">
              {t("howItWorks.hero.subheading")}
            </p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section
        className="ambient-section py-16 text-foreground md:py-10"
        data-reveal
        data-parallax-speed="0.35"
      >
        <div className="mx-auto w-full max-w-screen-2xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {t("howItWorks.steps.title")}
            </h2>
          </div>

          <StepsTimeline />
        </div>
      </section>

      {/* Data Needed Section */}
      <section
        className="ambient-section py-16 text-foreground md:py-24 lg:py-32"
        data-reveal
        data-parallax-speed="0.35"
      >
        <div className="mx-auto w-full max-w-screen-2xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {t("howItWorks.data.title")}
            </h2>
          </div>

          <DataNeeded />
        </div>
      </section>

      {/* Supervision Section */}
      <section
        className="ambient-section py-16 text-foreground md:py-24 lg:py-32"
        data-reveal
        data-parallax-speed="0.35"
      >
        <div className="mx-auto w-full max-w-screen-2xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {t("howItWorks.supervision.title")}
            </h2>
          </div>

          <Supervision />
        </div>
      </section>

      {/* Messaging Section */}
      <section
        className="ambient-section py-16 text-foreground md:py-24 lg:py-32"
        data-reveal
        data-parallax-speed="0.35"
      >
        <div className="mx-auto w-full max-w-screen-2xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {t("howItWorks.messaging.title")}
            </h2>

            <div className="mt-6 space-y-4">
              <p className="text-lg text-foreground/80 sm:text-xl">
                {t("howItWorks.messaging.p1")}
              </p>
              <p className="text-base text-foreground/70 sm:text-lg">
                {t("howItWorks.messaging.p2")}
              </p>
            </div>

            {/* Key message */}
            <div className="mt-8 rounded-2xl border border-destructive/50 bg-destructive/10 p-6 backdrop-blur-sm md:p-8">
              <div className="mb-4 flex items-center justify-center gap-3">
                <Icon name="CircleAlert" className="h-6 w-6 text-destructive" />
              </div>
              <p className="text-lg font-semibold text-destructive sm:text-xl">
                {t("howItWorks.keyMessage")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Experience Section */}
      <section
        className="ambient-section py-16 text-foreground md:py-24 lg:py-32"
        data-reveal
        data-parallax-speed="0.35"
      >
        <div className="mx-auto w-full max-w-screen-2xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {t("howItWorks.patient.title")}
            </h2>
          </div>

          <PatientExperience />
        </div>
      </section>

      {/* FAQ Section */}
      <section
        className="ambient-section py-16 text-foreground md:py-24 lg:py-32"
        data-reveal
        data-parallax-speed="0.35"
      >
        <div className="mx-auto w-full max-w-screen-2xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {t("howItWorks.faq.title")}
            </h2>
          </div>

          <HowFaq />
        </div>
      </section>

      {/* CTA + Footer Section */}
      <SectionCtaFooter
        ariaLabel={t("howItWorks.cta.primary")}
        title={t("howItWorks.microCta")}
        description={t("howItWorks.cta.note")}
        demoLabel={t("howItWorks.cta.primary")}
        demoHref="/contacto"
        roiLabel={t("howItWorks.cta.secondary")}
        roiHref="/roi"
        sectionClassName="ambient-section"
        parallaxSpeed={0.4}
      />
    </div>
  );
}
