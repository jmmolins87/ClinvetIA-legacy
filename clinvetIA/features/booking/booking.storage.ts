/**
 * Booking storage hooks - Ported from legacy ClinvetIA system
 *
 * Legacy references:
 * - hooks/use-calendly-data.ts (booking data storage, 30-day TTL)
 * - components/booking-calendar.tsx (contact draft, pending booking)
 *
 * Storage keys (MUST match legacy exactly):
 * - localStorage:
 *   - "clinvetia-calendly-data" (CalendlyData)
 *   - "clinvetia-contact-draft" (ContactDraft)
 * - sessionStorage:
 *   - "clinvetia-pending-booking" (PendingBooking)
 *   - "lastBooking" (LastBooking)
 */

"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type {
  CalendlyData,
  ContactDraft,
  PendingBooking,
  LastBooking,
} from "./booking.types";
import { STORAGE_KEYS, TTL } from "@/constants/app";
import { getLocalStorage, setLocalStorage, removeLocalStorage } from "@/lib/storage";
import { getSessionStorage, setSessionStorage, removeSessionStorage } from "@/lib/storage";

// ============================================================================
// useCalendlyData Hook (30-day TTL)
// ============================================================================

/**
 * Check if CalendlyData is stale (30-day TTL or past event)
 * @see legacy hooks/use-calendly-data.ts:26-35
 */
function isStaleCalendlyData(data: CalendlyData): boolean {
  // Check timestamp expiry (30 days)
  if (!Number.isFinite(data.timestamp)) {
    return true;
  }

  if (Date.now() - data.timestamp > TTL.CALENDLY_DATA_MS) {
    return true;
  }

  // Check if scheduled date is more than 24h in the past
  if (data.scheduledDate) {
    try {
      const scheduledTs = new Date(data.scheduledDate).getTime();
      if (scheduledTs < Date.now() - TTL.SCHEDULED_EVENT_PAST_MS) {
        return true;
      }
    } catch {
      // Invalid date - treat as stale
      return true;
    }
  }

  return false;
}

/**
 * Hook for managing confirmed booking data in localStorage (30-day TTL)
 * @see legacy hooks/use-calendly-data.ts:37-83
 */
export function useCalendlyData() {
  const [calendlyData, setCalendlyData] = useState<CalendlyData | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const stored = getLocalStorage<CalendlyData>(STORAGE_KEYS.CALENDLY_DATA);
    if (!stored) {
      return null;
    }

    // Validate required fields
    if (!stored.eventUri || !stored.inviteeUri) {
      removeLocalStorage(STORAGE_KEYS.CALENDLY_DATA);
      return null;
    }

    // Check staleness
    if (isStaleCalendlyData(stored)) {
      removeLocalStorage(STORAGE_KEYS.CALENDLY_DATA);
      return null;
    }

    return stored;
  });

  const saveCalendlyData = useCallback((data: CalendlyData) => {
    const dataWithTimestamp = {
      ...data,
      timestamp: Date.now(),
    };
    setLocalStorage(STORAGE_KEYS.CALENDLY_DATA, dataWithTimestamp);
    setCalendlyData(dataWithTimestamp);
  }, []);

  const clearCalendlyData = useCallback(() => {
    removeLocalStorage(STORAGE_KEYS.CALENDLY_DATA);
    setCalendlyData(null);
  }, []);

  const hasCalendlyData = useMemo(() => !!calendlyData, [calendlyData]);

  return {
    calendlyData,
    saveCalendlyData,
    clearCalendlyData,
    hasCalendlyData,
  };
}

// ============================================================================
// useContactDraft Hook (auto-save to localStorage)
// ============================================================================

/**
 * Hook for managing contact form draft in localStorage
 * @see legacy components/booking-calendar.tsx:166,238,412
 */
