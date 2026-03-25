/**
 * Availability Service
 * 
 * Servicio para calcular slots disponibles.
 * 
 * REGLAS:
 * - Horario: 09:00 - 17:30
 * - Intervalos: 30 minutos
 * - No weekends
 * - No fechas pasadas
 * - Timezone: Europe/Madrid
 * - Cutoff same-day: 19:00
 */

import { BookingRepository } from "@/src/server/repositories/BookingRepository";
import { logger } from "@/src/server/utils/logger";

// --- Constantes ---

const SLOT_INTERVAL_MINUTES = 30;
const START_HOUR = 9; // 09:00
const END_HOUR = 17; // 17:00
const END_MINUTE = 30; // hasta 17:30
const SAME_DAY_CUTOFF_HOUR = 19; // No reservas same-day después de 19:00

/**
 * Slot de disponibilidad
 */
export interface AvailabilitySlot {
  start: string; // HH:mm (ej: "09:00")
  end: string; // HH:mm (ej: "09:30")
  available: boolean;
}

/**
 * Availability Service
 */
export const AvailabilityService = {
  /**
   * Obtener disponibilidad para una fecha
   * 
   * Genera todos los slots del día y marca cuáles están ocupados
   * basándose en bookings existentes.
   * 
   * @param date - Fecha en formato YYYY-MM-DD
   * @returns Objeto con slots y metadata
   */
  async getAvailability(date: string): Promise<{
    date: string;
    timezone: string;
    slotMinutes: number;
    slots: AvailabilitySlot[];
  }> {
    logger.debug({ date }, "Getting availability for date");

    // 1. Generar todos los slots posibles del día
    const allSlots = this.generateSlots();

    // 2. Obtener fecha completa para queries
    const [year, month, day] = date.split("-").map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    // 3. Buscar bookings existentes para esa fecha
    const bookings = await BookingRepository.findOverlappingBookings(
      startOfDay,
      endOfDay
    );

    logger.debug(
      { date, bookingsCount: bookings.length },
      "Found existing bookings for date"
    );

    // 4. Marcar slots ocupados
    const slots = allSlots.map((slot) => {
      // Convertir slot a rango de tiempo UTC
      const [startHour, startMinute] = slot.start.split(":").map(Number);
      const [endHour, endMinute] = slot.end.split(":").map(Number);

      const slotStart = new Date(Date.UTC(year, month - 1, day, startHour, startMinute, 0));
      const slotEnd = new Date(Date.UTC(year, month - 1, day, endHour, endMinute, 0));

      // Verificar si hay algún booking que se solape con este slot
      const isOccupied = bookings.some((booking) => {
        // Overlapping: el booking empieza antes de que termine el slot
        // Y el booking termina después de que empiece el slot
        return booking.startAt < slotEnd && booking.endAt > slotStart;
      });

      return {
        ...slot,
        available: !isOccupied,
      };
    });

    logger.info(
      {
        date,
        totalSlots: slots.length,
        availableSlots: slots.filter((s) => s.available).length,
      },
      "Availability calculated"
    );

    return {
      date,
      timezone: "Europe/Madrid",
      slotMinutes: SLOT_INTERVAL_MINUTES,
      slots,
    };
  },

  /**
   * Generar slots del día
   * 
   * Genera todos los slots posibles entre START_HOUR y END_HOUR
   * con intervalos de SLOT_INTERVAL_MINUTES.
   * 
   * @returns Array de slots (todos marcados como available: true por defecto)
   */
  generateSlots(): AvailabilitySlot[] {
    const slots: AvailabilitySlot[] = [];

    let currentHour = START_HOUR;
    let currentMinute = 0;

    while (
      currentHour < END_HOUR ||
      (currentHour === END_HOUR && currentMinute <= END_MINUTE)
    ) {
      const start = `${String(currentHour).padStart(2, "0")}:${String(
        currentMinute
      ).padStart(2, "0")}`;

      // Calcular fin del slot
      currentMinute += SLOT_INTERVAL_MINUTES;
      if (currentMinute >= 60) {
        currentHour++;
        currentMinute = 0;
      }

      const end = `${String(currentHour).padStart(2, "0")}:${String(
        currentMinute
      ).padStart(2, "0")}`;

      slots.push({ start, end, available: true });

      // Salir si llegamos al límite
      if (currentHour === END_HOUR && currentMinute > END_MINUTE) {
        break;
      }
    }

    logger.debug({ slotsCount: slots.length }, "Slots generated");

    return slots;
  },

  /**
   * Validar si una fecha es válida para reservas
   * 
   * Validaciones:
   * - No puede ser pasada
   * - No puede ser weekend
   * - Si es hoy, no puede ser después de SAME_DAY_CUTOFF_HOUR
   * 
   * @param date - Fecha en formato YYYY-MM-DD
   * @returns { valid: boolean, reason?: string }
   */
  validateDate(date: string): { valid: boolean; reason?: string } {
    try {
      const [year, month, day] = date.split("-").map(Number);
      const targetDate = new Date(year, month - 1, day);

      // Validar que la fecha es válida
      if (
        targetDate.getFullYear() !== year ||
        targetDate.getMonth() !== month - 1 ||
        targetDate.getDate() !== day
      ) {
        return { valid: false, reason: "INVALID_DATE" };
      }

      // Validar que no es pasada
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      targetDate.setHours(0, 0, 0, 0);

      if (targetDate < today) {
        return { valid: false, reason: "DATE_IN_PAST" };
      }

      // Validar que no es weekend
      const dayOfWeek = targetDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return { valid: false, reason: "WEEKEND_NOT_ALLOWED" };
      }

      // Validar cutoff para same-day booking
      if (targetDate.getTime() === today.getTime()) {
        const now = new Date();
        const currentHour = now.getHours();

        if (currentHour >= SAME_DAY_CUTOFF_HOUR) {
          return { valid: false, reason: "CUTOFF_EXCEEDED" };
        }
      }

      return { valid: true };
    } catch (error) {
      logger.error({ error, date }, "Error validating date");
      return { valid: false, reason: "INVALID_DATE" };
    }
  },

  /**
   * Verificar si un slot específico está disponible
   * 
   * @param date - Fecha en formato YYYY-MM-DD
   * @param time - Hora en formato HH:mm
   * @returns true si está disponible, false si no
   */
  async isSlotAvailable(date: string, time: string): Promise<boolean> {
    try {
      const [year, month, day] = date.split("-").map(Number);
      const [hours, minutes] = time.split(":").map(Number);

      const slotStart = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
      const slotEnd = new Date(slotStart.getTime() + SLOT_INTERVAL_MINUTES * 60 * 1000);

      const overlapping = await BookingRepository.findOverlappingBookings(
        slotStart,
        slotEnd
      );

      const available = overlapping.length === 0;

      logger.debug(
        { date, time, available, overlappingCount: overlapping.length },
        "Slot availability checked"
      );

      return available;
    } catch (error) {
      logger.error({ error, date, time }, "Error checking slot availability");
      return false;
    }
  },
};
