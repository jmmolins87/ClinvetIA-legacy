/**
 * Booking calculation utilities - Ported from legacy ClinvetIA system
 *
 * Legacy references:
 * - lib/booking/config.ts (booking configuration)
 * - lib/booking/time.ts (slot generation, time parsing, cutoff logic)
 *
 * Key constants (MUST match legacy exactly):
 * - Start time: 09:00
 * - End time: 17:30
 * - Slot duration: 30 minutes
 * - Timezone: Europe/Madrid
 * - Same-day cutoff: 19:00 (7 PM)
 */

import type { SlotDef, ParsedTime } from "./booking.types";

// ============================================================================
// Configuration (Exact Legacy Values)
// ============================================================================

/**
 * Booking configuration (matches legacy lib/booking/config.ts:17-30)
 */
export const BOOKING_CONFIG = {
  timeZone: "Europe/Madrid" as const,
  startTime: "09:00",
  endTime: "17:30",
  slotMinutes: 30,
  holdTtlMinutes: 10,  // NOTE: Legacy uses 10 minutes, not 5!
  cutoffHour: 19,      // Same-day bookings blocked after 19:00
} as const;

// ============================================================================
// Time Parsing & Formatting
// ============================================================================

/**
 * Parse "HH:mm" string to minutes since midnight
 * @see legacy lib/booking/time.ts:79-84
 */
export function parseTimeHHmm(time: string): ParsedTime {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) {
    throw new Error(`Invalid time format: ${time}`);
  }

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid time values: ${time}`);
  }

  return {
    hours,
    minutes,
    totalMinutes: hours * 60 + minutes,
  };
}

/**
 * Convert minutes since midnight to "HH:mm" string
 * @see legacy lib/booking/time.ts:59-67
 */
export function minutesToHHmm(totalMinutes: number): string {
  if (!Number.isFinite(totalMinutes) || totalMinutes < 0 || totalMinutes >= 1440) {
    throw new Error(`Invalid minutes: ${totalMinutes}`);
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD string to local Date (midnight)
 */
export function parseYYYYMMDD(dateStr: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);

  const date = new Date(year, month, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    throw new Error(`Invalid date: ${dateStr}`);
  }

  return date;
}

// ============================================================================
// Slot Generation
// ============================================================================

/**
 * Generate all time slots for a given date
 * @see legacy lib/booking/time.ts:227-255
 *
 * Example output for default config:
 * [
 *   { start: "09:00", end: "09:30" },
 *   { start: "09:30", end: "10:00" },
 *   ...
 *   { start: "17:00", end: "17:30" }
 * ]
 */
export function generateSlotsForDate(date: string): SlotDef[] {
  // Validate date format
  parseYYYYMMDD(date);

  const start = parseTimeHHmm(BOOKING_CONFIG.startTime);     // 09:00 = 540 min
  const end = parseTimeHHmm(BOOKING_CONFIG.endTime);         // 17:30 = 1050 min

  if (BOOKING_CONFIG.slotMinutes <= 0) {
    throw new Error("Invalid slot duration");
  }

  if (start.totalMinutes >= end.totalMinutes) {
    throw new Error("Invalid booking window: start must be before end");
  }

  const slots: SlotDef[] = [];

  // Generate slots from start to end in slotMinutes increments
  // Loop: t = 540, 570, 600, ..., 1020 (stops when t + 30 > 1050)
  for (
    let t = start.totalMinutes;
    t + BOOKING_CONFIG.slotMinutes <= end.totalMinutes;
    t += BOOKING_CONFIG.slotMinutes
  ) {
    slots.push({
      start: minutesToHHmm(t),
      end: minutesToHHmm(t + BOOKING_CONFIG.slotMinutes),
    });
  }

  return slots;
}

// ============================================================================
// Date Validation
// ============================================================================

/**
 * Check if date is same-day as today (in local time)
 */
export function isSameDayLocal(date: Date, today: Date): boolean {
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

/**
 * Check if date is in the past (midnight comparison)
 */
export function isDatePast(date: Date, now: Date): boolean {
  const dateAtMidnight = new Date(date);
  dateAtMidnight.setHours(0, 0, 0, 0);

  const todayAtMidnight = new Date(now);
  todayAtMidnight.setHours(0, 0, 0, 0);

  return dateAtMidnight < todayAtMidnight;
}

/**
 * Check if current time is after same-day booking cutoff (19:00)
 * @see legacy lib/booking/time.ts:169-195
 */
export function isAfterCutoff1900(now: Date): boolean {
  const hours = now.getHours();
  return hours >= BOOKING_CONFIG.cutoffHour;
}

/**
 * Check if same-day booking is allowed for a date
 * Returns true if booking is allowed, false if blocked
 * @see legacy lib/booking/time.ts:169-195
 */
export function canBookSameDay(date: Date, now: Date): boolean {
  // Only check cutoff for same-day bookings
  if (!isSameDayLocal(date, now)) {
    return true;
  }

  // Block same-day bookings after 19:00
  return !isAfterCutoff1900(now);
}

/**
 * Check if a date is available for booking
 * Criteria:
 * - Not in the past
 * - Not a weekend (0 = Sunday, 6 = Saturday)
 * - Not more than 60 days in the future
 * - If same-day, must be before 19:00 cutoff
 */
export function isDateAvailable(date: Date, now: Date): boolean {
  // No weekends
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false;
  }

  // Not in the past
  if (isDatePast(date, now)) {
    return false;
  }

  // Not more than 60 days in the future
  const todayAtMidnight = new Date(now);
  todayAtMidnight.setHours(0, 0, 0, 0);

  const maxDate = new Date(todayAtMidnight);
  maxDate.setDate(maxDate.getDate() + 60);

  const dateAtMidnight = new Date(date);
  dateAtMidnight.setHours(0, 0, 0, 0);

  if (dateAtMidnight > maxDate) {
    return false;
  }

  // Check same-day cutoff
  if (!canBookSameDay(date, now)) {
    return false;
  }

  return true;
}

// ============================================================================
// Hold Calculations
// ============================================================================

/**
 * Calculate hold expiration time
 * @see legacy lib/booking/holds.ts:51
 */
export function calculateHoldExpiration(now: Date): Date {
  return new Date(now.getTime() + BOOKING_CONFIG.holdTtlMinutes * 60_000);
}

/**
 * Calculate seconds remaining until hold expiration
 * @see legacy components/booking-calendar.tsx:75-77
 */
export function secondsLeft(expiresAt: Date, now: Date): number {
  return Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
}

/**
 * Format countdown display (MM:SS)
 * @see legacy components/booking-calendar.tsx:79-83
 */
export function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// ============================================================================
// Calendar Helpers
// ============================================================================

/**
 * Get days in month info for calendar rendering
 */
export function getDaysInMonth(date: Date): {
  year: number;
  month: number;
  daysInMonth: number;
  startingDayOfWeek: number;
} {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  return {
    year,
    month,
    daysInMonth: lastDay.getDate(),
    startingDayOfWeek: firstDay.getDay(),
  };
}
