import * as React from "react";

import { cn } from "@/lib/utils";

type ColorToken = {
  label: string;
  value: string;
  type?: "color" | "gradient";
};

function ColorSwatch({ token }: { token: ColorToken }): JSX.Element {
  const isGradient = token.type === "gradient";

  return (
    <div className="grid grid-cols-[1fr,140px] items-center gap-4 rounded-lg border bg-card p-3">
      <div className="min-w-0">
        <div className="font-mono text-xs text-muted-foreground">{token.label}</div>
        <div className="mt-1 truncate font-mono text-xs">{token.value}</div>
      </div>
      <div
        className="h-10 w-full rounded-md border"
        style={
          isGradient
            ? {
                background: token.value,
              }
            : {
                backgroundColor: token.value,
              }
        }
      />
    </div>
  );
}

function TokenGrid({ tokens }: { tokens: ColorToken[] }): JSX.Element {
  return (
    <div className="grid gap-3">
      {tokens.map((t) => (
        <ColorSwatch key={t.label} token={t} />
      ))}
    </div>
  );
}

function ThemePanel({
  title,
  themeClassName,
  children,
}: {
  title: string;
  themeClassName?: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <section
      className={cn(
        "rounded-xl border bg-background text-foreground",
        themeClassName
      )}
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="text-sm font-medium">{title}</div>
        <div className="font-mono text-[11px] text-muted-foreground">
          {themeClassName ? themeClassName : "(default)"}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function BrandPalette(): JSX.Element {
  const baseTokensLight: ColorToken[] = [
    { label: "--background", value: "var(--palette-light-bg)" },
    { label: "--foreground", value: "var(--palette-light-fg)" },
    { label: "--card", value: "var(--palette-light-surface)" },
    { label: "--card-foreground", value: "var(--palette-light-surface-fg)" },
    { label: "--popover", value: "var(--palette-light-surface)" },
    { label: "--popover-foreground", value: "var(--palette-light-surface-fg)" },
    { label: "--muted", value: "var(--palette-light-muted)" },
    { label: "--muted-foreground", value: "var(--palette-light-muted-fg)" },
    { label: "--border", value: "var(--palette-light-border)" },
    { label: "--input", value: "var(--palette-light-input)" },
    { label: "--ring", value: "var(--palette-light-primary)" },
  ];

  const accentTokensLight: ColorToken[] = [
    { label: "--primary", value: "var(--palette-light-primary)" },
    { label: "--primary-foreground", value: "var(--palette-light-primary-fg)" },
    { label: "--secondary", value: "var(--palette-light-secondary)" },
    { label: "--secondary-foreground", value: "var(--palette-light-secondary-fg)" },
    { label: "--accent", value: "var(--palette-light-accent)" },
    { label: "--accent-foreground", value: "var(--palette-light-accent-fg)" },
    { label: "--destructive", value: "var(--palette-light-destructive)" },
    { label: "--destructive-foreground", value: "var(--palette-light-destructive-fg)" },
  ];

  const fxTokensLight: ColorToken[] = [
    { label: "--glow", value: "var(--palette-light-primary)" },
    {
      label: "gradient (from/to)",
      value:
        "linear-gradient(135deg, var(--palette-light-gradient-from), var(--palette-light-gradient-to))",
      type: "gradient",
    },
  ];

  const baseTokensDark: ColorToken[] = [
    { label: "--background", value: "var(--palette-dark-bg)" },
    { label: "--foreground", value: "var(--palette-dark-fg)" },
    { label: "--card", value: "var(--palette-dark-surface)" },
    { label: "--card-foreground", value: "var(--palette-dark-surface-fg)" },
    { label: "--popover", value: "var(--palette-dark-popover)" },
    { label: "--popover-foreground", value: "var(--palette-dark-popover-fg)" },
    { label: "--muted", value: "var(--palette-dark-muted)" },
    { label: "--muted-foreground", value: "var(--palette-dark-muted-fg)" },
    { label: "--border", value: "var(--palette-dark-border)" },
    { label: "--input", value: "var(--palette-dark-input)" },
    { label: "--ring", value: "var(--palette-dark-primary)" },
  ];

  const accentTokensDark: ColorToken[] = [
    { label: "--primary", value: "var(--palette-dark-primary)" },
    { label: "--primary-foreground", value: "var(--palette-dark-primary-fg)" },
    { label: "--secondary", value: "var(--palette-dark-secondary)" },
    { label: "--secondary-foreground", value: "var(--palette-dark-secondary-fg)" },
    { label: "--accent", value: "var(--palette-dark-accent)" },
    { label: "--accent-foreground", value: "var(--palette-dark-accent-fg)" },
    { label: "--destructive", value: "var(--palette-dark-destructive)" },
    { label: "--destructive-foreground", value: "var(--palette-dark-destructive-fg)" },
  ];

  const fxTokensDark: ColorToken[] = [
    { label: "--glow", value: "var(--palette-dark-primary)" },
    {
      label: "gradient (from/to)",
      value:
        "linear-gradient(135deg, var(--palette-dark-gradient-from), var(--palette-dark-gradient-to))",
      type: "gradient",
    },
  ];

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 md:grid-cols-2">
        <ThemePanel title="Light" themeClassName="">
          <div className="grid gap-5">
            <div>
              <div className="mb-2 text-xs font-medium text-muted-foreground">Base</div>
              <TokenGrid tokens={baseTokensLight} />
            </div>
            <div>
              <div className="mb-2 text-xs font-medium text-muted-foreground">Accents</div>
              <TokenGrid tokens={accentTokensLight} />
            </div>
            <div>
              <div className="mb-2 text-xs font-medium text-muted-foreground">FX</div>
              <TokenGrid tokens={fxTokensLight} />
            </div>
          </div>
        </ThemePanel>

        <ThemePanel title="Dark" themeClassName="dark">
          <div className="grid gap-5">
            <div>
              <div className="mb-2 text-xs font-medium text-muted-foreground">Base</div>
              <TokenGrid tokens={baseTokensDark} />
            </div>
            <div>
              <div className="mb-2 text-xs font-medium text-muted-foreground">Accents</div>
              <TokenGrid tokens={accentTokensDark} />
            </div>
            <div>
              <div className="mb-2 text-xs font-medium text-muted-foreground">FX</div>
              <TokenGrid tokens={fxTokensDark} />
            </div>
          </div>
        </ThemePanel>
      </div>
    </div>
  );
}

export function BrandTypography(): JSX.Element {
  return (
    <div className="grid gap-6">
      <div className="rounded-xl border bg-card p-6">
        <div className="text-xs font-medium text-muted-foreground">Font Sans</div>
        <div className="mt-4 grid gap-4 font-sans">
          <div className="text-3xl font-semibold tracking-tight">Clinvetia Typography</div>
          <div className="text-lg text-muted-foreground">
            Body text uses Geist Sans via the CSS variable --font-geist-sans and the Tailwind token font-sans.
          </div>
          <div className="grid gap-2">
            <div className="text-sm">
              The quick brown fox jumps over the lazy dog. 0123456789
            </div>
            <div className="text-sm text-muted-foreground">
              Links and emphasis should stay readable over neon backgrounds.
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="text-xs font-medium text-muted-foreground">Font Mono</div>
        <div className="mt-4 grid gap-3 font-mono">
          <div className="text-sm">const theme = {"\"dark\""};</div>
          <div className="text-sm text-muted-foreground">
            Mono text uses Geist Mono via the CSS variable --font-geist-mono and the Tailwind token font-mono.
          </div>
        </div>
      </div>
    </div>
  );
}
