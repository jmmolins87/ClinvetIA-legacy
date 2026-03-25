/**
 * ROI Calculator Types
 * Must match legacy exactly for storage compatibility
 */

export type ClinicType = "small" | "medium" | "large" | "specialized";

/**
 * ROI calculation inputs
 */
export interface ROIInputs {
  clinicType: ClinicType | null;
  monthlyPatients: number;
  avgTicket: number;
  missedRate: number;
}

/**
 * ROI calculation results
 */
export interface ROIResults {
  missedPatients: number;
  recoveredPatients: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  roi: number;
  breakEvenDays: number;
  systemCost: number;
  recoveryRate: number;
}

/**
 * Complete ROI data stored in localStorage
 * MUST match legacy shape exactly: /hooks/use-roi-data.ts
 */
export interface ROIData {
  clinicType?: string;
  monthlyPatients: number;
  avgTicket: number;
  missedRate: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  roi: number;
  breakEvenDays: number;
  timestamp: number;
  accepted?: boolean;
}

/**
 * Clinic configuration per type
 */
export interface ClinicConfig {
  recoveryRate: number;
  systemCost: number;
  defaultPatients: number;
  defaultTicket: number;
  defaultMissedRate: number;
}

/**
 * ROI state machine states
 */
export type ROIState = 
  | "idle"           // No data entered
  | "editing"        // User is entering data
  | "ready"          // Calculation complete
  | "accepting"      // Showing accept modal
  | "accepted";      // User accepted, can navigate

/**
 * ROI hook return type
 */
export interface UseROIReturn {
  // State
  state: ROIState;
  inputs: ROIInputs;
  results: ROIResults | null;
  hasData: boolean;
  hasAcceptedData: boolean;
  
  // Actions
  setClinicType: (type: ClinicType | null) => void;
  setMonthlyPatients: (value: number) => void;
  setAvgTicket: (value: number) => void;
  setMissedRate: (value: number) => void;
  acceptData: () => void;
  clearData: () => void;
  
  // Getters
  getROIData: () => ROIData | null;
}
