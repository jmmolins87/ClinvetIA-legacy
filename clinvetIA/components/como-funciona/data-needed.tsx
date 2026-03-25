"use client";

import { useTranslation } from "@/components/providers/i18n-provider";
import { Icon } from "@/components/ui/icon";

const icons = ["MessageSquare", "Settings", "Calendar", "Check"] as const;

export function DataNeeded() {
  const { t } = useTranslation();

  const items = [
    {
      title: t("howItWorks.data.items.0.title"),
      text: t("howItWorks.data.items.0.text"),
    },
    {
      title: t("howItWorks.data.items.1.title"),
      text: t("howItWorks.data.items.1.text"),
    },
    {
      title: t("howItWorks.data.items.2.title"),
      text: t("howItWorks.data.items.2.text"),
    },
    {
      title: t("howItWorks.data.items.3.title"),
      text: t("howItWorks.data.items.3.text"),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <p className="mb-12 text-center text-lg text-foreground/80 sm:text-xl">
        {t("howItWorks.data.lead")}
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="group relative rounded-xl border border-border bg-card/80 p-6 backdrop-blur-sm transition-all hover:border-primary hover:shadow-lg"
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg">
                <Icon name={icons[index]} className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-foreground/70">
                  {item.text}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
