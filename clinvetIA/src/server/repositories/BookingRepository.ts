/**
 * Booking Repository
 * 
 * Capa de acceso a datos para Bookings.
 * Maneja todas las operaciones CRUD sobre BookingModel.
 * 
 * REGLAS:
 * - Repository SOLO hace queries a DB (no lógica de negocio)
 * - Retorna documentos de Mongoose o null
 * - No hace validaciones de negocio (eso va en Services)
 * - Imports con alias @
 */

import { BookingModel, IBooking } from "@/src/server/models/Booking";
import { logger } from "@/src/server/utils/logger";

/**
 * Booking Repository
 * 
 * Pattern: Objeto con métodos estáticos (no necesita instanciación)
 */
export const BookingRepository = {
  /**
   * Crear un nuevo hold
   * 
   * @param data - Datos del hold a crear
   * @returns Booking document creado
   */
  async createHold(data: {
    sessionToken: string;
    cancelToken: string;
    rescheduleToken: string;
    date: string;
    time: string;
    startAt: Date;
    endAt: Date;
    expiresAt: Date;
    timezone: string;
    locale: "es" | "en";
  }): Promise<IBooking> {
    try {
      const booking = new BookingModel({
        ...data,
        status: "held",
        contact: {
          fullName: null,
          email: null,
          phone: null,
          clinicName: null,
          message: null,
        },
        roi: null,
        email: {
          sent: false,
          sentAt: null,
          provider: null,
          messageId: null,
          error: null,
        },
      });

      await booking.save();

      logger.debug(
        { bookingId: booking._id, date: data.date, time: data.time },
        "Hold created in DB"
      );

      return booking;
    } catch (error) {
      logger.error(
        { error: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined, date: data.date, time: data.time },
        "Failed to create hold in DB"
      );
      throw error;
    }
  },

  /**
   * Buscar booking por sessionToken
   * 
   * @param sessionToken - Token de sesión
   * @returns Booking document o null si no existe
   */
  async findBySessionToken(sessionToken: string): Promise<IBooking | null> {
    try {
      const booking = await BookingModel.findOne({ sessionToken });

      if (booking) {
        logger.debug({ bookingId: booking._id }, "Booking found by sessionToken");
      }

      return booking;
    } catch (error) {
      logger.error({ error, sessionToken }, "Failed to find booking by sessionToken");
      throw error;
    }
  },

  /**
   * Buscar booking por cancelToken
   * 
   * @param cancelToken - Token de cancelación
   * @returns Booking document o null si no existe
   */
  async findByCancelToken(cancelToken: string): Promise<IBooking | null> {
    try {
      return await BookingModel.findOne({ cancelToken });
    } catch (error) {
      logger.error({ error, cancelToken }, "Failed to find booking by cancelToken");
      throw error;
    }
  },

  /**
   * Buscar booking por rescheduleToken
   * 
   * @param rescheduleToken - Token de reprogramación
   * @returns Booking document o null si no existe
   */
  async findByRescheduleToken(rescheduleToken: string): Promise<IBooking | null> {
    try {
      return await BookingModel.findOne({ rescheduleToken });
    } catch (error) {
      logger.error({ error, rescheduleToken }, "Failed to find booking by rescheduleToken");
      throw error;
    }
  },

  /**
   * Buscar bookings que se solapan con un slot
   * 
   * Retorna bookings con status "held" o "confirmed" que se solapan
   * con el rango de tiempo dado.
   * 
   * @param startAt - Inicio del slot
   * @param endAt - Fin del slot
   * @returns Array de bookings que se solapan
   */
  async findOverlappingBookings(startAt: Date, endAt: Date): Promise<IBooking[]> {
    try {
      const bookings = await BookingModel.find({
        status: { $in: ["held", "confirmed"] },
        $or: [
          // Caso 1: El booking empieza dentro del slot
          {
            startAt: { $gte: startAt, $lt: endAt },
          },
          // Caso 2: El booking termina dentro del slot
          {
            endAt: { $gt: startAt, $lte: endAt },
          },
          // Caso 3: El booking envuelve el slot completamente
          {
            startAt: { $lte: startAt },
            endAt: { $gte: endAt },
          },
        ],
      });

      logger.debug(
        {
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          count: bookings.length,
        },
        "Overlapping bookings query"
      );

      return bookings;
    } catch (error) {
      logger.error({ error, startAt, endAt }, "Failed to find overlapping bookings");
      throw error;
    }
  },

  /**
   * Buscar bookings por fecha
   * 
   * @param date - Fecha en formato YYYY-MM-DD
   * @param status - (Opcional) Filtrar por status
   * @returns Array de bookings
   */
  async findByDate(
    date: string,
    status?: "held" | "confirmed" | "expired" | "cancelled"
  ): Promise<IBooking[]> {
    try {
      const query: any = { date };
      if (status) {
        query.status = status;
      }

      const bookings = await BookingModel.find(query).sort({ startAt: 1 });

      logger.debug({ date, status, count: bookings.length }, "Bookings found by date");

      return bookings;
    } catch (error) {
      logger.error({ error, date, status }, "Failed to find bookings by date");
      throw error;
    }
  },

  /**
   * Confirmar un booking
   * 
   * Actualiza el status a "confirmed", añade datos de contacto y ROI,
   * y limpia expiresAt.
   * 
   * @param sessionToken - Token de sesión
   * @param contactData - Datos de contacto
   * @param roiData - Datos de ROI
   * @returns Booking confirmado o null si no existe o no se puede confirmar
   */
  async confirmBooking(
    sessionToken: string,
    contactData: {
      fullName: string;
      email: string;
      phone: string;
      clinicName?: string;
      message?: string;
    },
    roiData: Record<string, unknown>
  ): Promise<IBooking | null> {
    try {
      const booking = await BookingModel.findOneAndUpdate(
        {
          sessionToken,
          status: "held", // Solo confirmar si está en held
        },
        {
          $set: {
            status: "confirmed",
            confirmedAt: new Date(),
            expiresAt: null,
            contact: {
              fullName: contactData.fullName,
              email: contactData.email,
              phone: contactData.phone,
              clinicName: contactData.clinicName || null,
              message: contactData.message || null,
            },
            roi: roiData,
          },
        },
        { new: true } // Retornar documento actualizado
      );

      if (booking) {
        logger.info({ bookingId: booking._id }, "Booking confirmed in DB");
      } else {
        logger.warn({ sessionToken }, "Booking not found or not in held status");
      }

      return booking;
    } catch (error) {
      logger.error({ error, sessionToken }, "Failed to confirm booking");
      throw error;
    }
  },

  /**
   * Cancelar un booking
   * 
   * @param cancelToken - Token de cancelación
   * @returns Booking cancelado o null si no existe
   */
  async cancelBooking(cancelToken: string): Promise<IBooking | null> {
    try {
      const booking = await BookingModel.findOneAndUpdate(
        { cancelToken },
        {
          $set: {
            status: "cancelled",
          },
        },
        { new: true }
      );

      if (booking) {
        logger.info({ bookingId: booking._id }, "Booking cancelled in DB");
      }

      return booking;
    } catch (error) {
      logger.error({ error, cancelToken }, "Failed to cancel booking");
      throw error;
    }
  },

  /**
   * Marcar email como enviado
   * 
   * @param bookingId - ID del booking
   * @param emailData - Datos del email enviado
   */
  async markEmailSent(
    bookingId: string,
    emailData: {
      provider: string;
      messageId: string;
    }
  ): Promise<void> {
    try {
      await BookingModel.findByIdAndUpdate(bookingId, {
        $set: {
          "email.sent": true,
          "email.sentAt": new Date(),
          "email.provider": emailData.provider,
          "email.messageId": emailData.messageId,
        },
      });

      logger.debug({ bookingId, messageId: emailData.messageId }, "Email marked as sent");
    } catch (error) {
      logger.error({ error, bookingId }, "Failed to mark email as sent");
      throw error;
    }
  },

  /**
   * Marcar error de email
   * 
   * @param bookingId - ID del booking
   * @param errorMessage - Mensaje de error
   */
  async markEmailError(bookingId: string, errorMessage: string): Promise<void> {
    try {
      await BookingModel.findByIdAndUpdate(bookingId, {
        $set: {
          "email.error": errorMessage,
        },
      });

      logger.warn({ bookingId, error: errorMessage }, "Email error recorded");
    } catch (error) {
      logger.error({ error, bookingId }, "Failed to mark email error");
      throw error;
    }
  },

  /**
   * Expirar holds antiguos (cleanup job)
   * 
   * Actualiza status de "held" a "expired" para bookings
   * cuyo expiresAt ya pasó.
   * 
   * @returns Número de holds expirados
   */
  async expireOldHolds(): Promise<number> {
    try {
      const result = await BookingModel.updateMany(
        {
          status: "held",
          expiresAt: { $lt: new Date() },
        },
        {
          $set: { status: "expired" },
        }
      );

      if (result.modifiedCount > 0) {
        logger.info({ count: result.modifiedCount }, "Old holds expired");
      }

      return result.modifiedCount;
    } catch (error) {
      logger.error({ error }, "Failed to expire old holds");
      throw error;
    }
  },

  /**
   * Listar bookings (para admin)
   * 
   * @param options - Opciones de filtrado y paginación
   * @returns Bookings y metadata de paginación
   */
  async listBookings(options: {
    page?: number;
    limit?: number;
    status?: "held" | "confirmed" | "expired" | "cancelled";
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{
    bookings: IBooking[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;

      // Construir query
      const query: any = {};
      if (options.status) {
        query.status = options.status;
      }
      if (options.dateFrom || options.dateTo) {
        query.date = {};
        if (options.dateFrom) query.date.$gte = options.dateFrom;
        if (options.dateTo) query.date.$lte = options.dateTo;
      }

      // Ejecutar queries en paralelo
      const [bookings, total] = await Promise.all([
        BookingModel.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        BookingModel.countDocuments(query),
      ]);

      logger.debug(
        { page, limit, total, filters: options },
        "Bookings listed"
      );

      return {
        bookings,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error({ error, options }, "Failed to list bookings");
      throw error;
    }
  },
};
