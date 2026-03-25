/**
 * ROI Data Storage
 * Ported from legacy: /hooks/use-roi-data.ts
 * 
 * MUST use exact same localStorage key and shape as legacy
 */

"use client";

import { useCallback, useState } from "react";
import type { ROIData } from "./roi.types";
import { STORAGE_KEYS } from "@/constants/app";
import { getItem, setItem, removeItem } from "@/lib/storage";

/**
 * Hook for ROI data persistence
 * Exact port of legacy: /hooks/use-roi-data.ts
 */
export function useROIData() {
  const [roiData, setROIData] = useState<ROIData | null>(() => {
    return getItem<ROIData>(STORAGE_KEYS.ROI_DATA);
  });

  const saveROIData = useCallback((data: ROIData, skipAcceptance = false) => {
    const dataWithTimestamp: ROIData = {
      ...data,
      timestamp: Date.now(),
      accepted: skipAcceptance ? data.accepted : false,
    };
    setItem(STORAGE_KEYS.ROI_DATA, dataWithTimestamp);
    setROIData(dataWithTimestamp);
  }, []);

  const acceptROIData = useCallback(() => {
    if (roiData) {
      const acceptedData: ROIData = {
        ...roiData,
        accepted: true,
      };
      setItem(STORAGE_KEYS.ROI_DATA, acceptedData);
      setROIData(acceptedData);
    }
  }, [roiData]);

  const clearROIData = useCallback(() => {
    removeItem(STORAGE_KEYS.ROI_DATA);
    setROIData(null);
  }, []);

  return {
    roiData,
    saveROIData,
    clearROIData,
    acceptROIData,
    hasROIData: !!roiData,
    hasAcceptedROIData: !!roiData && roiData.accepted === true,
  };
}
