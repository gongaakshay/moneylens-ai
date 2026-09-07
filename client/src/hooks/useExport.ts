import { useState, useCallback } from "react";
import { MonthData } from "@/types";
import { exportMonthToExcel, exportYearToExcel } from "@/utils/excelExport";
import { toast } from "sonner";

export function useExport(currency: "USD" | "INR") {
  const [isExporting, setIsExporting] = useState(false);

  const exportMonth = useCallback(
    async (month: MonthData) => {
      setIsExporting(true);
      try {
        const filename = await exportMonthToExcel(month, currency);
        toast.success(`Excel file "${filename}" downloaded successfully`);
      } catch (err: any) {
        toast.error(err.message || "Failed to export data");
      } finally {
        setIsExporting(false);
      }
    },
    [currency]
  );

  const exportYear = useCallback(
    async (yearMonths: MonthData[], year: number) => {
      if (!yearMonths || yearMonths.length === 0) {
        toast.error("No data to export for this year");
        return;
      }

      setIsExporting(true);
      try {
        const filename = await exportYearToExcel(yearMonths, year, currency);
        toast.success(`Excel file "${filename}" downloaded successfully`);
      } catch (err: any) {
        toast.error(err.message || "Failed to export data");
      } finally {
        setIsExporting(false);
      }
    },
    [currency]
  );

  return {
    isExporting,
    exportMonth,
    exportYear,
  };
}