export function useContactDraft() {
  const [contactDraft, setContactDraft] = useState<ContactDraft>(() => {
    if (typeof window === "undefined") {
      return {
        fullName: "",
        email: "",
        phone: "",
        clinicName: "",
        message: "",
      };
    }

    const stored = getLocalStorage<ContactDraft>(STORAGE_KEYS.CONTACT_DRAFT);
    if (!stored) {
      return {
        fullName: "",
        email: "",
        phone: "",
        clinicName: "",
        message: "",
      };
    }

    // Normalize to ensure all fields exist
    return {
      fullName: typeof stored.fullName === "string" ? stored.fullName : "",
      email: typeof stored.email === "string" ? stored.email : "",
      phone: typeof stored.phone === "string" ? stored.phone : "",
      clinicName: typeof stored.clinicName === "string" ? stored.clinicName : "",
      message: typeof stored.message === "string" ? stored.message : "",
    };
  });

  // Auto-save to localStorage on every change
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    setLocalStorage(STORAGE_KEYS.CONTACT_DRAFT, contactDraft);
  }, [contactDraft]);

  const updateContactDraft = useCallback((updates: Partial<ContactDraft>) => {
    setContactDraft((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const clearContactDraft = useCallback(() => {
    removeLocalStorage(STORAGE_KEYS.CONTACT_DRAFT);
    setContactDraft({
      fullName: "",
      email: "",
      phone: "",
      clinicName: "",
      message: "",
    });
  }, []);

  return {
    contactDraft,
    updateContactDraft,
    clearContactDraft,
  };
}

// ============================================================================
// usePendingBooking Hook (sessionStorage for ROI flow)
// ============================================================================

/**
 * Hook for managing pending booking state in sessionStorage
 * Used to preserve booking state when user navigates to ROI calculator
 * @see legacy components/booking-calendar.tsx:187,226,458,830
 */
export function usePendingBooking() {
  const [pendingBooking, setPendingBooking] = useState<PendingBooking | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const stored = getSessionStorage<PendingBooking>(STORAGE_KEYS.PENDING_BOOKING);
    if (!stored) {
      return null;
    }

    // Validate required fields
    if (!stored.date || !stored.time || !stored.contact) {
      removeSessionStorage(STORAGE_KEYS.PENDING_BOOKING);
      return null;
    }

    return stored;
  });

  const savePendingBooking = useCallback((data: PendingBooking) => {
    setSessionStorage(STORAGE_KEYS.PENDING_BOOKING, data);
    setPendingBooking(data);
  }, []);

  const clearPendingBooking = useCallback(() => {
    removeSessionStorage(STORAGE_KEYS.PENDING_BOOKING);
    setPendingBooking(null);
  }, []);

  return {
    pendingBooking,
    savePendingBooking,
    clearPendingBooking,
  };
}

// ============================================================================
// useLastBooking Hook (sessionStorage for contact page)
// ============================================================================

/**
 * Hook for managing last completed booking in sessionStorage
 * Used to prefill contact form from booking data
 * @see legacy app/reservar/page.tsx:84-95
 */
export function useLastBooking() {
  const [lastBooking, setLastBooking] = useState<LastBooking | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const stored = getSessionStorage<LastBooking>(STORAGE_KEYS.LAST_BOOKING);
    if (!stored) {
      return null;
    }

    // Validate required fields
    if (stored.source !== "booking" || !stored.confirm) {
      removeSessionStorage(STORAGE_KEYS.LAST_BOOKING);
      return null;
    }

    return stored;
  });

  const saveLastBooking = useCallback((data: LastBooking) => {
    setSessionStorage(STORAGE_KEYS.LAST_BOOKING, data);
    setLastBooking(data);
  }, []);

  const clearLastBooking = useCallback(() => {
    removeSessionStorage(STORAGE_KEYS.LAST_BOOKING);
    setLastBooking(null);
  }, []);

  return {
    lastBooking,
    saveLastBooking,
    clearLastBooking,
  };
}
