/**
 * Logger Utility
 * 
 * Logger estructurado usando Pino.
 * Configurado para desarrollo (pretty) y producción (JSON).
 * 
 * IMPORTANTE: En Next.js App Router, solo usar en:
 * - API Routes (route.ts)
 * - Server Actions
 * - Middleware
 * 
 * NO usar en Server Components directamente.
 */

import pino from "pino";

const isDev = process.env.NODE_ENV === "development";

/**
 * Instancia de logger configurada
 */
export const logger = pino({
  level: isDev ? "debug" : "info",
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
          singleLine: false,
        },
      }
    : undefined,
  // En producción, log directo a stdout como JSON
  formatters: !isDev
    ? {
        level: (label) => {
          return { level: label };
        },
      }
    : undefined,
});

/**
 * Helper para logging de requests HTTP
 * 
 * @example
 * ```ts
 * logRequest("POST", "/api/bookings", 201, 150);
 * ```
 */
export function logRequest(
  method: string,
  path: string,
  statusCode: number,
  durationMs: number
) {
  logger.info(
    {
      method,
      path,
      statusCode,
      durationMs,
    },
    `${method} ${path} ${statusCode} - ${durationMs}ms`
  );
}

/**
 * Helper para logging de errores
 * 
 * @example
 * ```ts
 * logError(error, "Failed to create booking", { userId: "123" });
 * ```
 */
export function logError(
  error: Error | unknown,
  message: string,
  context?: Record<string, unknown>
) {
  logger.error(
    {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ...context,
    },
    message
  );
}

/**
 * Helper para logging de debug
 * 
 * Solo loguea en desarrollo.
 * 
 * @example
 * ```ts
 * logDebug("Validating payload", { payload });
 * ```
 */
export function logDebug(message: string, context?: Record<string, unknown>) {
  if (isDev) {
    logger.debug(context || {}, message);
  }
}
