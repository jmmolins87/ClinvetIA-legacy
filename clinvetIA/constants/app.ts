/**
 * Application-wide constants
 */

// Timezone
export const TIMEZONE = "Europe/Madrid" as const;

// Same-day booking cutoff (19:00)
// CRITICAL: Legacy uses 19:00, not 19:30!
export const SAME_DAY_CUTOFF = {
  hour: 19,
  minute: 0,
} as const;

// Booking configuration
// CRITICAL: These values MUST match legacy exactly
export const BOOKING = {
  slotDurationMinutes: 30,
  holdTtlMinutes: 10,  // Legacy uses 10 minutes, not 5!
  startTime: "09:00",
  endTime: "17:30",    // Legacy uses 17:30, not 18:00!
} as const;

// Storage keys (must match legacy exactly)
export const STORAGE_KEYS = {
  // localStorage
  ROI_DATA: "clinvetia-roi-data",
  CALENDLY_DATA: "clinvetia-calendly-data",
  CONTACT_DRAFT: "clinvetia-contact-draft",
  CONTACT_SUBMITTED: "clinvetia-contact-submitted",
  LANG: "clinvetia.lang",
  THEME: "theme",

  // sessionStorage
  PENDING_BOOKING: "clinvetia-pending-booking",
  LAST_BOOKING: "lastBooking",
} as const;

// TTLs
export const TTL = {
  CALENDLY_DATA_MS: 30 * 24 * 60 * 60 * 1000, // 30 days
  SCHEDULED_EVENT_PAST_MS: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// API timeouts (match legacy)
export const API_TIMEOUTS = {
  AVAILABILITY: 9000, // 9s
  HOLD: 12000, // 12s
  CONFIRM: 14000, // 14s
  HEALTH: 6000, // 6s
} as const;

// Locales
export const LOCALES = {
  DEFAULT: "es",
  SUPPORTED: ["es", "en"] as const,
} as const;

export type Locale = (typeof LOCALES.SUPPORTED)[number];

// Theme
export const THEMES = {
  DEFAULT: "light",
  OPTIONS: ["light", "dark", "system"] as const,
} as const;

export type Theme = (typeof THEMES.OPTIONS)[number];
