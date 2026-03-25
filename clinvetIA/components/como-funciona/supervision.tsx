"use client";

import { useTranslation } from "@/components/providers/i18n-provider";
import { Icon } from "@/components/ui/icon";

const icons = ["Eye", "UserCheck", "Shield", "MessageSquare"] as const;

export function Supervision() {
  const { t } = useTranslation();

  const items = [
    t("howItWorks.supervision.items.0"),
    t("howItWorks.supervision.items.1"),
    t("howItWorks.supervision.items.2"),
    t("howItWorks.supervision.items.3"),
  ];

  return (
    <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
      {items.map((item, index) => (
        <div
          key={index}
          className="group relative rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 p-6 backdrop-blur-sm transition-all hover:border-primary hover:shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary shadow-lg">
              <Icon name={icons[index]} className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-base leading-relaxed text-foreground/90">
                {item}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
