"use client";

import * as React from "react";

import { Switch } from "@/components/ui/switch";
import { useTranslation } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

type Language = "es" | "en";

export function SiteLanguageSwitcher({
  className,
  defaultLanguage = "es",
  onChange,
}: {
  className?: string;
  defaultLanguage?: Language;
  onChange?: (lang: Language) => void;
}) {
  const { t } = useTranslation();
  const [lang, setLang] = React.useState<Language>(defaultLanguage);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem("clinvetia.lang");
      if (stored === "es" || stored === "en") setLang(stored);
    } catch {
      // Ignore.
    }
  }, []);

  const update = React.useCallback(
    (next: Language) => {
      setLang(next);
      try {
        window.localStorage.setItem("clinvetia.lang", next);
      } catch {
        // Ignore.
      }

      document.documentElement.lang = next;
      onChange?.(next);
    },
    [onChange]
  );

  const checked = lang === "en";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "text-sm font-medium transition-colors",
          lang === "es" ? "text-gradient-to dark:text-primary" : "text-muted-foreground"
        )}
      >
        ES
      </span>
      <Switch
        checked={checked}
        onCheckedChange={(next) => update(next ? "en" : "es")}
        aria-label={t("language.toggle")}
        className="cursor-pointer"
      />
      <span
        className={cn(
          "text-sm font-medium transition-colors",
          lang === "en" ? "text-gradient-to dark:text-primary" : "text-muted-foreground"
        )}
      >
        EN
      </span>
    </div>
  );
}
