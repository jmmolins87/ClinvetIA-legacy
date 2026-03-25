/**
 * Analytics & Tracking Utility
 * 
 * Provides a unified interface for tracking events across different
 * analytics platforms (Google Analytics, Mixpanel, Segment, etc.)
 * 
 * @example
 * ```typescript
 * import { trackEvent, BookingEvents } from '@/lib/analytics';
 * 
 * trackEvent(BookingEvents.DATE_SELECTED, {
 *   date: '2026-02-16',
 *   dayOfWeek: 0
 * });
 * ```
 */

// Extend Window interface for analytics globals
declare global {
  interface Window {
    gtag?: (command: string, eventName: string, params?: Record<string, unknown>) => void;
    analytics?: {
      track: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}

/**
 * Check if analytics is enabled via environment variable
 */
function isAnalyticsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  
  const enabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS;
  return enabled === "true" || enabled === "1";
}

/**
 * Track an event to all configured analytics platforms
 * 
 * @param event - Event name (use BookingEvents constants)
 * @param properties - Additional event properties/metadata
 */
export function trackEvent(
  event: string,
  properties?: Record<string, unknown>
): void {
  if (!isAnalyticsEnabled()) {
    // In development, log to console
    if (process.env.NODE_ENV === "development") {
      console.info(`[Analytics] ${event}`, properties);
    }
    return;
  }

  try {
    // Google Analytics 4
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", event, properties);
    }

    // Segment / Mixpanel / etc.
    if (typeof window !== "undefined" && window.analytics?.track) {
      window.analytics.track(event, properties);
    }
  } catch (error) {
    console.error("[Analytics] Error tracking event:", error);
  }
}

/**
 * Track a page view
 * 
 * @param path - Page path
 * @param title - Page title
 */
export function trackPageView(path: string, title?: string): void {
  if (!isAnalyticsEnabled()) return;

  try {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "page_view", {
        page_path: path,
        page_title: title,
      });
    }
  } catch (error) {
    console.error("[Analytics] Error tracking page view:", error);
  }
}

/**
 * Booking flow event names
 */
export const BookingEvents = {
  // Calendar step
  DATE_SELECTED: "booking_date_selected",
  MONTH_CHANGED: "booking_month_changed",

  // Time slots step
  TIME_SLOT_CLICKED: "booking_time_slot_clicked",
  HOLD_CREATED: "booking_hold_created",
  HOLD_FAILED: "booking_hold_failed",
  HOLD_EXPIRED: "booking_hold_expired",

  // Contact form step
  FORM_STARTED: "booking_form_started",
  FORM_FIELD_CHANGED: "booking_form_field_changed",
  FORM_VALIDATION_ERROR: "booking_form_validation_error",

  // Confirmation
  BOOKING_CONFIRMED: "booking_confirmed",
  BOOKING_FAILED: "booking_failed",

  // Navigation & interruptions
  ROI_REDIRECT_CLICKED: "booking_roi_redirect_clicked",
  NAVIGATION_WARNING_SHOWN: "booking_navigation_warning_shown",
  BACK_BUTTON_CLICKED: "booking_back_button_clicked",

  // Errors
  API_ERROR: "booking_api_error",
  RATE_LIMIT_EXCEEDED: "booking_rate_limit_exceeded",
} as const;

/**
 * ROI Calculator event names
 */
export const ROIEvents = {
  CALCULATOR_STARTED: "roi_calculator_started",
  CLINIC_TYPE_SELECTED: "roi_clinic_type_selected",
  VALUES_CHANGED: "roi_values_changed",
  RESULTS_VIEWED: "roi_results_viewed",
  CTA_CLICKED: "roi_cta_clicked",
} as const;

/**
 * General app event names
 */
export const AppEvents = {
  LANGUAGE_CHANGED: "app_language_changed",
  THEME_CHANGED: "app_theme_changed",
} as const;
