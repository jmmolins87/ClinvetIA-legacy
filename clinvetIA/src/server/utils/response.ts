/**
 * API Response Helpers
 * 
 * Helpers para construir respuestas JSON consistentes.
 * REGLA CRÍTICA: SIEMPRE retornar JSON válido (NUNCA HTML, NUNCA body vacío)
 * 
 * Formato:
 * - Success: { ok: true, ...data }
 * - Error: { ok: false, code: string, message: string, fields?: object }
 */

/**
 * Respuesta de éxito
 */
export interface ApiSuccess<T = Record<string, unknown>> {
  ok: true;
}

/**
 * Respuesta de error
 */
export interface ApiError {
  ok: false;
  code: string;
  message: string;
  fields?: Record<string, unknown>;
}

/**
 * Crear respuesta JSON de éxito
 * 
 * @param data - Datos a retornar (se mezclan con { ok: true })
 * @returns Objeto con { ok: true, ...data }
 * 
 * @example
 * ```ts
 * return jsonSuccess({ booking: {...}, sessionToken: "..." });
 * // → { ok: true, booking: {...}, sessionToken: "..." }
 * ```
 */
export function jsonSuccess<T extends Record<string, unknown>>(
  data: T
): ApiSuccess<T> & T {
  return { ok: true, ...data };
}

/**
 * Crear respuesta JSON de error
 * 
 * @param code - Código de error (ej: SLOT_TAKEN, TOKEN_EXPIRED)
 * @param message - Mensaje human-readable
 * @param fields - (Opcional) Errores por campo (para validación)
 * @returns Objeto con { ok: false, code, message, fields? }
 * 
 * @example
 * ```ts
 * return jsonError("SLOT_TAKEN", "Este horario ya está reservado");
 * // → { ok: false, code: "SLOT_TAKEN", message: "..." }
 * 
 * return jsonError("INVALID_INPUT", "Datos inválidos", {
 *   email: "Email inválido",
 *   phone: "Teléfono requerido"
 * });
 * // → { ok: false, code: "INVALID_INPUT", message: "...", fields: {...} }
 * ```
 */
export function jsonError(
  code: string,
  message: string,
  fields?: Record<string, unknown>
): ApiError {
  const error: ApiError = { ok: false, code, message };
  if (fields && Object.keys(fields).length > 0) {
    error.fields = fields;
  }
  return error;
}

/**
 * Códigos de error estándar
 * 
 * Usados en toda la API para consistencia.
 */
export const ERROR_CODES = {
  // Client errors (4xx)
  INVALID_INPUT: "INVALID_INPUT",
  SLOT_TAKEN: "SLOT_TAKEN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  TOKEN_INVALID: "TOKEN_INVALID",
  ROI_REQUIRED: "ROI_REQUIRED",
  INVALID_TIMEZONE: "INVALID_TIMEZONE",
  INVALID_DATE: "INVALID_DATE",
  WEEKEND_NOT_ALLOWED: "WEEKEND_NOT_ALLOWED",
  CUTOFF_EXCEEDED: "CUTOFF_EXCEEDED",
  BOOKING_NOT_HELD: "BOOKING_NOT_HELD",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  
  // Server errors (5xx)
  DATABASE_ERROR: "DATABASE_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  EMAIL_FAILED: "EMAIL_FAILED",
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
