/**
 * Booking API Client - Ported from legacy ClinvetIA system
 *
 * Legacy reference: lib/api/bookings.ts
 *
 * This module provides typed API wrappers for booking operations:
 * - GET /api/availability - Get available slots for a date
 * - POST /api/bookings - Create hold on a slot
 * - POST /api/bookings/confirm - Confirm booking with contact info
 *
 * IMPORTANT: Backend implementation is NOT included in this parity work.
 * These functions will call mock endpoints until backend is implemented.
 *
 * Configuration:
 * - Set NEXT_PUBLIC_USE_MOCK_API=true in .env.local to use mock APIs
 * - By default, it will use real APIs (when they exist)
 */

import type {
  AvailabilityData,
  HoldData,
  ConfirmData,
  CreateHoldInput,
  ConfirmBookingInput,
} from "@/features/booking/booking.types";
import { API_TIMEOUTS } from "@/constants/app";

// Import mocks
import {
  mockGetAvailability,
  mockCreateHold,
  mockConfirmBooking,
} from "@/services/mockApi";

// ============================================================================
// Configuration
// ============================================================================

const USE_MOCK_API =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_USE_MOCK_API === "true"
    : false;

// ============================================================================
// Error Types (API Result Pattern)
// ============================================================================

/**
 * API error structure
 * @see legacy lib/api/bookings.ts:1-5
 */
export interface ApiError {
  ok: false;
  code: string;
  message: string;
  fields?: Record<string, string>;
}

/**
 * Result union type (success | error)
 * @see legacy lib/api/bookings.ts:8
 */
export type ApiResult<T extends object> = ({ ok: true } & T) | ApiError;

/**
 * Availability response
 */
export type AvailabilityResponse = ApiResult<AvailabilityData>;

/**
 * Hold response
 */
export type HoldResponse = ApiResult<HoldData>;

/**
 * Confirm response
 */
export type ConfirmResponse = ApiResult<ConfirmData>;

// ============================================================================
// Fetch Utilities
// ============================================================================

/**
 * Fetch with timeout
 * @see legacy lib/api/bookings.ts:76-94
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout");
    }
    throw error;
  }
}

/**
 * Parse JSON response
 * @see legacy lib/api/bookings.ts:96-122
 */
async function parseJson(response: Response): Promise<{
  ok: boolean;
  value?: unknown;
  error?: ApiError;
}> {
  let json: unknown;

  try {
    json = await response.json();
  } catch {
    return {
      ok: false,
      error: {
        ok: false,
        code: "PARSE_ERROR",
        message: "Failed to parse response",
      },
    };
  }

  if (!response.ok) {
    // Server returned an error
    if (typeof json === "object" && json !== null && "code" in json) {
      return {
        ok: false,
        error: json as ApiError,
      };
    }

    return {
      ok: false,
      error: {
        ok: false,
        code: "UNKNOWN_ERROR",
        message: `HTTP ${response.status}`,
      },
    };
  }

  return {
    ok: true,
    value: json,
  };
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get availability for a specific date
 * @see legacy lib/api/bookings.ts:124-129
 *
 * GET /api/availability?date=YYYY-MM-DD
 *
 * Returns all slots for the date with availability status.
 * Occupied slots are marked as unavailable (CONFIRMED or HELD bookings).
 */
export async function getAvailability(date: string): Promise<AvailabilityResponse> {
  // Use mock API if enabled
  if (USE_MOCK_API) {
    console.log("[API] Using mock getAvailability");
    return mockGetAvailability(date);
  }

  // Real API call
  try {
    const res = await fetchWithTimeout(
      `/api/availability?date=${encodeURIComponent(date)}`,
      { method: "GET" },
      API_TIMEOUTS.AVAILABILITY
    );

    const parsed = await parseJson(res);
    if (!parsed.ok) {
      return parsed.error as ApiError;
    }

    return parsed.value as AvailabilityResponse;
  } catch (error: unknown) {
    return {
      ok: false,
      code: "NETWORK_ERROR",
      message: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Create hold on a time slot
 * @see legacy lib/api/bookings.ts:131-149
 *
 * POST /api/bookings
 * Body: { date, time, timezone, locale }
 *
 * Creates a HELD booking with 10-minute expiration.
 * Returns sessionToken for confirming the booking.
 */
export async function createHold(payload: CreateHoldInput): Promise<HoldResponse> {
  // Use mock API if enabled
  if (USE_MOCK_API) {
    console.log("[API] Using mock createHold");
    return mockCreateHold(payload);
  }

  // Real API call
  try {
    const res = await fetchWithTimeout(
      "/api/bookings",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      },
      API_TIMEOUTS.HOLD
    );

    const parsed = await parseJson(res);
    if (!parsed.ok) {
      return parsed.error as ApiError;
    }

    return parsed.value as HoldResponse;
  } catch (error: unknown) {
    return {
      ok: false,
      code: "NETWORK_ERROR",
      message: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Confirm booking with contact information
 * @see legacy lib/api/bookings.ts:151-175
 *
 * POST /api/bookings/confirm
 * Body: { sessionToken, locale, contact, roi }
 *
 * Confirms a HELD booking by:
 * - Validating sessionToken is not expired
 * - Updating status to CONFIRMED
 * - Saving contact info and ROI data
 * - Generating cancel/reschedule tokens
 * - Sending confirmation email
 */
export async function confirmBooking(
  payload: ConfirmBookingInput
): Promise<ConfirmResponse> {
  // Use mock API if enabled
  if (USE_MOCK_API) {
    console.log("[API] Using mock confirmBooking");
    return mockConfirmBooking(payload);
  }

  // Real API call
  try {
    const res = await fetchWithTimeout(
      "/api/bookings/confirm",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      },
      API_TIMEOUTS.CONFIRM
    );

    const parsed = await parseJson(res);
    if (!parsed.ok) {
      return parsed.error as ApiError;
    }

    return parsed.value as ConfirmResponse;
  } catch (error: unknown) {
    return {
      ok: false,
      code: "NETWORK_ERROR",
      message: error instanceof Error ? error.message : "Network error",
    };
  }
}

// ============================================================================
// Error Code Mapping (for user-friendly messages)
// ============================================================================

/**
 * Map error code to user-friendly message
 * @see legacy components/booking-calendar.tsx:85-96
 */
export function codeToMessage(code: string, t: (key: string) => string): string {
  const key = `book.backend.errors.${code}`;
  const fallback = t("book.backend.errors.UNKNOWN_ERROR");
  const translated = t(key);

  // If translation key not found, use fallback
  return translated === key ? fallback : translated;
}

/**
 * Get email result note (for toast notification)
 * @see legacy components/booking-calendar.tsx:98-101
 */
export function emailNote(
  emailResult: { enabled: boolean; skipped: boolean; ok: boolean; code?: string },
  t: (key: string) => string
): string | null {
  if (!emailResult.enabled) {
    return null;
  }

  if (emailResult.skipped) {
    return null;
  }

  if (!emailResult.ok) {
    return t("book.backend.email_failed");
  }

  return null;
}
