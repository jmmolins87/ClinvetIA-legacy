/**
 * Rate Limiting Utility
 * 
 * Prevents abuse by limiting the number of attempts within a time window.
 * Uses in-memory storage for client-side rate limiting.
 * 
 * @example
 * ```typescript
 * const limiter = createRateLimiter(5, 60_000); // 5 attempts per minute
 * 
 * if (!limiter.canProceed()) {
 *   const seconds = Math.ceil(limiter.getRemainingTime() / 1000);
 *   alert(`Too many attempts. Wait ${seconds} seconds.`);
 *   return;
 * }
 * 
 * limiter.recordAttempt();
 * await performAction();
 * ```
 */

export interface RateLimiter {
  /**
   * Check if another attempt can proceed
   */
  canProceed: () => boolean;

  /**
   * Record a new attempt (called after successful action)
   */
  recordAttempt: () => void;

  /**
   * Get remaining time in milliseconds before next attempt is allowed
   */
  getRemainingTime: () => number;

  /**
   * Get number of attempts made in current window
   */
  getAttemptCount: () => number;

  /**
   * Reset all attempts (useful for testing or manual resets)
   */
  reset: () => void;
}

/**
 * Create a rate limiter instance
 * 
 * @param maxAttempts - Maximum number of attempts allowed in the time window
 * @param windowMs - Time window in milliseconds
 * @returns RateLimiter instance
 */
export function createRateLimiter(
  maxAttempts: number,
  windowMs: number
): RateLimiter {
  const attempts: number[] = [];

  const cleanupOldAttempts = () => {
    const now = Date.now();
    const cutoff = now - windowMs;

    // Remove attempts older than the time window
    while (attempts.length > 0 && attempts[0] < cutoff) {
      attempts.shift();
    }
  };

  return {
    canProceed: () => {
      cleanupOldAttempts();
      return attempts.length < maxAttempts;
    },

    recordAttempt: () => {
      attempts.push(Date.now());
      cleanupOldAttempts();
    },

    getRemainingTime: () => {
      cleanupOldAttempts();

      if (attempts.length < maxAttempts) {
        return 0; // No wait needed
      }

      // Calculate when the oldest attempt will expire
      const oldestAttempt = attempts[0];
      const elapsed = Date.now() - oldestAttempt;
      const remaining = windowMs - elapsed;

      return Math.max(0, remaining);
    },

    getAttemptCount: () => {
      cleanupOldAttempts();
      return attempts.length;
    },

    reset: () => {
      attempts.length = 0;
    },
  };
}

/**
 * Debounce utility to prevent rapid successive calls
 * 
 * @param fn - Function to debounce
 * @param delayMs - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delayMs);
  };
}

/**
 * Throttle utility to limit function calls to once per time period
 * 
 * @param fn - Function to throttle
 * @param delayMs - Minimum time between calls in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastCall >= delayMs) {
      lastCall = now;
      fn(...args);
    }
  };
}
