/**
 * Booking calculation tests
 *
 * Tests slot generation, time parsing, date validation, and hold logic
 */

import { describe, it, expect } from "vitest";
import {
  BOOKING_CONFIG,
  parseTimeHHmm,
  minutesToHHmm,
  formatYYYYMMDD,
  parseYYYYMMDD,
  generateSlotsForDate,
  isSameDayLocal,
  isDatePast,
  isAfterCutoff1900,
  canBookSameDay,
  isDateAvailable,
  calculateHoldExpiration,
  secondsLeft,
  formatCountdown,
  getDaysInMonth,
} from "../booking.calc";

describe("booking.calc", () => {
  describe("Time Parsing & Formatting", () => {
    it("should parse HH:mm format correctly", () => {
      expect(parseTimeHHmm("09:00")).toEqual({
        hours: 9,
        minutes: 0,
        totalMinutes: 540,
      });

      expect(parseTimeHHmm("17:30")).toEqual({
        hours: 17,
        minutes: 30,
        totalMinutes: 1050,
      });

      expect(parseTimeHHmm("00:00")).toEqual({
        hours: 0,
        minutes: 0,
        totalMinutes: 0,
      });

      expect(parseTimeHHmm("23:59")).toEqual({
        hours: 23,
        minutes: 59,
        totalMinutes: 1439,
      });
    });

    it("should throw on invalid time format", () => {
      // Note: Regex accepts 1-2 digit hours, so "9:00" is valid
      expect(() => parseTimeHHmm("09:0")).toThrow();  // Minutes must be 2 digits
      expect(() => parseTimeHHmm("25:00")).toThrow(); // Hour > 23
      expect(() => parseTimeHHmm("09:60")).toThrow(); // Minute > 59
      expect(() => parseTimeHHmm("invalid")).toThrow();
    });

    it("should convert minutes to HH:mm correctly", () => {
      expect(minutesToHHmm(0)).toBe("00:00");
      expect(minutesToHHmm(540)).toBe("09:00");
      expect(minutesToHHmm(1050)).toBe("17:30");
      expect(minutesToHHmm(1439)).toBe("23:59");
    });

    it("should throw on invalid minute values", () => {
      expect(() => minutesToHHmm(-1)).toThrow();
      expect(() => minutesToHHmm(1440)).toThrow();
      expect(() => minutesToHHmm(NaN)).toThrow();
      expect(() => minutesToHHmm(Infinity)).toThrow();
    });
  });

  describe("Date Formatting & Parsing", () => {
    it("should format date as YYYY-MM-DD", () => {
      const date = new Date(2025, 0, 15); // Jan 15, 2025
      expect(formatYYYYMMDD(date)).toBe("2025-01-15");
    });

    it("should parse YYYY-MM-DD to local Date", () => {
      const date = parseYYYYMMDD("2025-01-15");
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(0); // January = 0
      expect(date.getDate()).toBe(15);
      expect(date.getHours()).toBe(0);
      expect(date.getMinutes()).toBe(0);
    });

    it("should throw on invalid date format", () => {
      expect(() => parseYYYYMMDD("2025-1-15")).toThrow();
      expect(() => parseYYYYMMDD("2025/01/15")).toThrow();
      expect(() => parseYYYYMMDD("invalid")).toThrow();
    });

    it("should throw on invalid date values", () => {
      expect(() => parseYYYYMMDD("2025-02-30")).toThrow(); // Feb 30 doesn't exist
      expect(() => parseYYYYMMDD("2025-13-01")).toThrow(); // Month 13 doesn't exist
    });
  });

  describe("Slot Generation", () => {
    it("should generate slots from 09:00 to 17:30 in 30-min intervals", () => {
      const slots = generateSlotsForDate("2025-01-15");

      // Should have 17 slots: 09:00-09:30, 09:30-10:00, ..., 17:00-17:30
      expect(slots).toHaveLength(17);

      // First slot
      expect(slots[0]).toEqual({
        start: "09:00",
        end: "09:30",
      });

      // Last slot
      expect(slots[16]).toEqual({
        start: "17:00",
        end: "17:30",
      });

      // Middle slot
      expect(slots[8]).toEqual({
        start: "13:00",
        end: "13:30",
      });
    });

    it("should match legacy slot count (17 slots)", () => {
      // Legacy system generates slots from 09:00 to 17:30 in 30-min intervals
      // This should produce exactly 17 slots
      const slots = generateSlotsForDate("2025-01-15");
      expect(slots).toHaveLength(17);
    });

    it("should generate continuous slots without gaps", () => {
      const slots = generateSlotsForDate("2025-01-15");

      for (let i = 0; i < slots.length - 1; i++) {
        expect(slots[i].end).toBe(slots[i + 1].start);
      }
    });
  });

  describe("Date Validation", () => {
    it("should detect same-day correctly", () => {
      const today = new Date(2025, 0, 15, 10, 30); // Jan 15, 2025, 10:30 AM
      const sameDay = new Date(2025, 0, 15, 15, 0); // Jan 15, 2025, 3:00 PM
      const differentDay = new Date(2025, 0, 16, 10, 30); // Jan 16, 2025

      expect(isSameDayLocal(sameDay, today)).toBe(true);
      expect(isSameDayLocal(differentDay, today)).toBe(false);
    });

    it("should detect past dates correctly", () => {
      const now = new Date(2025, 0, 15, 10, 30); // Jan 15, 2025, 10:30 AM
      const yesterday = new Date(2025, 0, 14); // Jan 14, 2025
      const today = new Date(2025, 0, 15); // Jan 15, 2025
      const tomorrow = new Date(2025, 0, 16); // Jan 16, 2025

      expect(isDatePast(yesterday, now)).toBe(true);
      expect(isDatePast(today, now)).toBe(false);
      expect(isDatePast(tomorrow, now)).toBe(false);
    });

    it("should detect 19:00 cutoff correctly", () => {
      const before = new Date(2025, 0, 15, 18, 59); // 18:59 (before cutoff)
      const exactly = new Date(2025, 0, 15, 19, 0); // 19:00 (at cutoff)
      const after = new Date(2025, 0, 15, 19, 1); // 19:01 (after cutoff)

      expect(isAfterCutoff1900(before)).toBe(false);
      expect(isAfterCutoff1900(exactly)).toBe(true);
      expect(isAfterCutoff1900(after)).toBe(true);
    });

    it("should block same-day bookings after 19:00", () => {
      const today = new Date(2025, 0, 15);

      const before1900 = new Date(2025, 0, 15, 18, 30);
      const after1900 = new Date(2025, 0, 15, 19, 30);

      expect(canBookSameDay(today, before1900)).toBe(true);
      expect(canBookSameDay(today, after1900)).toBe(false);
    });

    it("should allow future-day bookings regardless of time", () => {
      const tomorrow = new Date(2025, 0, 16);
      const lateToday = new Date(2025, 0, 15, 22, 0); // 22:00 (late evening)

      expect(canBookSameDay(tomorrow, lateToday)).toBe(true);
    });

    it("should check all availability criteria", () => {
      const now = new Date(2025, 0, 15, 10, 0); // Wed Jan 15, 2025, 10:00 AM

      // Valid: Future weekday
      const tomorrow = new Date(2025, 0, 16); // Thu Jan 16
      expect(isDateAvailable(tomorrow, now)).toBe(true);

      // Invalid: Weekend
      const saturday = new Date(2025, 0, 18); // Sat Jan 18
      const sunday = new Date(2025, 0, 19); // Sun Jan 19
      expect(isDateAvailable(saturday, now)).toBe(false);
      expect(isDateAvailable(sunday, now)).toBe(false);

      // Invalid: Past
      const yesterday = new Date(2025, 0, 14);
      expect(isDateAvailable(yesterday, now)).toBe(false);

      // Invalid: More than 60 days in future
      const tooFar = new Date(2025, 0, 15);
      tooFar.setDate(tooFar.getDate() + 61);
      expect(isDateAvailable(tooFar, now)).toBe(false);

      // Valid: Exactly 60 days (if it's a weekday)
      // Jan 15 + 60 days = March 16, 2025 (Sunday) - not available
      // Let's test with a date we know is valid: 5 weekdays from now
      const nextWeek = new Date(2025, 0, 20); // Mon Jan 20
      expect(isDateAvailable(nextWeek, now)).toBe(true);
    });

    it("should block same-day after cutoff", () => {
      const today = new Date(2025, 0, 15);
      const after1900 = new Date(2025, 0, 15, 19, 30);

      expect(isDateAvailable(today, after1900)).toBe(false);
    });
  });

  describe("Hold Calculations", () => {
    it("should calculate hold expiration (10 minutes)", () => {
      const now = new Date(2025, 0, 15, 10, 0); // 10:00 AM
      const expiration = calculateHoldExpiration(now);

      // Should be exactly 10 minutes later
      expect(expiration.getTime() - now.getTime()).toBe(
        BOOKING_CONFIG.holdTtlMinutes * 60_000
      );
      expect(expiration.getTime() - now.getTime()).toBe(10 * 60_000);
    });

    it("should calculate seconds left correctly", () => {
      const now = new Date(2025, 0, 15, 10, 0, 0); // 10:00:00
      const future = new Date(2025, 0, 15, 10, 5, 30); // 10:05:30 (5m 30s later)

      expect(secondsLeft(future, now)).toBe(330); // 5*60 + 30
    });

    it("should return 0 for expired holds", () => {
      const now = new Date(2025, 0, 15, 10, 0);
      const past = new Date(2025, 0, 15, 9, 55); // 5 minutes ago

      expect(secondsLeft(past, now)).toBe(0);
    });

    it("should format countdown display correctly", () => {
      expect(formatCountdown(0)).toBe("0:00");
      expect(formatCountdown(30)).toBe("0:30");
      expect(formatCountdown(60)).toBe("1:00");
      expect(formatCountdown(90)).toBe("1:30");
      expect(formatCountdown(330)).toBe("5:30");
      expect(formatCountdown(599)).toBe("9:59");
    });
  });

  describe("Calendar Helpers", () => {
    it("should get days in month info correctly", () => {
      const jan2025 = new Date(2025, 0, 1); // January 2025
      const info = getDaysInMonth(jan2025);

      expect(info.year).toBe(2025);
      expect(info.month).toBe(0); // January = 0
      expect(info.daysInMonth).toBe(31);
      expect(info.startingDayOfWeek).toBe(3); // Jan 1, 2025 is Wednesday
    });

    it("should handle leap years correctly", () => {
      const feb2024 = new Date(2024, 1, 1); // February 2024 (leap year)
      const feb2025 = new Date(2025, 1, 1); // February 2025 (not leap year)

      expect(getDaysInMonth(feb2024).daysInMonth).toBe(29);
      expect(getDaysInMonth(feb2025).daysInMonth).toBe(28);
    });
  });
});
