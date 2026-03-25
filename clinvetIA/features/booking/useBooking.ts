/**
 * Main booking hook - Ported from legacy ClinvetIA system
 *
 * Legacy reference: components/booking-calendar.tsx
 *
 * State machine:
 * 1. IDLE - No date selected
 * 2. DATE_SELECTED - Date selected, loading availability
 * 3. SLOTS_LOADED - Slots available, user can select time
 * 4. HOLDING - Creating hold on selected slot
 * 5. HELD - Slot held, user filling contact form
 * 6. CONFIRMING - Submitting booking confirmation
 * 7. CONFIRMED - Booking confirmed successfully
 */

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type {
  AvailabilitySlot,
  HoldState,
  ContactDraft,
  ConfirmData,
} from "./booking.types";
import {
  formatYYYYMMDD,
  isDateAvailable,
  secondsLeft,
  isSameDayLocal,
  isAfterCutoff1900,
} from "./booking.calc";
import { getAvailability, createHold, confirmBooking } from "@/services/api/bookings";
import type { AvailabilityResponse, HoldResponse } from "@/services/api/bookings";
import { useContactDraft, usePendingBooking } from "./booking.storage";
import { createRateLimiter } from "@/lib/rateLimit";
import { trackEvent, BookingEvents } from "@/lib/analytics";

// ============================================================================
// Types
// ============================================================================

type BookingStep = 1 | 2 | 3;

interface UseBookingOptions {
  locale: "es" | "en";
  roiData: unknown | null;
  hasROIData: boolean;
  onBookingComplete?: (data: {
    date: Date;
    time: string;
    confirm: ConfirmData;
  }) => void;
  onDateSelected?: () => void;
}

interface AvailabilityCache {
  slots: AvailabilitySlot[];
  timestamp: number;
}

// ============================================================================
// Hook
// ============================================================================

