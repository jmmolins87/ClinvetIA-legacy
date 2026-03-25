/**
 * Mock Availability API
 *
 * Genera slots determinísticos basados en la fecha para simular disponibilidad.
 *
 * Lógica determinística:
 * - Los slots pares (09:00, 10:00, 11:00...) están ocupados los días pares del mes
 * - Los slots impares (09:30, 10:30, 11:30...) están ocupados los días impares del mes
 * - Siempre hay al menos 50% de slots disponibles
 * - Respeta same-day cutoff (19:00)
 * - Respeta weekends
 * - Integra con bookings reales del mockState
 */

import { generateSlotsForDate, parseYYYYMMDD, isAfterCutoff1900, isSameDayLocal } from "@/features/booking/booking.calc";
import { mockState } from "./mockState";
import type { AvailabilityResponse } from "@/services/api/bookings";

// ============================================================================
// Configuration
// ============================================================================

const MOCK_DELAY_MS = 300; // Simular latencia de red

// ============================================================================
// Helper: Slot ocupado de forma determinística
// ============================================================================

function isSlotOccupiedDeterministic(date: string, time: string): boolean {
  const dateObj = parseYYYYMMDD(date);
  const dayOfMonth = dateObj.getDate();
  
  // Extraer hora del slot
  const [hours, minutes] = time.split(":").map(Number);
  
  // Lógica determinística:
  // - Días pares: slots en horas pares están ocupados (10:00, 12:00, 14:00, 16:00)
  // - Días impares: slots en horas impares están ocupados (09:00, 09:30, 11:00, 11:30, etc.)
  
  const isEvenDay = dayOfMonth % 2 === 0;
  const isEvenHour = hours % 2 === 0;
  const hasMinutes = minutes > 0;
  
  if (isEvenDay) {
    // Días pares: ocupar solo horas pares exactas (10:00, 12:00, no 10:30)
    return isEvenHour && !hasMinutes;
  } else {
    // Días impares: ocupar horas impares (09:00, 09:30, 11:00, 11:30)
    return !isEvenHour || hasMinutes;
  }
}

// ============================================================================
// Mock API
// ============================================================================

export async function mockGetAvailability(date: string): Promise<AvailabilityResponse> {
  // Simular latencia de red
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  
  try {
    // Validar formato de fecha
    const dateObj = parseYYYYMMDD(date);
    const now = new Date();
    
    // Validar que no sea pasado (midnight comparison)
    const dateAtMidnight = new Date(dateObj);
    dateAtMidnight.setHours(0, 0, 0, 0);
    
    const todayAtMidnight = new Date(now);
    todayAtMidnight.setHours(0, 0, 0, 0);
    
    if (dateAtMidnight < todayAtMidnight) {
      return {
        ok: false,
        code: "INVALID_INPUT",
        message: "Cannot get availability for past dates",
        fields: { date: "Date must be today or future" },
      };
    }
    
    // Validar same-day cutoff (19:00)
    if (isSameDayLocal(dateObj, now) && isAfterCutoff1900(now)) {
      return {
        ok: false,
        code: "INVALID_INPUT",
        message: "Same-day bookings not allowed after 19:00",
        fields: { date: "Cannot book for today after 19:00. Please select a future date." },
      };
    }
    
    // Validar fin de semana
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return {
        ok: false,
        code: "INVALID_INPUT",
        message: "Bookings not available on weekends",
        fields: { date: "Please select a weekday" },
      };
    }
    
    // Expirar holds antiguos antes de calcular disponibilidad
    mockState.expireOldHolds();
    
    // Generar todos los slots para el día
    const allSlots = generateSlotsForDate(date);
    
    // Obtener bookings reales del mockState para esta fecha
    const existingBookings = mockState.getBookingsByDate(date);
    const occupiedTimes = new Set(existingBookings.map((b) => b.time));
    
    // Mapear slots con disponibilidad
    const slots = allSlots.map((slot) => {
      // Primero verificar si hay booking real
      if (occupiedTimes.has(slot.start)) {
        return {
          start: slot.start,
          end: slot.end,
          available: false,
        };
      }
      
      // Si no hay booking real, usar lógica determinística
      const isDeterministicallyOccupied = isSlotOccupiedDeterministic(date, slot.start);
      
      return {
        start: slot.start,
        end: slot.end,
        available: !isDeterministicallyOccupied,
      };
    });
    
    return {
      ok: true,
      date,
      timezone: "Europe/Madrid",
      slotMinutes: 30,
      slots,
    };
  } catch (error) {
    console.error("[Mock API] Error in getAvailability:", error);
    
    return {
      ok: false,
      code: "INTERNAL_ERROR",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
