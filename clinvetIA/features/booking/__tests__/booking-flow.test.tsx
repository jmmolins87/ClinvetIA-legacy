/**
 * Booking Flow E2E Tests
 *
 * Tests the complete booking flow from date selection to confirmation
 * using mock APIs and simulating user interactions.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useBooking } from "../useBooking";
import type { AvailabilitySlot } from "../booking.types";
import * as bookingsApi from "@/services/api/bookings";

describe("Booking Flow E2E", () => {
  const mockROIData = {
    clinicType: "small",
    monthlyPatients: 120,
    avgTicket: 55,
    missedRate: 35,
    monthlyRevenue: 1485,
    yearlyRevenue: 17820,
    roi: 730,
    breakEvenDays: 4,
    timestamp: Date.now(),
    accepted: true,
  };

  beforeEach(() => {
    // Clear storage before each test
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();

    // Mock Date.now for consistent timestamps
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-15T10:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should complete full booking flow successfully", async () => {
    const onComplete = vi.fn();

    // Mock API responses
    const mockAvailability: AvailabilitySlot[] = [
      { start: "09:00", end: "09:30", available: true },
      { start: "09:30", end: "10:00", available: true },
      { start: "10:00", end: "10:30", available: false },
    ];

    vi.spyOn(bookingsApi, "getAvailability").mockResolvedValue({
      ok: true,
      date: "2026-02-16",
      timezone: "Europe/Madrid",
      slotMinutes: 30,
      slots: mockAvailability,
    });

    const holdExpiration = new Date(Date.now() + 10 * 60 * 1000);

    vi.spyOn(bookingsApi, "createHold").mockResolvedValue({
      ok: true,
      sessionToken: "test-token-123",
      booking: {
        date: "2026-02-16",
        time: "09:00",
        startAtISO: "2026-02-16T09:00:00Z",
        endAtISO: "2026-02-16T09:30:00Z",
        expiresAtISO: holdExpiration.toISOString(),
        timezone: "Europe/Madrid",
        locale: "es",
        status: "HELD",
      },
    });

    vi.spyOn(bookingsApi, "confirmBooking").mockResolvedValue({
      ok: true,
      booking: {
        id: "booking-123",
        status: "CONFIRMED",
        startAtISO: "2026-02-16T09:00:00Z",
        endAtISO: "2026-02-16T09:30:00Z",
        timezone: "Europe/Madrid",
        locale: "es",
        confirmedAtISO: new Date().toISOString(),
        contact: {
          fullName: "Juan Pérez",
          email: "juan@test.com",
          phone: "612345678",
          clinicName: "Clínica Test",
          message: "Test message",
        },
      },
      cancel: {
        token: "cancel-123",
        url: "https://example.com/cancel/cancel-123",
      },
      reschedule: {
        token: "reschedule-123",
        url: "https://example.com/reschedule/reschedule-123",
      },
      ics: {
        url: "https://example.com/ics/booking-123",
      },
      email: {
        enabled: true,
        skipped: false,
        provider: "brevo",
        ok: true,
        messageId: "msg-123",
      },
    });

    const { result } = renderHook(() =>
      useBooking({
        locale: "es",
        roiData: mockROIData,
        hasROIData: true,
        onBookingComplete: onComplete,
      })
    );

    // Step 1: Select date
    expect(result.current.step).toBe(1);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    await act(async () => {
      result.current.handleDateSelect(tomorrow);
    });

    // Step 2: Should move to time slots and load availability
    await waitFor(() => {
      expect(result.current.step).toBe(2);
    });

    await waitFor(() => {
      expect(result.current.availability).not.toBeNull();
    });

    expect(result.current.availability).toHaveLength(3);
    expect(result.current.availabilityLoading).toBe(false);

    // Select time slot
    await act(async () => {
      result.current.handleTimeSelect("09:00");
    });

    // Step 3: Should move to contact form after hold is created
    await waitFor(() => {
      expect(result.current.step).toBe(3);
    });

    expect(result.current.hold).not.toBeNull();
    expect(result.current.hold?.sessionToken).toBe("test-token-123");

    // Fill contact draft
    await act(async () => {
      result.current.updateContactDraft({
        fullName: "Juan Pérez",
        email: "juan@test.com",
        phone: "612345678",
        clinicName: "Clínica Test",
        message: "Test message",
      });
    });

    // Confirm booking
    let confirmResult: any;
    await act(async () => {
      confirmResult = await result.current.handleConfirm();
    });

    // Verify confirmation was successful
    expect(confirmResult.ok).toBe(true);

    // Verify onComplete was called
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        time: "09:00",
        confirm: expect.objectContaining({
          booking: expect.objectContaining({
            id: "booking-123",
            status: "CONFIRMED",
          }),
        }),
      })
    );
  });

  it("should handle hold expiration", async () => {
    // Mock availability
    vi.spyOn(bookingsApi, "getAvailability").mockResolvedValue({
      ok: true,
      date: "2026-02-16",
      timezone: "Europe/Madrid",
      slotMinutes: 30,
      slots: [{ start: "09:00", end: "09:30", available: true }],
    });

    const holdExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    vi.spyOn(bookingsApi, "createHold").mockResolvedValue({
      ok: true,
      sessionToken: "test-token",
      booking: {
        date: "2026-02-16",
        time: "09:00",
        startAtISO: "2026-02-16T09:00:00Z",
        endAtISO: "2026-02-16T09:30:00Z",
        expiresAtISO: holdExpiration.toISOString(),
        timezone: "Europe/Madrid",
        locale: "es",
        status: "HELD",
      },
    });

    const { result } = renderHook(() =>
      useBooking({
        locale: "es",
        roiData: mockROIData,
        hasROIData: true,
      })
    );

    // Select date and time to create hold
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    await act(async () => {
      result.current.handleDateSelect(tomorrow);
    });

    await waitFor(() => {
      expect(result.current.step).toBe(2);
    });

    await waitFor(() => {
      expect(result.current.availability).not.toBeNull();
    });

    await act(async () => {
      result.current.handleTimeSelect("09:00");
    });

    await waitFor(() => {
      expect(result.current.hold).not.toBeNull();
    });

    // Verify initial hold seconds left (~600 seconds = 10 minutes)
    expect(result.current.holdSecondsLeft).toBeGreaterThan(590);
    expect(result.current.holdSecondsLeft).toBeLessThanOrEqual(600);

    // Fast-forward 5 minutes
    await act(async () => {
      vi.advanceTimersByTime(5 * 60 * 1000);
    });

    // Timer should have updated
    await waitFor(() => {
      expect(result.current.holdSecondsLeft).toBeGreaterThan(290);
      expect(result.current.holdSecondsLeft).toBeLessThanOrEqual(300);
    });
  });

  it("should handle API error when slot is taken", async () => {
    // Mock availability
    vi.spyOn(bookingsApi, "getAvailability").mockResolvedValue({
      ok: true,
      date: "2026-02-16",
      timezone: "Europe/Madrid",
      slotMinutes: 30,
      slots: [{ start: "09:00", end: "09:30", available: true }],
    });

    // Mock hold creation failure (slot taken)
    vi.spyOn(bookingsApi, "createHold").mockResolvedValue({
      ok: false,
      code: "SLOT_TAKEN",
      message: "Este horario ya no está disponible",
    });

    const { result } = renderHook(() =>
      useBooking({
        locale: "es",
        roiData: mockROIData,
        hasROIData: true,
      })
    );

    // Select date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    await act(async () => {
      result.current.handleDateSelect(tomorrow);
    });

    await waitFor(() => {
      expect(result.current.availability).not.toBeNull();
    });

    // Try to select time
    await act(async () => {
      result.current.handleTimeSelect("09:00");
    });

    // Should remain on step 2 (time selection)
    expect(result.current.step).toBe(2);
    expect(result.current.hold).toBeNull();

    // Should show error
    await waitFor(() => {
      expect(result.current.availabilityError).toBeTruthy();
    });
  });

  it("should block booking without ROI data", async () => {
    const { result } = renderHook(() =>
      useBooking({
        locale: "es",
        roiData: null,
        hasROIData: false,
      })
    );

    // Try to confirm without ROI data (should fail validation)
    let confirmResult: any;
    await act(async () => {
      confirmResult = await result.current.handleConfirm();
    });

    expect(confirmResult.ok).toBe(false);
    expect(confirmResult.error).toContain("ROI");
  });

  it("should allow navigation back from time slots to calendar", async () => {
    vi.spyOn(bookingsApi, "getAvailability").mockResolvedValue({
      ok: true,
      date: "2026-02-16",
      timezone: "Europe/Madrid",
      slotMinutes: 30,
      slots: [{ start: "09:00", end: "09:30", available: true }],
    });

    const { result } = renderHook(() =>
      useBooking({
        locale: "es",
        roiData: mockROIData,
        hasROIData: true,
      })
    );

    // Go to step 2
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    await act(async () => {
      result.current.handleDateSelect(tomorrow);
    });

    await waitFor(() => {
      expect(result.current.step).toBe(2);
    });

    // Go back to step 1
    await act(async () => {
      result.current.setStep(1);
      result.current.handleDateSelect(undefined);
    });

    expect(result.current.step).toBe(1);
    expect(result.current.selectedDate).toBeNull();
  });

  it("should validate contact information before confirming", async () => {
    vi.spyOn(bookingsApi, "getAvailability").mockResolvedValue({
      ok: true,
      date: "2026-02-16",
      timezone: "Europe/Madrid",
      slotMinutes: 30,
      slots: [{ start: "09:00", end: "09:30", available: true }],
    });

    vi.spyOn(bookingsApi, "createHold").mockResolvedValue({
      ok: true,
      sessionToken: "test-token",
      booking: {
        date: "2026-02-16",
        time: "09:00",
        startAtISO: "2026-02-16T09:00:00Z",
        endAtISO: "2026-02-16T09:30:00Z",
        expiresAtISO: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        timezone: "Europe/Madrid",
        locale: "es",
        status: "HELD",
      },
    });

    const { result } = renderHook(() =>
      useBooking({
        locale: "es",
        roiData: mockROIData,
        hasROIData: true,
      })
    );

    // Create a hold
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    await act(async () => {
      result.current.handleDateSelect(tomorrow);
    });

    await waitFor(() => {
      expect(result.current.step).toBe(2);
    });

    await waitFor(() => {
      expect(result.current.availability).not.toBeNull();
    });

    await act(async () => {
      result.current.handleTimeSelect("09:00");
    });

    await waitFor(() => {
      expect(result.current.hold).not.toBeNull();
    });

    // Try to confirm without filling contact info
    let confirmResult: any;
    await act(async () => {
      confirmResult = await result.current.handleConfirm();
    });

    expect(confirmResult.ok).toBe(false);
    expect(confirmResult.error).toContain("Contact information required");
  });
});
