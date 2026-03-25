/**
 * ROI Calculation Logic
 * Ported from legacy: /app/roi/page.tsx L77-132
 * 
 * MUST produce identical outputs to legacy for same inputs
 */

import type { ClinicType, ClinicConfig, ROIInputs, ROIResults } from "./roi.types";
import { isValidNumber, isValidPositiveNumber, isValidPercentage } from "@/lib/validators";

/**
 * Clinic configurations (exact values from legacy)
 * Source: legacy /app/roi/page.tsx L77-112
 */
export const CLINIC_CONFIGS: Record<ClinicType, ClinicConfig> = {
  small: {
    recoveryRate: 0.65, // 65%
    systemCost: 179,
    defaultPatients: 120,
    defaultTicket: 55,
    defaultMissedRate: 35,
  },
  medium: {
    recoveryRate: 0.70, // 70%
    systemCost: 199,
    defaultPatients: 250,
    defaultTicket: 65,
    defaultMissedRate: 30,
  },
  large: {
    recoveryRate: 0.75, // 75%
    systemCost: 249,
    defaultPatients: 450,
    defaultTicket: 75,
    defaultMissedRate: 25,
  },
  specialized: {
    recoveryRate: 0.60, // 60%
    systemCost: 229,
    defaultPatients: 180,
    defaultTicket: 95,
    defaultMissedRate: 30,
  },
};

/**
 * Get clinic configuration
 */
export function getClinicConfig(type: ClinicType | null): ClinicConfig {
  if (!type) {
    return {
      recoveryRate: 0,
      systemCost: 0,
      defaultPatients: 0,
      defaultTicket: 0,
      defaultMissedRate: 0,
    };
  }
  return CLINIC_CONFIGS[type];
}

/**
 * Validate ROI inputs
 */
export function validateInputs(inputs: ROIInputs): boolean {
  if (!inputs.clinicType) return false;
  if (!isValidPositiveNumber(inputs.monthlyPatients)) return false;
  if (!isValidPositiveNumber(inputs.avgTicket)) return false;
  if (!isValidPercentage(inputs.missedRate)) return false;
  return true;
}

/**
 * Calculate ROI results
 * Exact formula from legacy: /app/roi/page.tsx L125-131
 */
export function calculateROI(inputs: ROIInputs): ROIResults | null {
  // Must have clinic type
  if (!inputs.clinicType) return null;
  
  const config = getClinicConfig(inputs.clinicType);
  
  // Extract inputs
  const { monthlyPatients, avgTicket, missedRate } = inputs;
  
  // Validate inputs are valid numbers
  if (!isValidNumber(monthlyPatients) || !isValidNumber(avgTicket) || !isValidNumber(missedRate)) {
    return null;
  }
  
  // Calculate missed patients (legacy L125)
  const missedPatients = Math.round((monthlyPatients * missedRate) / 100);
  
  // Calculate recovered patients (legacy L126)
  const recoveredPatients = Math.round(missedPatients * config.recoveryRate);
  
  // Calculate monthly revenue (legacy L127)
  const monthlyRevenue = recoveredPatients * avgTicket;
  
  // Calculate yearly revenue (legacy L128)
  const yearlyRevenue = monthlyRevenue * 12;
  
  // Calculate ROI percentage (legacy L130)
  const systemCost = config.systemCost;
  const roi = systemCost > 0 
    ? Math.round(((monthlyRevenue - systemCost) / systemCost) * 100) 
    : 0;
  
  // Calculate break-even days (legacy L131)
  const breakEvenDays = systemCost > 0 && monthlyRevenue > 0 
    ? Math.round((systemCost / (monthlyRevenue / 30))) 
    : 0;
  
  // Validate no NaN or Infinity
  if (
    !isValidNumber(missedPatients) ||
    !isValidNumber(recoveredPatients) ||
    !isValidNumber(monthlyRevenue) ||
    !isValidNumber(yearlyRevenue) ||
    !isValidNumber(roi) ||
    !isValidNumber(breakEvenDays)
  ) {
    return null;
  }
  
  return {
    missedPatients,
    recoveredPatients,
    monthlyRevenue,
    yearlyRevenue,
    roi,
    breakEvenDays,
    systemCost,
    recoveryRate: config.recoveryRate,
  };
}

/**
 * Get default inputs for a clinic type
 */
export function getDefaultInputs(type: ClinicType): Omit<ROIInputs, "clinicType"> {
  const config = getClinicConfig(type);
  return {
    monthlyPatients: config.defaultPatients,
    avgTicket: config.defaultTicket,
    missedRate: config.defaultMissedRate,
  };
}
