/**
 * ROI Calculation Tests
 * Validates that outputs match legacy for known inputs
 */

import { describe, it, expect } from "vitest";
import { calculateROI, getClinicConfig, CLINIC_CONFIGS } from "../roi.calc";
import type { ROIInputs } from "../roi.types";

describe("ROI Calculation", () => {
  describe("Clinic Configs", () => {
    it("should have correct recovery rates", () => {
      expect(CLINIC_CONFIGS.small.recoveryRate).toBe(0.65);
      expect(CLINIC_CONFIGS.medium.recoveryRate).toBe(0.70);
      expect(CLINIC_CONFIGS.large.recoveryRate).toBe(0.75);
      expect(CLINIC_CONFIGS.specialized.recoveryRate).toBe(0.60);
    });

    it("should have correct system costs", () => {
      expect(CLINIC_CONFIGS.small.systemCost).toBe(179);
      expect(CLINIC_CONFIGS.medium.systemCost).toBe(199);
      expect(CLINIC_CONFIGS.large.systemCost).toBe(249);
      expect(CLINIC_CONFIGS.specialized.systemCost).toBe(229);
    });
  });

  describe("calculateROI", () => {
    it("should return null for no clinic type", () => {
      const inputs: ROIInputs = {
        clinicType: null,
        monthlyPatients: 100,
        avgTicket: 50,
        missedRate: 30,
      };
      const result = calculateROI(inputs);
      expect(result).toBeNull();
    });

    it("should calculate correctly for small clinic (default values)", () => {
      const inputs: ROIInputs = {
        clinicType: "small",
        monthlyPatients: 120,
        avgTicket: 55,
        missedRate: 35,
      };
      
      const result = calculateROI(inputs);
      expect(result).not.toBeNull();
      
      // Expected calculations:
      // missedPatients = (120 * 35) / 100 = 42
      // recoveredPatients = round(42 * 0.65) = 27
      // monthlyRevenue = 27 * 55 = 1485
      // yearlyRevenue = 1485 * 12 = 17820
      // roi = ((1485 - 179) / 179) * 100 = 729.6 → 730
      // breakEvenDays = (179 / (1485 / 30)) = 3.6 → 4
      
      expect(result?.missedPatients).toBe(42);
      expect(result?.recoveredPatients).toBe(27);
      expect(result?.monthlyRevenue).toBe(1485);
      expect(result?.yearlyRevenue).toBe(17820);
      expect(result?.roi).toBe(730);
      expect(result?.breakEvenDays).toBe(4);
      expect(result?.systemCost).toBe(179);
      expect(result?.recoveryRate).toBe(0.65);
    });

    it("should calculate correctly for medium clinic (default values)", () => {
      const inputs: ROIInputs = {
        clinicType: "medium",
        monthlyPatients: 250,
        avgTicket: 65,
        missedRate: 30,
      };
      
      const result = calculateROI(inputs);
      expect(result).not.toBeNull();
      
      // Expected calculations:
      // missedPatients = (250 * 30) / 100 = 75
      // recoveredPatients = round(75 * 0.70) = 53 (52.5 rounded)
      // monthlyRevenue = 53 * 65 = 3445
      // yearlyRevenue = 3445 * 12 = 41340
      // roi = ((3445 - 199) / 199) * 100 = 1631.15 → 1631
      // breakEvenDays = (199 / (3445 / 30)) = 1.73 → 2
      
      expect(result?.missedPatients).toBe(75);
      expect(result?.recoveredPatients).toBe(53);
      expect(result?.monthlyRevenue).toBe(3445);
      expect(result?.yearlyRevenue).toBe(41340);
      expect(result?.roi).toBe(1631);
      expect(result?.breakEvenDays).toBe(2);
      expect(result?.systemCost).toBe(199);
    });

    it("should calculate correctly for large clinic (default values)", () => {
      const inputs: ROIInputs = {
        clinicType: "large",
        monthlyPatients: 450,
        avgTicket: 75,
        missedRate: 25,
      };
      
      const result = calculateROI(inputs);
      expect(result).not.toBeNull();
      
      // missedPatients = (450 * 25) / 100 = 112.5 → 113
      // recoveredPatients = round(113 * 0.75) = 85 (84.75 rounded)
      // monthlyRevenue = 85 * 75 = 6375
      // yearlyRevenue = 6375 * 12 = 76500
      // roi = ((6375 - 249) / 249) * 100 = 2459.8 → 2460
      // breakEvenDays = (249 / (6375 / 30)) = 1.17 → 1
      
      expect(result?.missedPatients).toBe(113);
      expect(result?.recoveredPatients).toBe(85);
      expect(result?.monthlyRevenue).toBe(6375);
      expect(result?.yearlyRevenue).toBe(76500);
      expect(result?.roi).toBe(2460);
      expect(result?.breakEvenDays).toBe(1);
    });

    it("should calculate correctly for specialized clinic (default values)", () => {
      const inputs: ROIInputs = {
        clinicType: "specialized",
        monthlyPatients: 180,
        avgTicket: 95,
        missedRate: 30,
      };
      
      const result = calculateROI(inputs);
      expect(result).not.toBeNull();
      
      // missedPatients = (180 * 30) / 100 = 54
      // recoveredPatients = round(54 * 0.60) = 32 (32.4 rounded)
      // monthlyRevenue = 32 * 95 = 3040
      // yearlyRevenue = 3040 * 12 = 36480
      // roi = ((3040 - 229) / 229) * 100 = 1227.07 → 1227
      // breakEvenDays = (229 / (3040 / 30)) = 2.26 → 2
      
      expect(result?.missedPatients).toBe(54);
      expect(result?.recoveredPatients).toBe(32);
      expect(result?.monthlyRevenue).toBe(3040);
      expect(result?.yearlyRevenue).toBe(36480);
      expect(result?.roi).toBe(1227);
      expect(result?.breakEvenDays).toBe(2);
    });

    it("should handle custom values", () => {
      const inputs: ROIInputs = {
        clinicType: "medium",
        monthlyPatients: 300,
        avgTicket: 70,
        missedRate: 35,
      };
      
      const result = calculateROI(inputs);
      expect(result).not.toBeNull();
      
      // missedPatients = (300 * 35) / 100 = 105
      // recoveredPatients = round(105 * 0.70) = 74 (73.5 rounded)
      // monthlyRevenue = 74 * 70 = 5180
      // yearlyRevenue = 5180 * 12 = 62160
      // roi = ((5180 - 199) / 199) * 100 = 2503.01 → 2503
      // breakEvenDays = (199 / (5180 / 30)) = 1.15 → 1
      
      expect(result?.missedPatients).toBe(105);
      expect(result?.recoveredPatients).toBe(74);
      expect(result?.monthlyRevenue).toBe(5180);
      expect(result?.yearlyRevenue).toBe(62160);
      expect(result?.roi).toBe(2503);
      expect(result?.breakEvenDays).toBe(1);
    });

    it("should handle zero values gracefully", () => {
      const inputs: ROIInputs = {
        clinicType: "small",
        monthlyPatients: 0,
        avgTicket: 0,
        missedRate: 0,
      };
      
      const result = calculateROI(inputs);
      expect(result).not.toBeNull();
      expect(result?.monthlyRevenue).toBe(0);
      expect(result?.yearlyRevenue).toBe(0);
      expect(result?.roi).toBe(-100); // (0 - 179) / 179 * 100
      expect(result?.breakEvenDays).toBe(0);
    });

    it("should not produce NaN or Infinity", () => {
      const inputs: ROIInputs = {
        clinicType: "large",
        monthlyPatients: 1000,
        avgTicket: 100,
        missedRate: 50,
      };
      
      const result = calculateROI(inputs);
      expect(result).not.toBeNull();
      
      expect(Number.isFinite(result?.missedPatients)).toBe(true);
      expect(Number.isFinite(result?.recoveredPatients)).toBe(true);
      expect(Number.isFinite(result?.monthlyRevenue)).toBe(true);
      expect(Number.isFinite(result?.yearlyRevenue)).toBe(true);
      expect(Number.isFinite(result?.roi)).toBe(true);
      expect(Number.isFinite(result?.breakEvenDays)).toBe(true);
    });
  });

  describe("getClinicConfig", () => {
    it("should return config for valid clinic type", () => {
      const config = getClinicConfig("medium");
      expect(config.recoveryRate).toBe(0.70);
      expect(config.systemCost).toBe(199);
    });

    it("should return empty config for null", () => {
      const config = getClinicConfig(null);
      expect(config.recoveryRate).toBe(0);
      expect(config.systemCost).toBe(0);
    });
  });
});
