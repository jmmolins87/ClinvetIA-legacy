/**
 * Booking Model (Mongoose)
 * 
 * Modelo de reservas/bookings para ClinvetIA.
 * Maneja holds temporales (10min) y confirmaciones.
 * 
 * Estados:
 * - held: Hold temporal activo (10 minutos)
 * - confirmed: Reserva confirmada
 * - expired: Hold expirado
 * - cancelled: Reserva cancelada
 */

import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Interface de Booking Document
 * 
 * Extiende Document de Mongoose para tener métodos de instancia.
 */
export interface IBooking extends Document {
  // Identificadores/Tokens
  sessionToken: string;
  cancelToken: string;
  rescheduleToken: string;

  // Slot info
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (ej: "09:00")
  startAt: Date; // ISO date del inicio
  endAt: Date; // ISO date del fin
  timezone: string; // Solo "Europe/Madrid" por ahora

  // Estado
  status: "held" | "confirmed" | "expired" | "cancelled";
  expiresAt: Date | null; // Cuando expira el hold (null si confirmed)
  confirmedAt: Date | null; // Cuando se confirmó

  // Locale
  locale: "es" | "en";

  // Datos de contacto (null hasta confirmación)
  contact: {
    fullName: string | null;
    email: string | null;
    phone: string | null;
    clinicName: string | null;
    message: string | null;
  };

  // ROI data (null hasta confirmación)
  roi: Record<string, unknown> | null;

  // Email tracking
  email: {
    sent: boolean;
    sentAt: Date | null;
    provider: string | null;
    messageId: string | null;
    error: string | null;
  };

  // Timestamps (auto-gestionados por Mongoose)
  createdAt: Date;
  updatedAt: Date;

  // Métodos de instancia
  isExpired(): boolean;
  canConfirm(): boolean;
}

/**
 * Schema de Booking
 */
const BookingSchema = new Schema<IBooking>(
  {
    // --- Tokens ---
    sessionToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    cancelToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    rescheduleToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // --- Slot Info ---
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/, // Validar formato YYYY-MM-DD
      index: true,
    },
    time: {
      type: String,
      required: true,
      match: /^\d{2}:\d{2}$/, // Validar formato HH:mm
    },
    startAt: {
      type: Date,
      required: true,
      index: true, // Para queries de overlapping
    },
    endAt: {
      type: Date,
      required: true,
    },
    timezone: {
      type: String,
      required: true,
      enum: ["Europe/Madrid"], // Solo Madrid por ahora
      default: "Europe/Madrid",
    },

    // --- Estado ---
    status: {
      type: String,
      required: true,
      enum: ["held", "confirmed", "expired", "cancelled"],
      default: "held",
      index: true, // Para filtros por estado
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true, // Para cleanup de holds expirados
    },
    confirmedAt: {
      type: Date,
      default: null,
    },

    // --- Locale ---
    locale: {
      type: String,
      required: true,
      enum: ["es", "en"],
      default: "es",
    },

    // --- Contact Data ---
    contact: {
      fullName: { type: String, default: null },
      email: { type: String, default: null },
      phone: { type: String, default: null },
      clinicName: { type: String, default: null },
      message: { type: String, default: null },
    },

    // --- ROI Data ---
    roi: {
      type: Schema.Types.Mixed,
      default: null,
    },

    // --- Email Tracking ---
    email: {
      sent: { type: Boolean, default: false },
      sentAt: { type: Date, default: null },
      provider: { type: String, default: null },
      messageId: { type: String, default: null },
      error: { type: String, default: null },
    },
  },
  {
    timestamps: true, // Auto-gestiona createdAt y updatedAt
    collection: "bookings", // Nombre explícito de la colección
  }
);

// --- Índices compuestos ---

// Optimizar búsqueda de overlapping bookings
BookingSchema.index({ startAt: 1, endAt: 1, status: 1 });

// Optimizar búsqueda por fecha + hora
BookingSchema.index({ date: 1, time: 1 });

// Optimizar cleanup de holds expirados
BookingSchema.index({ status: 1, expiresAt: 1 });

// --- Métodos de instancia ---

/**
 * Verificar si el hold ha expirado
 * 
 * @returns true si expiró, false si no
 */
BookingSchema.methods.isExpired = function (): boolean {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

/**
 * Verificar si se puede confirmar
 * 
 * Solo se puede confirmar si:
 * - Estado es "held"
 * - No ha expirado
 * 
 * @returns true si se puede confirmar, false si no
 */
BookingSchema.methods.canConfirm = function (): boolean {
  return this.status === "held" && !this.isExpired();
};

// --- Hooks ---

/**
 * Pre-save hook: Validar estado antes de guardar
 */
BookingSchema.pre("save", async function () {
  // Si status es confirmed, limpiar expiresAt
  if (this.status === "confirmed") {
    this.expiresAt = null;
  }

  // Si status es held, debe tener expiresAt
  if (this.status === "held" && !this.expiresAt) {
    throw new Error("Hold must have expiresAt");
  }
});

/**
 * Export del modelo
 * 
 * Usa mongoose.models para evitar re-compilación en hot-reload.
 * Patrón recomendado para Next.js.
 */
export const BookingModel: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);
