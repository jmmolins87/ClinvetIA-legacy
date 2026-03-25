/**
 * Mock Hold API
 *
 * Simula la creación de holds (reservas temporales de 10 minutos).
 *
 * Validaciones:
 * - Fecha/hora no en el pasado
 * - Same-day cutoff (19:00)
 * - Slot no ocupado
 * - Timezone correcto
 */

import { parseYYYYMMDD, isAfterCutoff1900, isSameDayLocal, parseTimeHHmm } from "@/features/booking/booking.calc";
import { BOOKING_CONFIG } from "@/features/booking/booking.calc";
import { mockState } from "./mockState";
import type { HoldResponse } from "@/services/api/bookings";
import type { CreateHoldInput } from "@/features/booking/booking.types";

// ============================================================================
// Configuration
// ============================================================================

const MOCK_DELAY_MS = 500; // Simular latencia de red (más lento que availability)

// ============================================================================
// Mock API
// ============================================================================

export async function mockCreateHold(payload: CreateHoldInput): Promise<HoldResponse> {
  // Simular latencia de red
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  
  try {
    const { date, time, timezone, locale } = payload;
    
    // ========================================================================
    // Validaciones
    // ========================================================================
    
    // Validar timezone
    if (timezone !== "Europe/Madrid") {
      return {
        ok: false,
        code: "INVALID_INPUT",
        message: "Invalid timezone",
        fields: { timezone: "Only Europe/Madrid is supported" },
      };
    }
    
    // Validar formato de fecha
    let dateObj: Date;
    try {
      dateObj = parseYYYYMMDD(date);
    } catch {
      return {
        ok: false,
        code: "INVALID_INPUT",
        message: "Invalid date format",
        fields: { date: "Expected YYYY-MM-DD format" },
      };
    }
    
    // Validar formato de hora
    try {
      parseTimeHHmm(time);
    } catch {
      return {
        ok: false,
        code: "INVALID_INPUT",
        message: "Invalid time format",
        fields: { time: "Expected HH:mm format" },
      };
    }
    
    // Validar que no sea pasado
    const now = new Date();
    const dateAtMidnight = new Date(dateObj);
    dateAtMidnight.setHours(0, 0, 0, 0);
    
    const todayAtMidnight = new Date(now);
    todayAtMidnight.setHours(0, 0, 0, 0);
    
    if (dateAtMidnight < todayAtMidnight) {
      return {
        ok: false,
        code: "INVALID_INPUT",
        message: "Cannot create hold for past date",
        fields: { date: "Date must be today or future" },
      };
    }
    
    // Validar same-day cutoff
    if (isSameDayLocal(dateObj, now) && isAfterCutoff1900(now)) {
      return {
        ok: false,
        code: "INVALID_INPUT",
        message: "Same-day bookings not allowed after 19:00",
        fields: { date: "Cannot book for today after 19:00" },
      };
    }
    
    // Expirar holds antiguos
    mockState.expireOldHolds();
    
    // Validar que el slot no esté ocupado
    const existing = mockState.getBookingsByDateAndTime(date, time);
    if (existing.length > 0) {
      return {
        ok: false,
        code: "SLOT_TAKEN",
        message: "This time slot is already booked",
      };
    }
    
    // ========================================================================
    // Crear Hold
    // ========================================================================
    
    // Calcular start/end times
    const [hours, minutes] = time.split(":").map(Number);
    const startAt = new Date(dateObj);
    startAt.setHours(hours, minutes, 0, 0);
    
    const endAt = new Date(startAt);
    endAt.setMinutes(endAt.getMinutes() + BOOKING_CONFIG.slotMinutes);
    
    // Calcular expiration (10 minutos desde ahora)
    const expiresAt = new Date(now);
    expiresAt.setMinutes(expiresAt.getMinutes() + BOOKING_CONFIG.holdTtlMinutes);
    
    // Crear booking con status HELD
    const booking = mockState.createBooking({
      status: "HELD",
      date,
      time,
      startAtISO: startAt.toISOString(),
      endAtISO: endAt.toISOString(),
      expiresAtISO: expiresAt.toISOString(),
      timezone,
      locale,
    });
    
    // Crear session token
    const sessionToken = mockState.createToken({
      bookingId: booking.id,
      kind: "SESSION",
      expiresAt: expiresAt.toISOString(),
    });
    
    console.log(`[Mock API] Hold created: ${date} ${time} (expires in ${BOOKING_CONFIG.holdTtlMinutes} min)`);
    
    return {
      ok: true,
      sessionToken: sessionToken.token,
      booking: {
        date: booking.date,
        time: booking.time,
        startAtISO: booking.startAtISO,
        endAtISO: booking.endAtISO,
        expiresAtISO: booking.expiresAtISO,
        timezone: booking.timezone,
        locale: booking.locale,
        status: booking.status,
      },
    };
  } catch (error) {
    console.error("[Mock API] Error in createHold:", error);
    
    return {
      ok: false,
      code: "INTERNAL_ERROR",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
