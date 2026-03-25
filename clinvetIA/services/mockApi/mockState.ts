/**
 * Mock API State - Simula una base de datos en memoria
 *
 * Mantiene el estado de:
 * - Bookings (holds y confirmados)
 * - Tokens (session, cancel, reschedule)
 *
 * Este estado se resetea al recargar la página, lo cual es perfecto para desarrollo.
 */

import type { BookingStatus } from "@/features/booking/booking.types";

// ============================================================================
// Types
// ============================================================================

export interface MockBooking {
  id: string;
  uid: string;
  status: BookingStatus;
  date: string;              // YYYY-MM-DD
  time: string;              // HH:mm
  startAtISO: string;        // ISO 8601
  endAtISO: string;          // ISO 8601
  expiresAtISO: string | null;
  timezone: "Europe/Madrid";
  locale: "es" | "en";
  confirmedAt: string | null;
  contact: {
    fullName: string | null;
    email: string | null;
    phone: string | null;
    clinicName: string | null;
    message: string | null;
  };
  roiData: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface MockToken {
  id: string;
  bookingId: string;
  kind: "SESSION" | "CANCEL" | "RESCHEDULE";
  token: string;            // Plain text (en producción sería hash)
  expiresAt: string;        // ISO 8601
  usedAt: string | null;
  createdAt: string;
}

// ============================================================================
// In-Memory State
// ============================================================================

class MockState {
  private bookings: Map<string, MockBooking> = new Map();
  private tokens: Map<string, MockToken> = new Map();
  private idCounter = 1;

  // Generar ID único
  private generateId(): string {
    return `mock_${Date.now()}_${this.idCounter++}`;
  }

  // Generar UID de booking (formato legacy: "clinvetia-{hex}")
  private generateBookingUid(): string {
    const hex = Math.random().toString(16).substring(2, 10);
    return `clinvetia-${hex}`;
  }

  // Generar token aleatorio
  private generateToken(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  // ============================================================================
  // Bookings
  // ============================================================================

  createBooking(data: {
    status: BookingStatus;
    date: string;
    time: string;
    startAtISO: string;
    endAtISO: string;
    expiresAtISO: string | null;
    timezone: "Europe/Madrid";
    locale: "es" | "en";
  }): MockBooking {
    const id = this.generateId();
    const now = new Date().toISOString();

    const booking: MockBooking = {
      id,
      uid: this.generateBookingUid(),
      status: data.status,
      date: data.date,
      time: data.time,
      startAtISO: data.startAtISO,
      endAtISO: data.endAtISO,
      expiresAtISO: data.expiresAtISO,
      timezone: data.timezone,
      locale: data.locale,
      confirmedAt: null,
      contact: {
        fullName: null,
        email: null,
        phone: null,
        clinicName: null,
        message: null,
      },
      roiData: null,
      createdAt: now,
      updatedAt: now,
    };

    this.bookings.set(id, booking);
    return booking;
  }

  getBooking(id: string): MockBooking | null {
    return this.bookings.get(id) || null;
  }

  updateBooking(id: string, updates: Partial<MockBooking>): MockBooking | null {
    const booking = this.bookings.get(id);
    if (!booking) return null;

    const updated = {
      ...booking,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.bookings.set(id, updated);
    return updated;
  }

  // Obtener bookings por fecha y hora (para verificar disponibilidad)
  getBookingsByDateAndTime(date: string, time: string): MockBooking[] {
    const results: MockBooking[] = [];

    for (const booking of this.bookings.values()) {
      if (booking.date === date && booking.time === time) {
        // Solo contar CONFIRMED o HELD con expiration válida
        if (booking.status === "CONFIRMED") {
          results.push(booking);
        } else if (
          booking.status === "HELD" &&
          booking.expiresAtISO &&
          new Date(booking.expiresAtISO) > new Date()
        ) {
          results.push(booking);
        }
      }
    }

    return results;
  }

  // Obtener bookings por fecha (para marcar slots ocupados)
  getBookingsByDate(date: string): MockBooking[] {
    const results: MockBooking[] = [];
    const now = new Date();

    for (const booking of this.bookings.values()) {
      if (booking.date === date) {
        // Solo contar CONFIRMED o HELD con expiration válida
        if (booking.status === "CONFIRMED") {
          results.push(booking);
        } else if (
          booking.status === "HELD" &&
          booking.expiresAtISO &&
          new Date(booking.expiresAtISO) > now
        ) {
          results.push(booking);
        }
      }
    }

    return results;
  }

  // Expirar holds antiguos (cleanup)
  expireOldHolds(): number {
    const now = new Date();
    let count = 0;

    for (const booking of this.bookings.values()) {
      if (
        booking.status === "HELD" &&
        booking.expiresAtISO &&
        new Date(booking.expiresAtISO) <= now
      ) {
        booking.status = "EXPIRED";
        booking.updatedAt = now.toISOString();
        count++;
      }
    }

    return count;
  }

  // ============================================================================
  // Tokens
  // ============================================================================

  createToken(data: {
    bookingId: string;
    kind: "SESSION" | "CANCEL" | "RESCHEDULE";
    expiresAt: string;
  }): MockToken {
    const id = this.generateId();
    const now = new Date().toISOString();

    const token: MockToken = {
      id,
      bookingId: data.bookingId,
      kind: data.kind,
      token: this.generateToken(),
      expiresAt: data.expiresAt,
      usedAt: null,
      createdAt: now,
    };

    this.tokens.set(token.token, token);
    return token;
  }

  getTokenByValue(tokenValue: string): MockToken | null {
    return this.tokens.get(tokenValue) || null;
  }

  markTokenAsUsed(tokenValue: string): boolean {
    const token = this.tokens.get(tokenValue);
    if (!token) return false;

    token.usedAt = new Date().toISOString();
    return true;
  }

  // ============================================================================
  // Utilities
  // ============================================================================

  reset(): void {
    this.bookings.clear();
    this.tokens.clear();
    this.idCounter = 1;
  }

  // Debug: obtener todo el estado
  getState() {
    return {
      bookings: Array.from(this.bookings.values()),
      tokens: Array.from(this.tokens.values()),
    };
  }
}

// Singleton instance
export const mockState = new MockState();

// Exponer globalmente para debugging en consola
if (typeof window !== "undefined") {
  (window as any).__mockState = mockState;
}
