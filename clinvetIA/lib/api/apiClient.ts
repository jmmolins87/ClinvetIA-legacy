/**
 * API Client with Error Handling
 *
 * Wrapper functions for API calls with integrated error handling,
 * retry logic, and toast notifications.
 */

"use client";

import {
  getAvailability as getAvailabilityRaw,
  createHold as createHoldRaw,
  confirmBooking as confirmBookingRaw,
  type AvailabilityResponse,
  type HoldResponse,
  type ConfirmResponse,
} from "@/services/api/bookings";
import type { CreateHoldInput, ConfirmBookingInput } from "@/features/booking/booking.types";
import { withErrorHandling, type ErrorHandlerConfig } from "./errorHandler";
import { showErrorToast } from "./errorToast";
import type { ErrorLocale } from "./errorMessages";

// ============================================================================
// Configuration
// ============================================================================

/**
 * Default error handler config for booking APIs
 */
const DEFAULT_BOOKING_CONFIG: ErrorHandlerConfig = {
  maxRetries: 2,
  retryDelay: 1000,
  context: "booking-api",
};

// ============================================================================
// Availability API
// ============================================================================

/**
 * Get availability with error handling and retry logic
 *
 * @example
 * const result = await getAvailability("2026-02-16", {
 *   showToasts: true,
 *   locale: "es",
 * });
 */
export async function getAvailability(
  date: string,
  options: {
    showToasts?: boolean;
    locale?: ErrorLocale;
    maxRetries?: number;
  } = {}
): Promise<AvailabilityResponse> {
  const { showToasts = false, locale = "es", maxRetries = 2 } = options;

  try {
    return await withErrorHandling(
      () => getAvailabilityRaw(date),
      {
        ...DEFAULT_BOOKING_CONFIG,
        maxRetries,
        context: "availability-api",
      }
    );
  } catch (error: any) {
    if (showToasts && error.ok === false) {
      showErrorToast(error, { locale });
    }
    throw error;
  }
}

// ============================================================================
// Hold API
// ============================================================================

/**
 * Create hold with error handling and retry logic
 *
 * @example
 * const result = await createHold(
 *   { date: "2026-02-16", time: "09:00", timezone: "Europe/Madrid", locale: "es" },
 *   { showToasts: true, locale: "es" }
 * );
 */
export async function createHold(
  input: CreateHoldInput,
  options: {
    showToasts?: boolean;
    locale?: ErrorLocale;
    maxRetries?: number;
  } = {}
): Promise<HoldResponse> {
  const { showToasts = false, locale = "es", maxRetries = 1 } = options;

  try {
    return await withErrorHandling(
      () => createHoldRaw(input),
      {
        ...DEFAULT_BOOKING_CONFIG,
        maxRetries,
        context: "hold-api",
        // Don't retry SLOT_TAKEN - it's not recoverable
        shouldRetry: (error) => {
          if (error.code === "SLOT_TAKEN") {
            return false;
          }
          return error.code === "NETWORK_ERROR" || error.code === "TIMEOUT";
        },
      }
    );
  } catch (error: any) {
    if (showToasts && error.ok === false) {
      showErrorToast(error, { locale, useDefaultAction: error.code === "SLOT_TAKEN" });
    }
    throw error;
  }
}

// ============================================================================
// Confirm Booking API
// ============================================================================

/**
 * Confirm booking with error handling and retry logic
 *
 * @example
 * const result = await confirmBooking(
 *   { sessionToken: "abc", locale: "es", contact: {...}, roi: {...} },
 *   { showToasts: true, locale: "es" }
 * );
 */
export async function confirmBooking(
  input: ConfirmBookingInput,
  options: {
    showToasts?: boolean;
    locale?: ErrorLocale;
    maxRetries?: number;
  } = {}
): Promise<ConfirmResponse> {
  const { showToasts = false, locale = "es", maxRetries = 1 } = options;

  try {
    return await withErrorHandling(
      () => confirmBookingRaw(input),
      {
        ...DEFAULT_BOOKING_CONFIG,
        maxRetries,
        context: "confirm-api",
        // Don't retry validation errors
        shouldRetry: (error) => {
          const nonRetryableCodes = [
            "INVALID_INPUT",
            "ROI_REQUIRED",
            "TOKEN_INVALID",
            "TOKEN_EXPIRED",
            "BOOKING_NOT_HELD",
          ];
          if (nonRetryableCodes.includes(error.code)) {
            return false;
          }
          return error.code === "NETWORK_ERROR" || error.code === "TIMEOUT";
        },
      }
    );
  } catch (error: any) {
    if (showToasts && error.ok === false) {
      showErrorToast(error, {
        locale,
        useDefaultAction: error.code === "ROI_REQUIRED" || error.code === "TOKEN_INVALID",
      });
    }
    throw error;
  }
}

// ============================================================================
// Batch Operations
// ============================================================================

/**
 * Execute multiple API calls with error handling
 * Returns partial results if some calls fail
 */
export async function batchApiCalls<T>(
  calls: Array<() => Promise<T>>,
  options: {
    failFast?: boolean;
    showToasts?: boolean;
    locale?: ErrorLocale;
  } = {}
): Promise<Array<T | null>> {
  const { failFast = false, showToasts = false, locale = "es" } = options;

  if (failFast) {
    // Fail on first error
    return Promise.all(
      calls.map(async (call) => {
        try {
          return await call();
        } catch (error: any) {
          if (showToasts && error.ok === false) {
            showErrorToast(error, { locale });
          }
          throw error;
        }
      })
    );
  } else {
    // Continue on errors, return null for failures
    return Promise.all(
      calls.map(async (call) => {
        try {
          return await call();
        } catch (error: any) {
          if (showToasts && error.ok === false) {
            showErrorToast(error, { locale });
          }
          return null;
        }
      })
    );
  }
}