export function useBooking(options: UseBookingOptions) {
  const { locale, roiData, hasROIData, onBookingComplete, onDateSelected } = options;

  // Storage hooks
  const { contactDraft, updateContactDraft, clearContactDraft } = useContactDraft();
  const { pendingBooking, savePendingBooking, clearPendingBooking } = usePendingBooking();

  // Step state (1 = calendar, 2 = time slots, 3 = contact form)
  const [step, setStep] = useState<BookingStep>(1);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Availability state
  const [availability, setAvailability] = useState<AvailabilitySlot[] | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // Hold state
  const [hold, setHold] = useState<HoldState | null>(null);
  const [holdSecondsLeft, setHoldSecondsLeft] = useState<number>(0);
  const [holding, setHolding] = useState(false);

  // Confirmation state
  const [confirming, setConfirming] = useState(false);

  // Caching refs
  const availabilityCacheRef = useRef<Map<string, AvailabilityCache>>(new Map());
  const availabilityInFlightRef = useRef<Map<string, Promise<AvailabilityResponse>>>(
    new Map()
  );

  // Rate limiting refs (persistent across re-renders)
  const holdRateLimiterRef = useRef(createRateLimiter(5, 60_000)); // 5 holds per minute
  const confirmRateLimiterRef = useRef(createRateLimiter(3, 120_000)); // 3 confirmations per 2 minutes

  // ============================================================================
  // Restore pending booking from sessionStorage (ROI flow)
  // ============================================================================

  useEffect(() => {
    if (!pendingBooking) return;

    try {
      // Restore state
      if (pendingBooking.date) {
        setSelectedDate(new Date(pendingBooking.date));
      }
      if (pendingBooking.time) {
        setSelectedTime(pendingBooking.time);
      }
      if (pendingBooking.step) {
        setStep(pendingBooking.step);
      }
      if (pendingBooking.hold) {
        const expiresAt = new Date(pendingBooking.hold.expiresAt);
        const now = new Date();
        
        // Only restore if hold hasn't expired
        if (expiresAt > now) {
          setHold({
            sessionToken: pendingBooking.hold.sessionToken,
            expiresAt,
            date: pendingBooking.hold.date,
            time: pendingBooking.hold.time,
          });
          setHoldSecondsLeft(secondsLeft(expiresAt, now));
        }
      }

      // Clear pending booking after restoration
      clearPendingBooking();
    } catch (error) {
      console.error("Error restoring pending booking:", error);
      clearPendingBooking();
    }
  }, [pendingBooking, clearPendingBooking]);

  // ============================================================================
  // Availability fetching with caching
  // ============================================================================

  const fetchAvailability = useCallback(
    async (
      date: string,
      options?: { force?: boolean }
    ): Promise<AvailabilityResponse> => {
      const cacheKey = date;
      const now = Date.now();

      // Check cache (5-minute TTL)
      if (!options?.force) {
        const cached = availabilityCacheRef.current.get(cacheKey);
        if (cached && now - cached.timestamp < 5 * 60 * 1000) {
          return {
            ok: true,
            date,
            timezone: "Europe/Madrid",
            slotMinutes: 30,
            slots: cached.slots,
          };
        }
      }

      // Check in-flight requests
      const inFlight = availabilityInFlightRef.current.get(cacheKey);
      if (inFlight) {
        return inFlight;
      }

      // Make request
      const promise = getAvailability(date);
      availabilityInFlightRef.current.set(cacheKey, promise);

      try {
        const result = await promise;

        if (result.ok) {
          // Cache result
          availabilityCacheRef.current.set(cacheKey, {
            slots: result.slots,
            timestamp: now,
          });
        }

        return result;
      } finally {
        availabilityInFlightRef.current.delete(cacheKey);
      }
    },
    []
  );

  // ============================================================================
  // Date selection handler
  // ============================================================================

  const handleDateSelect = useCallback(
    async (date: Date | undefined) => {
      if (!date) {
        setSelectedDate(null);
        setAvailability(null);
        setStep(1);
        onDateSelected?.();
        return;
      }

      const now = new Date();

      // Validate date
      if (!isDateAvailable(date, now)) {
        return;
      }

      setSelectedDate(date);
      setStep(2);
      onDateSelected?.();

      // Track date selection
      trackEvent(BookingEvents.DATE_SELECTED, {
        date: formatYYYYMMDD(date),
        dayOfWeek: date.getDay(),
      });

      // Load availability
      const isoDate = formatYYYYMMDD(date);
      setAvailabilityLoading(true);
      setAvailabilityError(null);

      const result = await fetchAvailability(isoDate);

      setAvailabilityLoading(false);

      if (!result.ok) {
        setAvailabilityError(result.message);
        setAvailability(null);
        return;
      }

      setAvailability(result.slots);
      setAvailabilityError(null);
    },
    [fetchAvailability, onDateSelected]
  );

  // ============================================================================
  // Time selection handler (creates hold)
  // ============================================================================

  const handleTimeSelect = useCallback(
    async (time: string) => {
      if (!selectedDate) return;

      const now = new Date();

      // Check same-day cutoff
      if (isSameDayLocal(selectedDate, now) && isAfterCutoff1900(now)) {
        return;
      }

      // If clicking same time, do nothing
      if (hold && hold.time === time) {
        return;
      }

      // Rate limiting check
      const rateLimiter = holdRateLimiterRef.current;
      if (!rateLimiter.canProceed()) {
        const remainingMs = rateLimiter.getRemainingTime();
        const seconds = Math.ceil(remainingMs / 1000);
        
        // Track rate limit hit
        trackEvent(BookingEvents.RATE_LIMIT_EXCEEDED, {
          context: "hold_creation",
          remainingSeconds: seconds,
        });
        
        setAvailabilityError(
          locale === "es"
            ? `Demasiados intentos. Espera ${seconds} segundos antes de intentar de nuevo.`
            : `Too many attempts. Wait ${seconds} seconds before trying again.`
        );
        return;
      }

      // Clear existing hold
      if (hold) {
        setHold(null);
        setHoldSecondsLeft(0);
      }

      setSelectedTime(time);
      setHolding(true);

      // Track time slot click
      trackEvent(BookingEvents.TIME_SLOT_CLICKED, {
        time,
        date: formatYYYYMMDD(selectedDate),
      });

      // Optimistic update: mark slot as unavailable immediately
      const previousAvailability = availability;
      setAvailability((prev) =>
        prev?.map((slot) =>
          slot.start === time ? { ...slot, available: false } : slot
        ) ?? null
      );

      const isoDate = formatYYYYMMDD(selectedDate);
      const result = await createHold({
        date: isoDate,
        time,
        timezone: "Europe/Madrid",
        locale,
      });

      setHolding(false);

      if (!result.ok) {
        setHold(null);
        setSelectedTime(null);
        setAvailabilityError(result.message);

        // Track hold failure
        trackEvent(BookingEvents.HOLD_FAILED, {
          time,
          date: isoDate,
          error: result.code || "unknown",
        });

        // Revert optimistic update on error
        setAvailability(previousAvailability);

        // Refresh availability on error
        const refreshed = await fetchAvailability(isoDate, { force: true });
        if (refreshed.ok) {
          setAvailability(refreshed.slots);
          setAvailabilityError(null);
        }
        return;
      }

      const expiresAtISO = result.booking.expiresAtISO;
      if (!expiresAtISO) {
        setHold(null);
        setSelectedTime(null);
        setAvailabilityError("Internal error: no expiration time");
        return;
      }

      const expiresAt = new Date(expiresAtISO);
      setHold({
        sessionToken: result.sessionToken,
        expiresAt,
        date: isoDate,
        time,
      });
      setHoldSecondsLeft(secondsLeft(expiresAt, new Date()));
      setStep(3);

      // Track successful hold creation
      trackEvent(BookingEvents.HOLD_CREATED, {
        time,
        date: isoDate,
        expiresAt: expiresAtISO,
      });

      // Record successful hold attempt for rate limiting
      holdRateLimiterRef.current.recordAttempt();
    },
    [selectedDate, locale, hold, fetchAvailability]
  );

  // ============================================================================
  // Booking confirmation handler
  // ============================================================================

  const handleConfirm = useCallback(async () => {
    if (!selectedDate || !selectedTime || !hold) {
      return { ok: false, error: "Missing booking data" };
    }

    if (!hasROIData || !roiData) {
      return { ok: false, error: "ROI data required" };
    }

    // Validate contact info
    const { fullName, email, phone } = contactDraft;
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      return { ok: false, error: "Contact information required" };
    }

    // Rate limiting check for confirmations
    const rateLimiter = confirmRateLimiterRef.current;
    if (!rateLimiter.canProceed()) {
      const remainingMs = rateLimiter.getRemainingTime();
      const seconds = Math.ceil(remainingMs / 1000);
      
      // Track rate limit hit
      trackEvent(BookingEvents.RATE_LIMIT_EXCEEDED, {
        context: "booking_confirmation",
        remainingSeconds: seconds,
      });
      
      return {
        ok: false,
        error:
          locale === "es"
            ? `Demasiados intentos de confirmación. Espera ${seconds} segundos.`
            : `Too many confirmation attempts. Wait ${seconds} seconds.`,
      };
    }

    setConfirming(true);

    const result = await confirmBooking({
      sessionToken: hold.sessionToken,
      locale,
      contact: {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        ...(contactDraft.clinicName.trim()
          ? { clinicName: contactDraft.clinicName.trim() }
          : {}),
        ...(contactDraft.message.trim()
          ? { message: contactDraft.message.trim() }
          : {}),
      },
      roi: roiData,
    });

    setConfirming(false);

    if (!result.ok) {
      // Track booking failure
      trackEvent(BookingEvents.BOOKING_FAILED, {
        time: selectedTime,
        date: selectedDate ? formatYYYYMMDD(selectedDate) : null,
        error: result.code || "unknown",
      });

      // If slot was taken, refresh availability
      if (result.code === "SLOT_TAKEN" && selectedDate) {
        const isoDate = formatYYYYMMDD(selectedDate);
        const refreshed = await fetchAvailability(isoDate, { force: true });
        if (refreshed.ok) {
          setAvailability(refreshed.slots);
        }
      }

      return { ok: false, error: result.message };
    }

    // Success! Clear draft and notify
    clearContactDraft();

    // Track successful booking confirmation
    trackEvent(BookingEvents.BOOKING_CONFIRMED, {
      time: selectedTime,
      date: selectedDate ? formatYYYYMMDD(selectedDate) : null,
      hasROI: !!roiData,
    });

    // Record successful confirmation for rate limiting
    confirmRateLimiterRef.current.recordAttempt();

    // Trigger callback
    onBookingComplete?.({
      date: selectedDate,
      time: selectedTime,
      confirm: result,
    });

    return { ok: true };
  }, [
    selectedDate,
    selectedTime,
    hold,
    hasROIData,
    roiData,
    contactDraft,
    locale,
    clearContactDraft,
    onBookingComplete,
    fetchAvailability,
  ]);

  // ============================================================================
  // Hold countdown timer
  // ============================================================================

  useEffect(() => {
    if (!hold) {
      setHoldSecondsLeft(0);
      return;
    }

    const tick = () => {
      const left = secondsLeft(hold.expiresAt, new Date());
      setHoldSecondsLeft(left);

      if (left === 0) {
        // Hold expired - clear state, invalidate cache, and refresh availability
        const previousHold = hold;
        setHold(null);
        setSelectedTime(null);

        // Track hold expiration
        trackEvent(BookingEvents.HOLD_EXPIRED, {
          time: previousHold.time,
          date: previousHold.date,
        });

        if (selectedDate) {
          const isoDate = formatYYYYMMDD(selectedDate);
          
          // Invalidate cache for this date
          availabilityCacheRef.current.delete(isoDate);
          
          setAvailabilityLoading(true);

          void (async () => {
            const refreshed = await fetchAvailability(isoDate, { force: true });
            if (refreshed.ok) {
              setAvailability(refreshed.slots);
              setAvailabilityError(null);
            }
            setAvailabilityLoading(false);
          })();
        }
      }
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [hold, selectedDate, fetchAvailability]);

  // ============================================================================
  // Save pending booking before navigating to ROI
  // ============================================================================

  const saveForROIRedirect = useCallback(() => {
    if (!selectedDate || !selectedTime) return;

    savePendingBooking({
      date: selectedDate.toISOString(),
      time: selectedTime,
      step: 3,
      contact: contactDraft,
      hold: hold
        ? {
            sessionToken: hold.sessionToken,
            expiresAt: hold.expiresAt.toISOString(),
            date: hold.date,
            time: hold.time,
          }
        : null,
    });
  }, [selectedDate, selectedTime, contactDraft, hold, savePendingBooking]);

  // ============================================================================
  // Return hook interface
  // ============================================================================

  return {
    // Step state
    step,
    setStep,

    // Calendar state
    currentMonth,
    setCurrentMonth,
    selectedDate,
    selectedTime,

    // Availability state
    availability,
    availabilityLoading,
    availabilityError,

    // Hold state
    hold,
    holdSecondsLeft,
    holding,

    // Contact state
    contactDraft,
    updateContactDraft,

    // Confirmation state
    confirming,

    // Handlers
    handleDateSelect,
    handleTimeSelect,
    handleConfirm,
    saveForROIRedirect,

    // Utilities
    isTodayCutoff:
      selectedDate && isSameDayLocal(selectedDate, new Date())
        ? isAfterCutoff1900(new Date())
        : false,
  };
}
