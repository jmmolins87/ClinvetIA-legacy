/**
 * Booking types - Ported from legacy ClinvetIA system
 *
 * Legacy references:
 * - lib/api/bookings.ts (API response types)
 * - lib/db/models/Booking.ts (database models)
 * - components/booking-calendar.tsx (frontend types)
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Booking status enum (matches legacy BookingStatus)
 * @see legacy lib/db/models/Booking.ts:3-9
 */
export type BookingStatus = "HELD" | "CONFIRMED" | "CANCELLED" | "RESCHEDULED" | "EXPIRED";

/**
 * Supported locale
 */
export type BookingLocale = "es" | "en";

/**
 * Timezone (only Europe/Madrid supported)
 */
export type BookingTimezone = "Europe/Madrid";

// ============================================================================
// Availability Types
// ============================================================================

/**
 * Single time slot with availability status
 * @see legacy lib/api/bookings.ts:10-14
 */
export interface AvailabilitySlot {
  start: string;       // "HH:mm" format (e.g., "09:00")
  end: string;         // "HH:mm" format (e.g., "09:30")
  available: boolean;
}

/**
 * Availability response for a specific date
 * @see legacy lib/api/bookings.ts:16-21
 */
export interface AvailabilityData {
  date: string;              // YYYY-MM-DD
  timezone: BookingTimezone;
  slotMinutes: number;       // 30
  slots: AvailabilitySlot[];
}

// ============================================================================
// Hold Types
// ============================================================================

/**
 * Hold creation input
 * @see legacy lib/booking/holds.ts:24-30
 */
export interface CreateHoldInput {
  date: string;              // YYYY-MM-DD
  time: string;              // HH:mm
  timezone: BookingTimezone;
  locale: BookingLocale;
}

/**
 * Hold response data
 * @see legacy lib/api/bookings.ts:27-39
 */
export interface HoldData {
  sessionToken: string;
  booking: {
    date: string;            // YYYY-MM-DD
    time: string;            // HH:mm
    startAtISO: string;      // ISO 8601 datetime
    endAtISO: string;        // ISO 8601 datetime
    expiresAtISO: string | null;  // ISO 8601 datetime (null if confirmed)
    timezone: BookingTimezone;
    locale: BookingLocale;
    status: BookingStatus;
  };
}

/**
 * Frontend hold state (client-side representation)
 * @see legacy components/booking-calendar.tsx:143
 */
export interface HoldState {
  sessionToken: string;
  expiresAt: Date;          // Parsed expiration date
  date: string;             // YYYY-MM-DD
  time: string;             // HH:mm
}

// ============================================================================
// Confirmation Types
// ============================================================================

/**
 * Contact information for booking confirmation
 * @see legacy app/api/bookings/confirm/route.ts:16-23
 */
export interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  clinicName?: string;
  message?: string;
}

/**
 * Booking confirmation input
 * @see legacy app/api/bookings/confirm/route.ts:25-30
 */
export interface ConfirmBookingInput {
  sessionToken: string;
  locale: BookingLocale;
  contact: ContactInfo;
  roi: unknown;             // Must be non-empty JSON object
}

/**
 * Email send result
 */
export interface EmailResult {
  enabled: boolean;
  skipped: boolean;
  provider: "brevo";
  ok: boolean;
  code?: string;
  messageId?: string;
}

/**
 * Booking confirmation response
 * @see legacy lib/api/bookings.ts:50-71
 */
export interface ConfirmData {
  booking: {
    id: string;
    status: BookingStatus;
    startAtISO: string;
    endAtISO: string;
    timezone: BookingTimezone;
    locale: BookingLocale;
    confirmedAtISO: string | null;
    contact: {
      fullName: string | null;
      email: string | null;
      phone: string | null;
      clinicName: string | null;
      message: string | null;
    };
  };
  cancel: {
    token: string;
    url: string;
  };
  reschedule: {
    token: string;
    url: string;
  };
  ics: {
    url: string;
  };
  email: EmailResult;
}

// ============================================================================
// Storage Types
// ============================================================================

/**
 * Calendly data stored in localStorage (30-day TTL)
 * @see legacy hooks/use-calendly-data.ts:5-15
 */
export interface CalendlyData {
  eventUri: string;          // "booking-{timestamp}"
  inviteeUri: string;        // "invitee-{timestamp}"
  eventType: string;         // "Demo"
  inviteeName?: string;
  inviteeEmail?: string;
  timestamp: number;         // Date.now()
  scheduledDate?: string;    // ISO date
  scheduledTime?: string;    // "HH:mm"
  message?: string;
}

/**
 * Contact draft saved in localStorage
 * @see legacy components/booking-calendar.tsx:166,238,412
 */
export interface ContactDraft {
  fullName: string;
  email: string;
  phone: string;
  clinicName: string;
  message: string;
}

/**
 * Pending booking state saved in sessionStorage during ROI flow
 * @see legacy components/booking-calendar.tsx:187,226,458,830
 */
export interface PendingBooking {
  date: string;              // ISO date
  time: string;              // HH:mm
  step: 2 | 3;
  contact: ContactDraft;
  hold: {
    sessionToken: string;
    expiresAt: string;       // ISO date
    date: string;            // YYYY-MM-DD
    time: string;            // HH:mm
  } | null;
}

/**
 * Hold state for cross-page persistence
 */
export interface HoldStateSerialized {
  sessionToken: string;
  expiresAt: string;         // ISO date
  date: string;              // YYYY-MM-DD
  time: string;              // HH:mm
}

/**
 * Last completed booking saved in sessionStorage
 * @see legacy app/reservar/page.tsx:84-95
 */
export interface LastBooking {
  source: "booking";
  createdAt: number;         // Date.now()
  confirm?: ConfirmData;     // Present if booking completed
  hold?: HoldStateSerialized; // Present if hold created but not confirmed
  dateISO: string;           // ISO date
  time: string;              // HH:mm
  roi: unknown;              // ROI data (can be null)
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Time in HH:mm format with total minutes
 */
export interface ParsedTime {
  hours: number;
  minutes: number;
  totalMinutes: number;
}

/**
 * Slot definition (before availability check)
 */
export interface SlotDef {
  start: string;  // "HH:mm"
  end: string;    // "HH:mm"
}
