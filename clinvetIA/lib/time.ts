/**
 * Time and timezone utilities
 * All booking times use Europe/Madrid timezone
 */

export const TIMEZONE = "Europe/Madrid" as const;

/**
 * Same-day cutoff time (19:30 in Europe/Madrid)
 * After this time, same-day slots are not available
 */
export const SAME_DAY_CUTOFF_HOUR = 19;
export const SAME_DAY_CUTOFF_MINUTE = 30;

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Format a Date to ISO date string (YYYY-MM-DD)
 */
export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${year}-${month}-${day}`;
}

/**
 * Parse ISO date string (YYYY-MM-DD) to Date object
 * Safari-compatible: uses Date constructor instead of Date.parse
 */
export function parseIsoDate(isoDate: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return null;

  const [, year, month, day] = match;
  const yearNum = Number(year);
  const monthNum = Number(month);
  const dayNum = Number(day);

  // Create date at midnight local time (Safari-safe)
  const date = new Date(yearNum, monthNum - 1, dayNum, 0, 0, 0, 0);

  // Validate date is valid (e.g., reject 2026-02-31)
  if (
    date.getFullYear() !== yearNum ||
    date.getMonth() !== monthNum - 1 ||
    date.getDate() !== dayNum
  ) {
    return null;
  }

  return date;
}

/**
 * Parse ISO datetime string to Date object
 * Safari-compatible: handles ISO 8601 format
 */
export function parseIsoDateTime(isoDateTime: string): Date | null {
  try {
    // Safari requires strict ISO 8601 format
    const date = new Date(isoDateTime);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return null;
    }

    return date;
  } catch {
    return null;
  }
}

/**
 * Format time to HH:mm
 */
export function formatTime(hour: number, minute: number): string {
  return `${pad2(hour)}:${pad2(minute)}`;
}

/**
 * Parse HH:mm to { hour, minute }
 */
export function parseTime(time: string): { hour: number; minute: number } | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }

  return { hour, minute };
}

/**
 * Get current time in Europe/Madrid timezone
 */
export function getNowInTimezone(): Date {
  // For client-side, we use the browser's time and convert
  // This is a simplified version; server would use proper timezone libraries
  return new Date();
}

/**
 * Check if a given date/time is past the same-day cutoff
 */
export function isPastCutoff(date: Date): boolean {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const totalMinutes = hour * 60 + minute;
  const cutoffMinutes = SAME_DAY_CUTOFF_HOUR * 60 + SAME_DAY_CUTOFF_MINUTE;
  
  return totalMinutes >= cutoffMinutes;
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Check if date1 is same day as date2
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
