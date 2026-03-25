"use client";

import { useTranslation } from "@/components/providers/i18n-provider";
import { Icon } from "@/components/ui/icon";

const icons = ["MessageSquare", "Database", "Check", "FileText"] as const;

export function StepsTimeline() {
  const { t } = useTranslation();

  const steps = [
    {
      title: t("howItWorks.steps.items.0.title"),
      text: t("howItWorks.steps.items.0.text"),
    },
    {
      title: t("howItWorks.steps.items.1.title"),
      text: t("howItWorks.steps.items.1.text"),
    },
    {
      title: t("howItWorks.steps.items.2.title"),
      text: t("howItWorks.steps.items.2.text"),
    },
    {
      title: t("howItWorks.steps.items.3.title"),
      text: t("howItWorks.steps.items.3.text"),
    },
  ];

  return (
    <div className="mx-auto max-w-2xl lg:max-w-5xl">
      {/* Steps */}
      <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className="group relative flex items-start gap-4"
          >
            {/* Number badge */}
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-lg">
              {index + 1}
            </div>

            {/* Content card */}
            <div className="flex-1 rounded-xl border border-border bg-card/90 p-6 backdrop-blur-sm transition-all hover:border-primary hover:shadow-lg">
              <div className="flex items-start gap-4">
                <Icon name={icons[index]} className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-bold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-base leading-relaxed text-foreground/70">
                    {step.text}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
