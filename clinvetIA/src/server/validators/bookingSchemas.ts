/**
 * Booking Validation Schemas (Zod)
 * 
 * Schemas de validación para inputs de la API de bookings.
 * 
 * IMPORTANTE:
 * - Validación server-side (NO confiar en frontend)
 * - Sanitización de datos (trim, lowercase, etc.)
 * - Mensajes de error claros en español
 */

import { z } from "zod";

// --- Helpers de Validación ---

/**
 * Validar formato de fecha YYYY-MM-DD
 */
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validar formato de hora HH:mm
 */
const timeRegex = /^\d{2}:\d{2}$/;

/**
 * Validador de fecha (no pasada, no weekend)
 */
const dateSchema = z
  .string()
  .regex(dateRegex, "Fecha debe tener formato YYYY-MM-DD")
  .refine(
    (date) => {
      try {
        const [year, month, day] = date.split("-").map(Number);
        const d = new Date(year, month - 1, day);
        
        // Validar que la fecha es válida
        if (
          d.getFullYear() !== year ||
          d.getMonth() !== month - 1 ||
          d.getDate() !== day
        ) {
          return false;
        }
        
        // Validar que no es pasada (comparar solo fecha, sin hora)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        d.setHours(0, 0, 0, 0);
        
        return d >= today;
      } catch {
        return false;
      }
    },
    { message: "La fecha no puede ser pasada" }
  )
  .refine(
    (date) => {
      try {
        const [year, month, day] = date.split("-").map(Number);
        const d = new Date(year, month - 1, day);
        const dayOfWeek = d.getDay();
        return dayOfWeek !== 0 && dayOfWeek !== 6; // No sábado (6) ni domingo (0)
      } catch {
        return false;
      }
    },
    { message: "No se aceptan reservas en fines de semana" }
  );

/**
 * Validador de hora (09:00-17:30, intervalos 30min)
 */
const timeSchema = z
  .string()
  .regex(timeRegex, "Hora debe tener formato HH:mm")
  .refine(
    (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      
      // Validar rango de horas (09:00 - 17:30)
      if (hours < 9 || hours > 17) return false;
      if (hours === 17 && minutes > 30) return false;
      
      // Validar intervalos de 30 minutos
      return minutes === 0 || minutes === 30;
    },
    { message: "Hora debe estar entre 09:00-17:30 en intervalos de 30 minutos" }
  );

/**
 * Validador de email
 */
const emailSchema = z
  .string()
  .min(1, "Email es requerido")
  .email("Email inválido")
  .transform((val) => val.trim().toLowerCase());

/**
 * Validador de teléfono español
 * 
 * Acepta:
 * - +34612345678
 * - 612345678
 * - +34 612 345 678
 * - 612 345 678
 */
const phoneSchema = z
  .string()
  .min(1, "Teléfono es requerido")
  .regex(
    /^(\+34)?[6-9]\d{8}$/,
    "Teléfono debe ser español (9 dígitos, empezando con 6-9)"
  )
  .transform((val) => val.replace(/\s+/g, "")); // Eliminar espacios

/**
 * Validador de nombre completo
 * 
 * Debe contener al menos 2 palabras (nombre + apellido).
 */
const fullNameSchema = z
  .string()
  .min(2, "Nombre completo es requerido")
  .regex(
    /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/,
    "Nombre solo puede contener letras, espacios, guiones y apóstrofes"
  )
  .refine(
    (name) => {
      const words = name.trim().split(/\s+/);
      return words.length >= 2;
    },
    { message: "Introduce nombre y apellido completos" }
  )
  .transform((val) => val.trim());

// --- Schemas de API ---

/**
 * Schema para GET /api/availability?date=YYYY-MM-DD
 */
export const availabilityQuerySchema = z.object({
  date: dateSchema,
});

export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;

/**
 * Schema para POST /api/bookings (create hold)
 */
export const createHoldSchema = z.object({
  date: dateSchema,
  time: timeSchema,
  timezone: z.literal("Europe/Madrid"),
  locale: z.enum(["es", "en"]),
});

export type CreateHoldInput = z.infer<typeof createHoldSchema>;

/**
 * Schema para POST /api/bookings/confirm
 */
export const confirmBookingSchema = z.object({
  sessionToken: z.string().min(10, "Token de sesión inválido"),
  locale: z.enum(["es", "en"]),
  contact: z.object({
    fullName: fullNameSchema,
    email: emailSchema,
    phone: phoneSchema,
    clinicName: z.string().optional().transform((val) => val?.trim() || null),
    message: z.string().optional().transform((val) => val?.trim() || null),
  }),
  roi: z.any().refine((data) => {
    if (typeof data !== "object" || data === null) return false;
    return Object.keys(data).length > 0;
  }, {
    message: "ROI data es requerida",
  }),
});

export type ConfirmBookingInput = z.infer<typeof confirmBookingSchema>;
