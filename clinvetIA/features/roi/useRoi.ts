/**
 * ROI Calculator Hook (State Machine)
 * Combines calculation logic + storage persistence
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ClinicType, ROIInputs, ROIResults, ROIState, UseROIReturn, ROIData } from "./roi.types";
import { calculateROI, getDefaultInputs } from "./roi.calc";
import { useROIData } from "./roi.storage";

export function useRoi(): UseROIReturn {
  const { roiData, saveROIData, acceptROIData: acceptStoredData, clearROIData, hasAcceptedROIData } = useROIData();
  
  // Inputs (start empty, no preselection)
  const [inputs, setInputs] = useState<ROIInputs>({
    clinicType: null,
    monthlyPatients: 0,
    avgTicket: 0,
    missedRate: 0,
  });
  
  // Track if user has interacted
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Calculate results (derived state, no useState needed)
  const results = useMemo(() => {
    if (!inputs.clinicType) return null;
    return calculateROI(inputs);
  }, [inputs]);
  
  // Determine state machine state (derived)
  const state: ROIState = useMemo(() => {
    if (hasAcceptedROIData) return "accepted";
    if (!hasInteracted) return "idle";
    if (results) return "ready";
    return "editing";
  }, [hasInteracted, results, hasAcceptedROIData]);
  
  // Auto-save to storage when inputs/results change
  useEffect(() => {
    if (!hasInteracted || !results || !inputs.clinicType) return;
    
    const data: ROIData = {
      clinicType: inputs.clinicType,
      monthlyPatients: inputs.monthlyPatients,
      avgTicket: inputs.avgTicket,
      missedRate: inputs.missedRate,
      monthlyRevenue: results.monthlyRevenue,
      yearlyRevenue: results.yearlyRevenue,
      roi: results.roi,
      breakEvenDays: results.breakEvenDays,
      timestamp: Date.now(),
    };
    
    saveROIData(data, true); // Skip acceptance flag during auto-save
  }, [inputs, results, hasInteracted, saveROIData]);
  
  // Set clinic type
  const setClinicType = useCallback((type: ClinicType | null) => {
    setHasInteracted(true);
    
    if (!type) {
      setInputs({
        clinicType: null,
        monthlyPatients: 0,
        avgTicket: 0,
        missedRate: 0,
      });
      return;
    }
    
    // Load defaults for this clinic type
    const defaults = getDefaultInputs(type);
    setInputs({
      clinicType: type,
      ...defaults,
    });
  }, []);
  
  // Set individual inputs
  const setMonthlyPatients = useCallback((value: number) => {
    setHasInteracted(true);
    setInputs((prev) => ({ ...prev, monthlyPatients: value }));
  }, []);
  
  const setAvgTicket = useCallback((value: number) => {
    setHasInteracted(true);
    setInputs((prev) => ({ ...prev, avgTicket: value }));
  }, []);
  
  const setMissedRate = useCallback((value: number) => {
    setHasInteracted(true);
    setInputs((prev) => ({ ...prev, missedRate: value }));
  }, []);
  
  // Accept data (for gating)
  const acceptData = useCallback(() => {
    acceptStoredData();
  }, [acceptStoredData]);
  
  // Clear all data
  const clearData = useCallback(() => {
    clearROIData();
    setInputs({
      clinicType: null,
      monthlyPatients: 0,
      avgTicket: 0,
      missedRate: 0,
    });
    setHasInteracted(false);
  }, [clearROIData]);
  
  // Get current ROI data (for export/gating)
  const getROIData = useCallback((): ROIData | null => {
    return roiData;
  }, [roiData]);
  
  return {
    state,
    inputs,
    results,
    hasData: hasInteracted && !!results,
    hasAcceptedData: hasAcceptedROIData,
    
    setClinicType,
    setMonthlyPatients,
    setAvgTicket,
    setMissedRate,
    acceptData,
    clearData,
    
    getROIData,
  };
}
