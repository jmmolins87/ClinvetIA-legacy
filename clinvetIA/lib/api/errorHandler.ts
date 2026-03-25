/**
 * API Error Handler - Centralized error handling with retry logic
 *
 * Provides:
 * - Retry logic for transient network errors
 * - Exponential backoff
 * - User-friendly error messages
 * - Error logging for debugging
 * - Toast notifications
 */

import type { ApiError } from "@/services/api/bookings";

// ============================================================================
// Types
// ============================================================================

export interface ErrorHandlerConfig {
  /**
   * Maximum number of retry attempts (default: 3)
   */
  maxRetries?: number;

  /**
   * Initial delay between retries in ms (default: 1000)
   * Will be multiplied by 2^attempt for exponential backoff
   */
  retryDelay?: number;

  /**
   * Custom function to determine if error should be retried
   * Default: retry on network errors and 5xx status codes
   */
  shouldRetry?: (error: ApiError, attempt: number) => boolean;

  /**
   * Custom error logger (for Sentry, etc.)
   */
  onError?: (error: ApiError, context: string) => void;

  /**
   * Context string for logging (e.g., "booking-api", "availability")
   */
  context?: string;

  /**
   * Whether to show toast notifications (default: false)
   */
  showToast?: boolean;

  /**
   * Custom timeout in ms (default: none)
   */
  timeout?: number;
}

export interface RetryableFunction<T> {
  (): Promise<T>;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Error codes that should be retried
 */
const RETRYABLE_CODES = [
  "NETWORK_ERROR",
  "TIMEOUT",
  "INTERNAL_ERROR",
  "SERVICE_UNAVAILABLE",
] as const;

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<Omit<ErrorHandlerConfig, "shouldRetry" | "onError" | "timeout">> = {
  maxRetries: 3,
  retryDelay: 1000,
  context: "api",
  showToast: false,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Default retry logic - retry on network errors and 5xx codes
 */
function defaultShouldRetry(error: ApiError, attempt: number): boolean {
  if (attempt >= DEFAULT_CONFIG.maxRetries) {
    return false;
  }

  return RETRYABLE_CODES.includes(error.code as any);
}

/**
 * Calculate exponential backoff delay
 */
function getBackoffDelay(attempt: number, baseDelay: number): number {
  // Exponential backoff: baseDelay * 2^attempt
  // With jitter: randomize ±25% to avoid thundering herd
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);
  return Math.floor(exponentialDelay + jitter);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Default error logger - logs to console
 */
function defaultErrorLogger(error: ApiError, context: string): void {
  if (process.env.NODE_ENV === "development") {
    console.error(`[${context}] API Error:`, error);
  }

  // In production, this could send to Sentry, LogRocket, etc.
  // Example:
  // if (typeof window !== "undefined" && window.Sentry) {
  //   window.Sentry.captureException(new Error(error.message), {
  //     tags: { context, code: error.code },
  //     extra: { error },
  //   });
  // }
}

// ============================================================================
// Main Error Handler
// ============================================================================

/**
 * Execute a function with retry logic and error handling
 *
 * @example
 * const result = await withErrorHandling(
 *   () => getAvailability("2026-02-16"),
 *   {
 *     maxRetries: 3,
 *     context: "availability-api",
 *     showToast: true,
 *   }
 * );
 */
export async function withErrorHandling<T>(
  fn: RetryableFunction<T>,
  config: ErrorHandlerConfig = {}
): Promise<T> {
  const {
    maxRetries = DEFAULT_CONFIG.maxRetries,
    retryDelay = DEFAULT_CONFIG.retryDelay,
    shouldRetry = defaultShouldRetry,
    onError = defaultErrorLogger,
    context = DEFAULT_CONFIG.context,
    showToast = DEFAULT_CONFIG.showToast,
    timeout,
  } = config;

  let lastError: ApiError | Error | null = null;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      // Execute with optional timeout
      if (timeout) {
        const result = await Promise.race([
          fn(),
          sleep(timeout).then(() => {
            throw new Error("TIMEOUT");
          }),
        ]);
        return result;
      } else {
        return await fn();
      }
    } catch (error: any) {
      lastError = error;

      // Convert to ApiError format if needed
      const apiError: ApiError = error.ok === false
        ? error
        : {
            ok: false,
            code: error.code || "UNKNOWN_ERROR",
            message: error.message || "An unknown error occurred",
          };

      // Log error
      onError(apiError, context);

      // Check if we should retry
      if (attempt < maxRetries && shouldRetry(apiError, attempt)) {
        const delay = getBackoffDelay(attempt, retryDelay);

        if (process.env.NODE_ENV === "development") {
          console.log(
            `[${context}] Retrying after ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`
          );
        }

        await sleep(delay);
        attempt++;
        continue;
      }

      // No more retries - throw the error
      throw apiError;
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError || new Error("Unknown error");
}

// ============================================================================
// Specialized Handlers
// ============================================================================

/**
 * Wrapper for API calls that should show toast notifications
 */
export async function withToastErrorHandling<T>(
  fn: RetryableFunction<T>,
  config: Omit<ErrorHandlerConfig, "showToast"> = {}
): Promise<T> {
  return withErrorHandling(fn, {
    ...config,
    showToast: true,
  });
}

/**
 * Wrapper for critical API calls with more retries
 */
export async function withCriticalErrorHandling<T>(
  fn: RetryableFunction<T>,
  config: ErrorHandlerConfig = {}
): Promise<T> {
  return withErrorHandling(fn, {
    maxRetries: 5,
    retryDelay: 2000,
    ...config,
  });
}

// ============================================================================
// Error Classification
// ============================================================================

/**
 * Check if error is a network error
 */
export function isNetworkError(error: ApiError): boolean {
  return error.code === "NETWORK_ERROR" || error.code === "TIMEOUT";
}

/**
 * Check if error is a client error (4xx)
 */
export function isClientError(error: ApiError): boolean {
  const clientErrorCodes = [
    "INVALID_INPUT",
    "ROI_REQUIRED",
    "TOKEN_INVALID",
    "TOKEN_EXPIRED",
    "SLOT_TAKEN",
    "NOT_FOUND",
  ];
  return clientErrorCodes.includes(error.code);
}

/**
 * Check if error is a server error (5xx)
 */
export function isServerError(error: ApiError): boolean {
  return error.code === "INTERNAL_ERROR" || error.code === "SERVICE_UNAVAILABLE";
}

/**
 * Get retry recommendation for error
 */
export function shouldRetryError(error: ApiError): boolean {
  return isNetworkError(error) || isServerError(error);
}
