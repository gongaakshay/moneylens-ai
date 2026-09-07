import { useState, useCallback, useEffect } from "react";
import { MonthData } from "@/types";
import * as api from "@/services/api";

export function useMonthData(userId: string | undefined) {
  const [months, setMonths] = useState<MonthData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.fetchMonthsData(userId);
      setMonths(data);
    } catch (err) {
      setError("Failed to fetch data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      refreshData();
    }
  }, [userId, refreshData]);

  const createMonth = useCallback(
    async (year: number, month: number) => {
      if (!userId) return;
      try {
        const newMonth = await api.createMonth(userId, year, month);
        setMonths((prev) => [...prev, newMonth]);
      } catch (err: any) {
        const errorMsg = err.response?.data?.error || "Failed to create month";
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    },
    [userId]
  );

  const deleteMonth = useCallback(
    async (monthId: string) => {
      if (!userId) return;
      try {
        await api.deleteMonth(monthId, userId);
        setMonths((prev) => prev.filter((m) => m._id !== monthId));
      } catch (err: any) {
        const errorMsg = err.response?.data?.error || "Failed to delete month";
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    },
    [userId]
  );

  const updateMonthInState = useCallback((updatedMonth: MonthData) => {
    setMonths((prev) =>
      prev.map((m) => (m._id === updatedMonth._id ? updatedMonth : m))
    );
  }, []);

  return {
    months,
    isLoading,
    error,
    refreshData,
    createMonth,
    deleteMonth,
    updateMonthInState,
    setMonths,
  };
}

