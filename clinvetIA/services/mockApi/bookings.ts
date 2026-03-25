/**
 * Mock Confirm Booking API
 *
 * Simula la confirmación de un booking (de HELD → CONFIRMED).
 *
 * Validaciones:
 * - sessionToken válido y no expirado
 * - Booking existe y está en status HELD
 * - ROI data requerido y no vacío
 * - Contact info válida
 */

import { mockState } from "./mockState";
import type { ConfirmResponse } from "@/services/api/bookings";
import type { ConfirmBookingInput } from "@/features/booking/booking.types";

// ============================================================================
// Configuration
// ============================================================================

const MOCK_DELAY_MS = 700; // Simular latencia de red (más lento, es operación pesada)
const CANCEL_TOKEN_EXPIRY_DAYS = 30;
const RESCHEDULE_TOKEN_EXPIRY_DAYS = 30;

// ============================================================================
// Helpers
// ============================================================================

function isNonEmptyObject(value: unknown): boolean {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  
  return Object.keys(value as Record<string, unknown>).length > 0;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// ============================================================================
// Mock API
// ============================================================================

export async function mockConfirmBooking(payload: ConfirmBookingInput): Promise<ConfirmResponse> {
  // Simular latencia de red
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  
  try {
    const { sessionToken, locale, contact, roi } = payload;
    
    // ========================================================================
    // Validaciones
    // ========================================================================
    
    // Validar ROI data
    if (!isNonEmptyObject(roi)) {
      return {
        ok: false,
        code: "ROI_REQUIRED",
        message: "ROI data is required",
      };
    }
    
    // Validar contact info
    if (!contact.fullName || contact.fullName.trim().length < 2) {
      return {
        ok: false,
        code: "INVALID_INPUT",
        message: "Invalid input",
        fields: { fullName: "Full name is required (min 2 characters)" },
      };
    }
    
    if (!contact.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      return {
        ok: false,
        code: "INVALID_INPUT",
        message: "Invalid input",
        fields: { email: "Valid email is required" },
      };
    }
    
    if (!contact.phone || contact.phone.trim().length < 7) {
      return {
        ok: false,
        code: "INVALID_INPUT",
        message: "Invalid input",
        fields: { phone: "Phone is required (min 7 characters)" },
      };
    }
    
    // Expirar holds antiguos
    mockState.expireOldHolds();
    
    // Buscar token
    const token = mockState.getTokenByValue(sessionToken);
    if (!token || token.kind !== "SESSION") {
      return {
        ok: false,
        code: "TOKEN_INVALID",
        message: "Invalid token",
      };
    }
    
    // Verificar que no esté expirado
    const now = new Date();
    if (new Date(token.expiresAt) <= now) {
      return {
        ok: false,
        code: "TOKEN_EXPIRED",
        message: "Token expired",
      };
    }
    
    // Buscar booking
    const booking = mockState.getBooking(token.bookingId);
    if (!booking) {
      return {
        ok: false,
        code: "NOT_FOUND",
        message: "Booking not found",
      };
    }
    
    // Verificar status
    if (booking.status !== "HELD" && booking.status !== "CONFIRMED") {
      return {
        ok: false,
        code: "BOOKING_NOT_HELD",
        message: "Booking not held",
      };
    }
    
    const wasAlreadyConfirmed = booking.status === "CONFIRMED";
    
    // ========================================================================
    // Confirmar Booking
    // ========================================================================
    
    if (!wasAlreadyConfirmed) {
      // Actualizar booking a CONFIRMED
      mockState.updateBooking(booking.id, {
        status: "CONFIRMED",
        confirmedAt: now.toISOString(),
        expiresAtISO: null,
        locale,
        contact: {
          fullName: contact.fullName.trim(),
          email: contact.email.trim(),
          phone: contact.phone.trim(),
          clinicName: contact.clinicName?.trim() || null,
          message: contact.message?.trim() || null,
        },
        roiData: roi,
      });
    }
    
    // Extender expiration del session token (legacy behavior)
    const sessionExtendedTo = addDays(now, RESCHEDULE_TOKEN_EXPIRY_DAYS);
    // (En mock no lo guardamos, pero en real sí se hace)
    
    // Crear tokens de cancel y reschedule
    const cancelToken = mockState.createToken({
      bookingId: booking.id,
      kind: "CANCEL",
      expiresAt: addDays(now, CANCEL_TOKEN_EXPIRY_DAYS).toISOString(),
    });
    
    const rescheduleToken = mockState.createToken({
      bookingId: booking.id,
      kind: "RESCHEDULE",
      expiresAt: addDays(now, RESCHEDULE_TOKEN_EXPIRY_DAYS).toISOString(),
    });
    
    // Obtener booking actualizado
    const updatedBooking = mockState.getBooking(booking.id)!;
    
    console.log(`[Mock API] Booking confirmed: ${updatedBooking.uid} (${updatedBooking.date} ${updatedBooking.time})`);
    
    // ========================================================================
    // Respuesta
    // ========================================================================
    
    // Simular envío de email (siempre exitoso en mock, pero podría fallar)
    const emailSuccess = Math.random() > 0.1; // 90% success rate
    
    return {
      ok: true,
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        startAtISO: updatedBooking.startAtISO,
        endAtISO: updatedBooking.endAtISO,
        timezone: updatedBooking.timezone,
        locale: updatedBooking.locale,
        confirmedAtISO: updatedBooking.confirmedAt,
        contact: {
          fullName: updatedBooking.contact.fullName,
          email: updatedBooking.contact.email,
          phone: updatedBooking.contact.phone,
          clinicName: updatedBooking.contact.clinicName,
          message: updatedBooking.contact.message,
        },
      },
      cancel: {
        token: cancelToken.token,
        url: `/cancel?token=${encodeURIComponent(cancelToken.token)}`,
      },
      reschedule: {
        token: rescheduleToken.token,
        url: `/reschedule?token=${encodeURIComponent(rescheduleToken.token)}`,
      },
      ics: {
        url: `/api/bookings/ics/download?token=${encodeURIComponent(sessionToken)}`,
      },
      email: {
        enabled: true,
        skipped: wasAlreadyConfirmed,
        provider: "brevo",
        ok: emailSuccess,
        ...(emailSuccess ? { messageId: `mock_msg_${Date.now()}` } : { code: "EMAIL_FAILED" }),
      },
    };
  } catch (error) {
    console.error("[Mock API] Error in confirmBooking:", error);
    
    return {
      ok: false,
      code: "INTERNAL_ERROR",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
