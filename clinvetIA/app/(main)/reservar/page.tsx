"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/components/providers/i18n-provider";
import { useBooking } from "@/features/booking";
import { useROIData } from "@/features/roi";
import { useCalendlyData, useLastBooking } from "@/features/booking";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Icon } from "@/components/ui/icon";
import { CalendarSkeleton } from "@/components/booking/CalendarSkeleton";
import { TimeSlotsSkeleton } from "@/components/booking/TimeSlotsSkeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { isDateAvailable, getDaysInMonth, formatCountdown } from "@/features/booking/booking.calc";
import { Badge } from "@/components/ui/badge";
import { STORAGE_KEYS } from "@/constants/app";
import { cn } from "@/lib/utils";

/**
 * Página de reservar demo - Integración del sistema de booking
 *
 * Flujo:
 * 1. Seleccionar fecha en calendario
 * 2. Seleccionar hora disponible (crea hold de 10 minutos)
 * 3. Completar formulario de contacto + validar ROI
 * 4. Confirmar reserva → redirigir a página de contacto
 *
 * Legacy reference: app/reservar/page.tsx + components/booking-calendar.tsx
 */
export default function ReservarPage() {
  const { t, lang: locale } = useTranslation();
  const router = useRouter();

  // ROI data (required for booking)
  const { roiData, hasROIData } = useROIData();

  // Storage hooks
  const { saveCalendlyData } = useCalendlyData();
  const { saveLastBooking } = useLastBooking();

  // Check if user already submitted before
  const [hasSubmittedBefore, setHasSubmittedBefore] = React.useState(false);
  const [showAlreadySubmittedModal, setShowAlreadySubmittedModal] = React.useState(false);

  React.useEffect(() => {
    try {
      const submitted = localStorage.getItem(STORAGE_KEYS.CONTACT_SUBMITTED);
      if (submitted === "true") {
        setHasSubmittedBefore(true);
        setShowAlreadySubmittedModal(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Navigation interception state
  const [hasInteracted, setHasInteracted] = React.useState(false);
  const [showLeaveWarning, setShowLeaveWarning] = React.useState(false);
  const [pendingNavigation, setPendingNavigation] = React.useState<string | null>(null);

  // Modals
  const [showROIRedirectModal, setShowROIRedirectModal] = React.useState(false);
  const [showConfirmationError, setShowConfirmationError] = React.useState<string | null>(null);

  // State for redirecting after time selection
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  // Main booking hook
  const booking = useBooking({
    locale,
    roiData,
    hasROIData,
    onDateSelected: React.useCallback(() => {
      setHasInteracted(true);
    }, []),
  });

  // Handle time selection - save hold and redirect to contact
  const handleTimeSelectWithRedirect = React.useCallback(
    async (time: string) => {
      await booking.handleTimeSelect(time);
      
      // After hold is created, save data and redirect
      if (booking.hold) {
        setIsRedirecting(true);
        
        // Save booking data to sessionStorage for contact page
        try {
          saveLastBooking({
            source: "booking",
            createdAt: Date.now(),
            dateISO: booking.selectedDate?.toISOString() || "",
            time: time,
            hold: {
              sessionToken: booking.hold.sessionToken,
              expiresAt: booking.hold.expiresAt.toISOString(),
              date: booking.hold.date,
              time: booking.hold.time,
            },
            roi: roiData ?? null,
          });
        } catch {
          // ignore
        }

        // Redirect to contact page
        window.setTimeout(() => {
          router.push("/contacto?from=booking");
        }, 500);
      }
    },
    [booking, router, saveLastBooking, roiData]
  );

  // Handle confirmation
  const handleConfirm = React.useCallback(async () => {
    const result = await booking.handleConfirm();
    if (!result.ok) {
      setShowConfirmationError(result.error ?? "Unknown error");
    }
  }, [booking]);

  // Handle ROI redirect
  const handleROIRedirect = React.useCallback(() => {
    booking.saveForROIRedirect();
    setShowROIRedirectModal(true);
  }, [booking]);

  // Intercept navigation to show warning
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!hasInteracted) return;

      const target = e.target as HTMLElement;
      const link = target.closest("a");
      if (link && link.href && !link.href.includes("/reservar")) {
        e.preventDefault();
        e.stopPropagation();
        setPendingNavigation(link.href);
        setShowLeaveWarning(true);
      }
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, [hasInteracted]);

  // Calendar date filter
  const isDateDisabled = React.useCallback((date: Date) => {
    return !isDateAvailable(date, new Date());
  }, []);

  // Render calendar days
  const { year, month, daysInMonth, startingDayOfWeek } = getDaysInMonth(booking.currentMonth);
  const calendarDays: (Date | null)[] = [];

  // Add empty cells for days before month start
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Add days of month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  return (
    <>
      {/* Hero Section */}
      <section className="ambient-section text-foreground pb-8 md:pb-12">
        <div className="page-hero-content container relative z-10 mx-auto max-w-screen-xl px-4">
          <div className="max-w-4xl mx-auto text-center space-y-3 md:space-y-4">
            <div className="flex items-center justify-center gap-3 mb-3 md:mb-4">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-600 to-pink-600 dark:from-primary dark:via-gradient-purple dark:to-gradient-to flex items-center justify-center shadow-lg dark:glow-primary">
                <Icon name="Calendar" className="w-6 h-6 md:w-8 md:h-8 text-white dark:text-black" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
              {t("book.title")}
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl md:text-2xl max-w-3xl mx-auto">
              {t("book.description")}
            </p>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="ambient-section py-6 md:py-12">
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <div className="max-w-4xl mx-auto">
            {hasSubmittedBefore ? (
              <div className="rounded-xl border border-blue-500/50 bg-card/80 backdrop-blur-sm p-6 md:p-8 text-center">
                <Icon name="CircleCheck" className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                <h2 className="text-2xl font-bold mb-2">{t("book.already_submitted.title")}</h2>
                <p className="text-muted-foreground">
                  {t("book.already_submitted.description")}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm overflow-hidden">
                {/* Step 1: Calendar */}
                {booking.step === 1 && (
                  <div className="p-4 md:p-6 lg:p-8">
                    <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">{t("book.step1.title")}</h2>
                    <Calendar
                      selected={booking.selectedDate ?? undefined}
                      onSelect={booking.handleDateSelect}
                      disabled={isDateDisabled}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Step 2: Time Slots */}
                {booking.step === 2 && (
                  <div className="p-4 md:p-6 lg:p-8">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                      <h2 className="text-xl md:text-2xl font-bold">{t("book.step2.title")}</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          booking.setStep(1);
                          booking.handleDateSelect(undefined);
                        }}
                      >
                        <Icon name="ChevronLeft" className="w-4 h-4 mr-2" />
                        {t("common.back")}
                      </Button>
                    </div>

                    {booking.isTodayCutoff && (
                      <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          {t("book.cutoff_warning")}
                        </p>
                      </div>
                    )}

                    {booking.availabilityLoading ? (
                      <div role="status" aria-live="polite">
                        <TimeSlotsSkeleton />
                        <span className="sr-only">{t("book.loading_slots")}</span>
                      </div>
                    ) : booking.availabilityError ? (
                      <div role="alert" className="text-center py-12">
                        <Icon name="CircleAlert" className="w-8 h-8 mx-auto mb-4 text-red-500" />
                        <p className="text-red-500">{booking.availabilityError}</p>
                      </div>
                    ) : booking.availability && booking.availability.length > 0 ? (
                      <div 
                        role="listbox" 
                        aria-label={t("book.step2.title")}
                        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3"
                      >
                        {booking.availability.map((slot) => (
                          <Button
                            key={slot.start}
                            role="option"
                            aria-selected={booking.selectedTime === slot.start}
                            aria-disabled={!slot.available || booking.holding}
                            variant={
                              booking.selectedTime === slot.start ? "default" : "outline"
                            }
                            disabled={!slot.available || booking.holding}
                            onClick={() => booking.handleTimeSelect(slot.start)}
                            aria-label={`${slot.start} ${t("book.step2.to")} ${slot.end}, ${slot.available ? t("book.step2.available") : t("book.step2.occupied")}`}
                            className={cn(
                              "h-11 md:h-12 text-sm",
                              !slot.available && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            {booking.holding && booking.selectedTime === slot.start ? (
                              <Icon name="Loader" className="w-4 h-4 animate-spin" />
                            ) : (
                              `${slot.start} - ${slot.end}`
                            )}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div role="status" className="text-center py-12">
                        <p className="text-muted-foreground">{t("book.no_slots")}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Redirecting to Contact */}
                {booking.step === 3 && (
                  <div className="p-6 md:p-8 text-center">
                    <Icon name="Loader" className="w-10 h-10 md:w-12 md:h-12 animate-spin mx-auto mb-4 text-primary" />
                    <h2 className="text-xl md:text-2xl font-bold mb-2">{t("book.redirecting.title")}</h2>
                    <p className="text-muted-foreground">
                      {t("book.redirecting.description")}
                    </p>
                    {booking.hold && (
                      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg inline-block">
                        <Badge variant="outline" className="mb-2">
                          {booking.selectedDate?.toLocaleDateString(locale)} • {booking.selectedTime}
                        </Badge>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          {t("book.hold_timer")} {formatCountdown(booking.holdSecondsLeft)}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Leave Warning Modal */}
      <AlertDialog open={showLeaveWarning} onOpenChange={setShowLeaveWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("book.leave_warning.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("book.leave_warning.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingNavigation) {
                  window.location.href = pendingNavigation;
                }
              }}
            >
              {t("book.leave_warning.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ROI Redirect Modal */}
      <AlertDialog open={showROIRedirectModal} onOpenChange={setShowROIRedirectModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("book.roi_redirect.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("book.roi_redirect.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push("/roi")}>
              {t("book.roi_redirect.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Already Submitted Modal */}
      <AlertDialog
        open={showAlreadySubmittedModal}
        onOpenChange={setShowAlreadySubmittedModal}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("book.already_submitted.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("book.already_submitted.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>{t("common.ok")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Error Modal */}
      <AlertDialog
        open={!!showConfirmationError}
        onOpenChange={() => setShowConfirmationError(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("book.error.title")}</AlertDialogTitle>
            <AlertDialogDescription>{showConfirmationError}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>{t("common.ok")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
