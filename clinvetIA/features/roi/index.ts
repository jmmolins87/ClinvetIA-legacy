/**
 * ROI Feature - Public API
 */

export { useRoi } from "./useRoi";
export { useROIData } from "./roi.storage";
export { calculateROI, getClinicConfig, getDefaultInputs, CLINIC_CONFIGS } from "./roi.calc";
export type { 
  ClinicType, 
  ROIInputs, 
  ROIResults, 
  ROIData, 
  ROIState, 
  ClinicConfig,
  UseROIReturn,
} from "./roi.types";
