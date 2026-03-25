/**
 * Error Toast Notifications
 *
 * Integrates error handling with Sonner toast notifications
 * Automatically shows user-friendly messages from error catalog
 */

"use client";

import { toast } from "sonner";
import type { ApiError } from "@/services/api/bookings";
import { getErrorMessage, type ErrorLocale } from "./errorMessages";

// ============================================================================
// Types
// ============================================================================

export interface ToastErrorOptions {
  /**
   * Locale for error messages (default: "es")
   */
  locale?: ErrorLocale;

  /**
   * Duration in ms (default: 5000)
   */
  duration?: number;

  /**
   * Show action button
   */
  action?: {
    label: string;
    onClick: () => void;
  };

  /**
   * Auto-use action from error catalog
   */
  useDefaultAction?: boolean;

  /**
   * Additional context to append to description
   */
  context?: string;

  /**
   * Toast ID for updates
   */
  id?: string | number;
}

// ============================================================================
// Toast Error Functions
// ============================================================================

/**
 * Show error toast with user-friendly message
 *
 * @example
 * try {
 *   await createBooking();
 * } catch (error) {
 *   showErrorToast(error as ApiError, { locale: "es" });
 * }
 */
export function showErrorToast(error: ApiError, options: ToastErrorOptions = {}): void {
  const {
    locale = "es",
    duration = 5000,
    action: customAction,
    useDefaultAction = false,
    context,
    id,
  } = options;

  const errorMessage = getErrorMessage(error, locale);

  // Build description with optional context
  let description = errorMessage.description;
  if (context) {
    description += ` ${context}`;
  }

  // Build action
  let action: { label: string; onClick: () => void } | undefined;

  if (customAction) {
    action = customAction;
  } else if (useDefaultAction && errorMessage.action) {
    action = {
      label: errorMessage.action,
      onClick: () => {
        // Default actions based on error code
        switch (error.code) {
          case "ROI_REQUIRED":
            if (typeof window !== "undefined") {
              window.location.href = "/roi";
            }
            break;
          case "TOKEN_INVALID":
            if (typeof window !== "undefined") {
              window.location.reload();
            }
            break;
          case "SLOT_TAKEN":
            if (typeof window !== "undefined") {
              window.location.href = "/reservar";
            }
            break;
          default:
            // No default action
            break;
        }
      },
    };
  }

  toast.error(errorMessage.title, {
    description,
    duration,
    action,
    id,
  });
}

/**
 * Show success toast
 */
export function showSuccessToast(
  title: string,
  options: {
    description?: string;
    duration?: number;
    action?: { label: string; onClick: () => void };
  } = {}
): void {
  const { description, duration = 3000, action } = options;

  toast.success(title, {
    description,
    duration,
    action,
  });
}

/**
 * Show info toast
 */
export function showInfoToast(
  title: string,
  options: {
    description?: string;
    duration?: number;
  } = {}
): void {
  const { description, duration = 3000 } = options;

  toast.info(title, {
    description,
    duration,
  });
}

/**
 * Show warning toast
 */
export function showWarningToast(
  title: string,
  options: {
    description?: string;
    duration?: number;
  } = {}
): void {
  const { description, duration = 4000 } = options;

  toast.warning(title, {
    description,
    duration,
  });
}

/**
 * Show loading toast (returns ID for updating)
 */
export function showLoadingToast(title: string, description?: string): string | number {
  return toast.loading(title, {
    description,
  });
}

/**
 * Update an existing toast
 */
export function updateToast(
  id: string | number,
  options: {
    type?: "success" | "error" | "info" | "warning";
    title?: string;
    description?: string;
  }
): void {
  const { type = "success", title, description } = options;

  switch (type) {
    case "success":
      toast.success(title || "Success", {
        id,
        description,
      });
      break;
    case "error":
      toast.error(title || "Error", {
        id,
        description,
      });
      break;
    case "info":
      toast.info(title || "Info", {
        id,
        description,
      });
      break;
    case "warning":
      toast.warning(title || "Warning", {
        id,
        description,
      });
      break;
  }
}

/**
 * Dismiss a toast
 */
export function dismissToast(id: string | number): void {
  toast.dismiss(id);
}

/**
 * Dismiss all toasts
 */
export function dismissAllToasts(): void {
  toast.dismiss();
}

// ============================================================================
// Specialized Toasts
// ============================================================================

/**
 * Show network error toast
 */
export function showNetworkErrorToast(locale: ErrorLocale = "es"): void {
  showErrorToast(
    { ok: false, code: "NETWORK_ERROR", message: "Network error" },
    { locale, useDefaultAction: false }
  );
}

/**
 * Show timeout error toast
 */
export function showTimeoutErrorToast(locale: ErrorLocale = "es"): void {
  showErrorToast(
    { ok: false, code: "TIMEOUT", message: "Timeout" },
    { locale, useDefaultAction: false }
  );
}

/**
 * Show validation error toast
 */
export function showValidationErrorToast(field?: string, locale: ErrorLocale = "es"): void {
  const message = field
    ? locale === "es"
      ? `El campo "${field}" no es válido`
      : `The field "${field}" is invalid`
    : undefined;

  showErrorToast(
    { ok: false, code: "INVALID_INPUT", message: message || "Invalid input" },
    { locale }
  );
}
