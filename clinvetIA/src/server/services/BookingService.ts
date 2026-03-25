/**
 * Booking Service
 * 
 * Servicio para lógica de negocio de bookings.
 * Maneja creación de holds, confirmaciones, validaciones, etc.
 * 
 * REGLAS:
 * - Hold duration: 10 minutos
 * - Requiere ROI data para confirmar
 * - Genera tokens únicos (session, cancel, reschedule)
 */

import { BookingRepository } from "@/src/server/repositories/BookingRepository";
import { AvailabilityService } from "@/src/server/services/AvailabilityService";
import { logger } from "@/src/server/utils/logger";
import { randomBytes } from "crypto";

// --- Constantes ---

const HOLD_DURATION_MS = 10 * 60 * 1000; // 10 minutos
const SLOT_DURATION_MS = 30 * 60 * 1000; // 30 minutos

/**
 * Resultado de operaciones (success)
 */
interface ServiceSuccess<T> {
  ok: true;
  data: T;
}

/**
 * Resultado de operaciones (error)
 */
interface ServiceError {
  ok: false;
  code: string;
  message: string;
}

type ServiceResult<T> = ServiceSuccess<T> | ServiceError;

/**
 * Booking Service
 */
export const BookingService = {
  /**
   * Crear un hold temporal
   * 
   * Validaciones:
   * - Fecha válida (no pasada, no weekend, no cutoff)
   * - Slot disponible (no ocupado)
   * - Timezone válido (solo Europe/Madrid)
   * 
   * @param input - Datos del hold a crear
   * @returns ServiceResult con booking creado o error
   */
  async createHold(input: {
    date: string;
    time: string;
    timezone: string;
    locale: "es" | "en";
  }): Promise<
    | ServiceSuccess<{
        sessionToken: string;
        booking: {
          date: string;
          time: string;
          startAtISO: string;
          endAtISO: string;
          expiresAtISO: string;
          timezone: string;
          locale: string;
          status: string;
        };
      }>
    | ServiceError
  > {
    try {
      logger.info({ date: input.date, time: input.time }, "Creating hold");

      // 1. Validar timezone
      if (input.timezone !== "Europe/Madrid") {
        return {
          ok: false,
          code: "INVALID_TIMEZONE",
          message: "Solo se acepta timezone Europe/Madrid",
        };
      }

      // 2. Validar fecha
      const dateValidation = AvailabilityService.validateDate(input.date);
      if (!dateValidation.valid) {
        const messages: Record<string, string> = {
          DATE_IN_PAST: "La fecha no puede ser pasada",
          WEEKEND_NOT_ALLOWED: "No se aceptan reservas en fines de semana",
          CUTOFF_EXCEEDED:
            "No se pueden hacer reservas para hoy después de las 19:00",
          INVALID_DATE: "Fecha inválida",
        };

        return {
          ok: false,
          code: dateValidation.reason || "INVALID_DATE",
          message: messages[dateValidation.reason || "INVALID_DATE"],
        };
      }

      // 3. Verificar que el slot está disponible
      const isAvailable = await AvailabilityService.isSlotAvailable(
        input.date,
        input.time
      );

      if (!isAvailable) {
        return {
          ok: false,
          code: "SLOT_TAKEN",
          message: "Este horario ya está reservado",
        };
      }

      // 4. Calcular timestamps
      const [year, month, day] = input.date.split("-").map(Number);
      const [hours, minutes] = input.time.split(":").map(Number);

      const startAt = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
      const endAt = new Date(startAt.getTime() + SLOT_DURATION_MS);
      const expiresAt = new Date(Date.now() + HOLD_DURATION_MS);

      // 5. Generar tokens únicos
      const sessionToken = `tok_${randomBytes(32).toString("hex")}`;
      const cancelToken = `cancel_${randomBytes(16).toString("hex")}`;
      const rescheduleToken = `reschedule_${randomBytes(16).toString("hex")}`;

      // 6. Crear hold en DB
      const booking = await BookingRepository.createHold({
        sessionToken,
        cancelToken,
        rescheduleToken,
        date: input.date,
        time: input.time,
        startAt,
        endAt,
        expiresAt,
        timezone: input.timezone,
        locale: input.locale,
      });

      logger.info(
        { bookingId: booking._id, sessionToken },
        "Hold created successfully"
      );

      return {
        ok: true,
        data: {
          sessionToken,
          booking: {
            date: booking.date,
            time: booking.time,
            startAtISO: booking.startAt.toISOString(),
            endAtISO: booking.endAt.toISOString(),
            expiresAtISO: booking.expiresAt?.toISOString() || "",
            timezone: booking.timezone,
            locale: booking.locale,
            status: booking.status,
          },
        },
      };
    } catch (error) {
      logger.error({ error, input }, "Failed to create hold");
      return {
        ok: false,
        code: "INTERNAL_ERROR",
        message: "Error al crear la reserva temporal",
      };
    }
  },

  /**
   * Confirmar un booking
   * 
   * Validaciones:
   * - SessionToken válido
   * - Hold no expirado
   * - Status es "held"
   * - ROI data presente
   * - Contact data válida
   * 
   * @param input - Datos de confirmación
   * @returns ServiceResult con booking confirmado o error
   */
  async confirmBooking(input: {
    sessionToken: string;
    contact: {
      fullName: string;
      email: string;
      phone: string;
      clinicName?: string;
      message?: string;
    };
    roi: Record<string, unknown>;
  }): Promise<
    | ServiceSuccess<{
        booking: {
          id: string;
          status: string;
          startAtISO: string;
          endAtISO: string;
          timezone: string;
          locale: string;
          confirmedAtISO: string;
          contact: typeof input.contact;
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
        email: {
          enabled: boolean;
          skipped: boolean;
        };
      }>
    | ServiceError
  > {
    try {
      logger.info({ sessionToken: input.sessionToken }, "Confirming booking");

      // 1. Buscar booking por sessionToken
      const booking = await BookingRepository.findBySessionToken(
        input.sessionToken
      );

      if (!booking) {
        return {
          ok: false,
          code: "TOKEN_INVALID",
          message: "Token de sesión inválido",
        };
      }

      // 2. Verificar que no ha expirado
      if (booking.isExpired()) {
        return {
          ok: false,
          code: "TOKEN_EXPIRED",
          message: "La reserva temporal ha expirado. Por favor selecciona otro horario.",
        };
      }

      // 3. Verificar que se puede confirmar (status = held)
      if (!booking.canConfirm()) {
        return {
          ok: false,
          code: "BOOKING_NOT_HELD",
          message: "La reserva no está en estado válido para confirmar",
        };
      }

      // 4. Validar ROI data
      if (!input.roi || Object.keys(input.roi).length === 0) {
        return {
          ok: false,
          code: "ROI_REQUIRED",
          message: "Se requiere completar la calculadora ROI",
        };
      }

      // 5. Confirmar booking en DB
      const confirmed = await BookingRepository.confirmBooking(
        input.sessionToken,
        input.contact,
        input.roi
      );

      if (!confirmed) {
        return {
          ok: false,
          code: "INTERNAL_ERROR",
          message: "Error al confirmar la reserva",
        };
      }

      logger.info(
        { bookingId: confirmed._id },
        "Booking confirmed successfully"
      );

      // 6. Construir respuesta
      return {
        ok: true,
        data: {
          booking: {
            id: confirmed._id.toString(),
            status: confirmed.status,
            startAtISO: confirmed.startAt.toISOString(),
            endAtISO: confirmed.endAt.toISOString(),
            timezone: confirmed.timezone,
            locale: confirmed.locale,
            confirmedAtISO: confirmed.confirmedAt?.toISOString() || "",
            contact: {
              fullName: confirmed.contact.fullName || "",
              email: confirmed.contact.email || "",
              phone: confirmed.contact.phone || "",
              clinicName: confirmed.contact.clinicName || undefined,
              message: confirmed.contact.message || undefined,
            },
          },
          cancel: {
            token: confirmed.cancelToken,
            url: `/api/bookings/cancel?token=${confirmed.cancelToken}`,
          },
          reschedule: {
            token: confirmed.rescheduleToken,
            url: `/api/bookings/reschedule?token=${confirmed.rescheduleToken}`,
          },
          ics: {
            url: `/api/bookings/${confirmed._id}/calendar.ics`,
          },
          email: {
            enabled: false,
            skipped: true,
            // TODO: Implementar EmailService
          },
        },
      };
    } catch (error) {
      logger.error({ error, sessionToken: input.sessionToken }, "Failed to confirm booking");
      return {
        ok: false,
        code: "INTERNAL_ERROR",
        message: "Error al confirmar la reserva",
      };
    }
  },

  /**
   * Cancelar un booking
   * 
   * @param cancelToken - Token de cancelación
   * @returns ServiceResult con booking cancelado o error
   */
  async cancelBooking(
    cancelToken: string
  ): Promise<ServiceSuccess<{ booking: { id: string; status: string } }> | ServiceError> {
    try {
      logger.info({ cancelToken }, "Cancelling booking");

      const booking = await BookingRepository.findByCancelToken(cancelToken);

      if (!booking) {
        return {
          ok: false,
          code: "TOKEN_INVALID",
          message: "Token de cancelación inválido",
        };
      }

      const cancelled = await BookingRepository.cancelBooking(cancelToken);

      if (!cancelled) {
        return {
          ok: false,
          code: "INTERNAL_ERROR",
          message: "Error al cancelar la reserva",
        };
      }

      logger.info({ bookingId: cancelled._id }, "Booking cancelled successfully");

      return {
        ok: true,
        data: {
          booking: {
            id: cancelled._id.toString(),
            status: cancelled.status,
          },
        },
      };
    } catch (error) {
      logger.error({ error, cancelToken }, "Failed to cancel booking");
      return {
        ok: false,
        code: "INTERNAL_ERROR",
        message: "Error al cancelar la reserva",
      };
    }
  },
};
