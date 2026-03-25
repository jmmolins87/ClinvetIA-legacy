"use client";

import { useTranslation } from "@/components/providers/i18n-provider";
import { Icon } from "@/components/ui/icon";

const icons = ["Zap", "MessageCircle", "Check", "Heart"] as const;

export function PatientExperience() {
  const { t } = useTranslation();

  const items = [
    t("howItWorks.patient.items.0"),
    t("howItWorks.patient.items.1"),
    t("howItWorks.patient.items.2"),
    t("howItWorks.patient.items.3"),
  ];

  return (
    <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="group relative rounded-xl border border-border bg-card/80 p-6 text-center backdrop-blur-sm transition-all hover:border-primary hover:shadow-lg"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg">
              <Icon name={icons[index]} className="h-6 w-6 text-primary-foreground" />
            </div>
            <p className="text-base leading-relaxed text-foreground/90">
              {item}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
