"use client";

import * as React from "react";
import Link from "next/link";

import { useTranslation } from "@/components/providers/i18n-provider";
import { AvatarIA } from "@/components/ui/avatar-ia";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

function newId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function AiAssistantDock({
  className,
  defaultOpen,
}: {
  className?: string;
  defaultOpen?: boolean;
}): React.JSX.Element {
  const { t, lang } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(defaultOpen ?? false);

  const [chatText, setChatText] = React.useState("");
  const [isThinking, setIsThinking] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>(() => [
    {
      id: newId(),
      role: "assistant",
      text:
        lang === "es"
          ? "Hola, soy el asistente de Clinvetia. Cuéntame que necesitas y te guio."
          : "Hi, I'm Clinvetia's assistant. Tell me what you need and I'll guide you.",
    },
  ]);

  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, isThinking]);

  const sendChat = React.useCallback(() => {
    const text = chatText.trim();
    if (!text) return;

    setChatText("");
    setMessages((prev) => [...prev, { id: newId(), role: "user", text }]);
    setIsThinking(true);

    window.setTimeout(() => {
      setIsThinking(false);
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "assistant",
          text:
            lang === "es"
              ? "Perfecto. Para orientarte bien: ¿es una clinica (operacion) o un caso puntual?"
              : "Got it. Quick question: is this for a clinic operation or a one-off case?",
        },
      ]);
    }, 650);
  }, [chatText, lang]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {/* Floating button con Logo cuando cerrado, Avatar cuando abierto */}
      {!isOpen && (
        <div
          className={cn(
            "fixed right-[calc(1rem+env(safe-area-inset-right))] bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40",
            className
          )}
        >
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label={t("common.openAssistant")}
              className={cn(
                "group relative flex items-center justify-center rounded-full",
                "outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "transition-all active:scale-95"
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute -inset-1 rounded-full opacity-70 blur-sm",
                  "bg-gradient-to-br from-gradient-from/70 via-gradient-to/40 to-accent/40",
                  "transition-opacity group-hover:opacity-90"
                )}
              />
              <span
                aria-hidden
                className={cn(
                  "absolute inset-0 rounded-full ring-1 ring-border/60",
                  "bg-background/40 backdrop-blur-md"
                )}
              />
              <AvatarIA size="2xl" className="relative" />
            </button>
          </SheetTrigger>
        </div>
      )}

      <SheetContent
        side="right"
        className="p-0 gap-0 sm:max-w-md"
      >
        <SheetHeader className="relative overflow-hidden border-b border-border/60">
          <div
            aria-hidden
            className={cn(
              "absolute inset-0",
              "bg-[radial-gradient(26rem_18rem_at_20%_25%,color-mix(in_oklch,var(--primary)_20%,transparent),transparent_64%),radial-gradient(22rem_16rem_at_85%_65%,color-mix(in_oklch,var(--accent)_16%,transparent),transparent_72%)]"
            )}
          />

          <div className="relative flex items-center gap-3 p-4">
            <div className="relative">
              <span
                aria-hidden
                className={cn(
                  "absolute -inset-1 rounded-full blur-sm opacity-70",
                  "bg-gradient-to-br from-gradient-from/55 via-gradient-to/35 to-accent/35"
                )}
              />
              <AvatarIA size="lg" className="relative ring-1 ring-border/60" />
            </div>

            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate">{t("common.aiAssistantTitle")}</SheetTitle>
              <SheetDescription className="truncate">
                {t("common.aiAssistantDescription")}
              </SheetDescription>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex size-2 rounded-full bg-emerald-500/80" aria-hidden />
              <span>{lang === "es" ? "En linea" : "Online"}</span>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          <div
            ref={scrollRef}
            className={cn(
              "h-full overflow-y-auto",
              "bg-[radial-gradient(22rem_16rem_at_70%_15%,color-mix(in_oklch,var(--primary)_8%,transparent),transparent_70%)]"
            )}
          >
            <div className="mx-auto flex max-w-[28rem] flex-col gap-3 px-4 py-5">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                      m.role === "user"
                        ? "rounded-tr-sm bg-gradient-to-br from-gradient-from to-gradient-to text-primary-foreground"
                        : "rounded-tl-sm border border-border/60 bg-card/70 text-foreground backdrop-blur"
                    )}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {isThinking ? (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-border/60 bg-card/70 px-4 py-3 text-sm text-muted-foreground backdrop-blur">
                    <span className="inline-flex items-center gap-1" aria-label="Typing">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/70" />
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/70 [animation-delay:120ms]" />
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/70 [animation-delay:240ms]" />
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="mt-2 grid gap-2">
                <div className="text-xs font-semibold text-muted-foreground">
                  {lang === "es" ? "Accesos rapidos" : "Quick actions"}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" className="h-9" asChild>
                    <Link href="/reservar">{t("common.bookDemo")}</Link>
                  </Button>
                  <Button variant="outline" size="sm" className="h-9" asChild>
                    <Link href="/roi">{t("common.roi")}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/60 bg-background/80 p-4 backdrop-blur">
          <form
            className="mx-auto flex max-w-[28rem] items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              sendChat();
            }}
          >
            <div className="flex-1">
              <Textarea
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder={lang === "es" ? "Escribe un mensaje..." : "Type a message..."}
                className={cn(
                  "min-h-0 h-12 resize-none rounded-2xl",
                  "bg-card/60 backdrop-blur",
                  "px-4 py-3",
                  "shadow-sm"
                )}
                rows={1}
                aria-label={lang === "es" ? "Mensaje" : "Message"}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  if (e.shiftKey) return;
                  e.preventDefault();
                  sendChat();
                }}
              />
            </div>
            <Button
              type="submit"
              size="icon-lg"
              className="h-12 w-12 rounded-2xl dark:glow-primary"
              aria-label={lang === "es" ? "Enviar" : "Send"}
              disabled={chatText.trim().length === 0}
            >
              ↑
            </Button>
          </form>

          <div className="mx-auto mt-2 max-w-[28rem] text-center text-[11px] text-muted-foreground">
            {lang === "es"
              ? "Las respuestas son orientativas. Para casos clinicos, valida con tu equipo."
              : "Responses are indicative. For clinical cases, validate with your team."}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
