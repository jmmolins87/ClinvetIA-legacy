/**
 * Error Messages Catalog - User-friendly error messages
 *
 * Provides translated, context-aware error messages for users
 * Maps API error codes to friendly messages in ES/EN
 */

import type { ApiError } from "@/services/api/bookings";

// ============================================================================
// Types
// ============================================================================

export type ErrorLocale = "es" | "en";
export type { ApiError };

export interface ErrorMessage {
  title: string;
  description: string;
  action?: string;
}

export interface ErrorMessageCatalog {
  [key: string]: {
    es: ErrorMessage;
    en: ErrorMessage;
  };
}

// ============================================================================
// Error Messages Catalog
// ============================================================================

/**
 * Complete catalog of error messages in ES/EN
 */
export const ERROR_MESSAGES: ErrorMessageCatalog = {
  // Network & Connection Errors
  NETWORK_ERROR: {
    es: {
      title: "Sin conexión",
      description: "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
      action: "Reintentar",
    },
    en: {
      title: "No connection",
      description: "Could not connect to server. Check your internet connection.",
      action: "Retry",
    },
  },

  TIMEOUT: {
    es: {
      title: "Tiempo agotado",
      description: "La solicitud tardó demasiado. Por favor, inténtalo de nuevo.",
      action: "Reintentar",
    },
    en: {
      title: "Timeout",
      description: "Request took too long. Please try again.",
      action: "Retry",
    },
  },

  // Booking Errors
  SLOT_TAKEN: {
    es: {
      title: "Horario no disponible",
      description:
        "Este horario ya fue reservado por otro usuario. Por favor, selecciona otro horario.",
      action: "Ver otros horarios",
    },
    en: {
      title: "Slot not available",
      description:
        "This time slot was just booked by another user. Please select another time.",
      action: "View other times",
    },
  },

  TOKEN_EXPIRED: {
    es: {
      title: "Reserva expirada",
      description:
        "Tu reserva temporal ha expirado. Por favor, selecciona un nuevo horario.",
      action: "Seleccionar horario",
    },
    en: {
      title: "Booking expired",
      description: "Your temporary hold has expired. Please select a new time slot.",
      action: "Select time",
    },
  },

  TOKEN_INVALID: {
    es: {
      title: "Sesión inválida",
      description: "Tu sesión no es válida. Por favor, recarga la página e intenta de nuevo.",
      action: "Recargar página",
    },
    en: {
      title: "Invalid session",
      description: "Your session is invalid. Please reload the page and try again.",
      action: "Reload page",
    },
  },

  BOOKING_NOT_HELD: {
    es: {
      title: "Reserva no activa",
      description: "No hay una reserva activa. Por favor, selecciona un horario primero.",
      action: "Ir al calendario",
    },
    en: {
      title: "No active booking",
      description: "There's no active booking. Please select a time slot first.",
      action: "Go to calendar",
    },
  },

  // Validation Errors
  ROI_REQUIRED: {
    es: {
      title: "Calculadora ROI requerida",
      description:
        "Para reservar una demo necesitas completar la calculadora ROI primero. Esto nos ayuda a personalizar tu experiencia.",
      action: "Ir a calculadora ROI",
    },
    en: {
      title: "ROI Calculator required",
      description:
        "To book a demo you need to complete the ROI calculator first. This helps us personalize your experience.",
      action: "Go to ROI calculator",
    },
  },

  INVALID_INPUT: {
    es: {
      title: "Datos inválidos",
      description:
        "Algunos datos del formulario no son válidos. Por favor, revisa la información e intenta de nuevo.",
      action: "Revisar formulario",
    },
    en: {
      title: "Invalid data",
      description:
        "Some form data is invalid. Please review the information and try again.",
      action: "Review form",
    },
  },

  // Server Errors
  INTERNAL_ERROR: {
    es: {
      title: "Error del servidor",
      description:
        "Ocurrió un error en nuestro servidor. Por favor, inténtalo de nuevo en unos minutos.",
      action: "Reintentar más tarde",
    },
    en: {
      title: "Server error",
      description:
        "A server error occurred. Please try again in a few minutes.",
      action: "Try again later",
    },
  },

  SERVICE_UNAVAILABLE: {
    es: {
      title: "Servicio no disponible",
      description:
        "El servicio está temporalmente no disponible. Estamos trabajando para resolverlo.",
      action: "Reintentar más tarde",
    },
    en: {
      title: "Service unavailable",
      description:
        "The service is temporarily unavailable. We're working to resolve it.",
      action: "Try again later",
    },
  },

  NOT_FOUND: {
    es: {
      title: "No encontrado",
      description: "No se encontró la reserva solicitada. Puede que haya sido cancelada.",
      action: "Volver al inicio",
    },
    en: {
      title: "Not found",
      description: "The requested booking was not found. It may have been cancelled.",
      action: "Go back",
    },
  },

  // Email Errors
  EMAIL_FAILED: {
    es: {
      title: "Email no enviado",
      description:
        "Tu reserva está confirmada, pero no pudimos enviar el email de confirmación. Revisa tu bandeja de entrada más tarde o contacta con soporte.",
      action: "Entendido",
    },
    en: {
      title: "Email not sent",
      description:
        "Your booking is confirmed, but we couldn't send the confirmation email. Check your inbox later or contact support.",
      action: "Got it",
    },
  },

  // Generic/Unknown Errors
  UNKNOWN_ERROR: {
    es: {
      title: "Error inesperado",
      description:
        "Ocurrió un error inesperado. Si el problema persiste, por favor contacta con soporte.",
      action: "Contactar soporte",
    },
    en: {
      title: "Unexpected error",
      description:
        "An unexpected error occurred. If the problem persists, please contact support.",
      action: "Contact support",
    },
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get user-friendly error message for an API error
 *
 * @example
 * const message = getErrorMessage(error, "es");
 * toast.error(message.title, { description: message.description });
 */
export function getErrorMessage(
  error: ApiError,
  locale: ErrorLocale = "es"
): ErrorMessage {
  const errorCode = error.code || "UNKNOWN_ERROR";
  const catalog = ERROR_MESSAGES[errorCode];

  if (!catalog) {
    return ERROR_MESSAGES.UNKNOWN_ERROR[locale];
  }

  return catalog[locale];
}

/**
 * Get just the title for quick toast notifications
 */
export function getErrorTitle(error: ApiError, locale: ErrorLocale = "es"): string {
  return getErrorMessage(error, locale).title;
}

/**
 * Get just the description
 */
export function getErrorDescription(error: ApiError, locale: ErrorLocale = "es"): string {
  return getErrorMessage(error, locale).description;
}

/**
 * Get the suggested action button text
 */
export function getErrorAction(error: ApiError, locale: ErrorLocale = "es"): string | undefined {
  return getErrorMessage(error, locale).action;
}

/**
 * Check if error has a suggested action
 */
export function hasErrorAction(error: ApiError): boolean {
  const message = getErrorMessage(error, "es");
  return !!message.action;
}

// ============================================================================
// Common Error Patterns
// ============================================================================

/**
 * Get error message for network-related errors
 */
export function getNetworkErrorMessage(locale: ErrorLocale = "es"): ErrorMessage {
  return ERROR_MESSAGES.NETWORK_ERROR[locale];
}

/**
 * Get error message for timeout errors
 */
export function getTimeoutErrorMessage(locale: ErrorLocale = "es"): ErrorMessage {
  return ERROR_MESSAGES.TIMEOUT[locale];
}

/**
 * Get error message for validation errors
 */
export function getValidationErrorMessage(
  field?: string,
  locale: ErrorLocale = "es"
): ErrorMessage {
  const base = ERROR_MESSAGES.INVALID_INPUT[locale];

  if (field) {
    return {
      ...base,
      description: locale === "es"
        ? `El campo "${field}" no es válido. Por favor, verifica e intenta de nuevo.`
        : `The field "${field}" is invalid. Please check and try again.`,
    };
  }

  return base;
}
