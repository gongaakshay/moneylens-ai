import { useState, useCallback, useEffect } from "react";
import { RecurringExpense } from "@/types";
import * as api from "@/services/api";

export function useRecurringExpenses(userId: string | undefined) {
  const [recurringExpenses, setRecurringExpenses] = useState<
    RecurringExpense[]
  >([]);

  const fetchRecurringExpenses = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await api.fetchRecurringExpenses(userId);
      setRecurringExpenses(data);
    } catch (err) {
      console.error("Failed to fetch recurring expenses", err);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchRecurringExpenses();
    }
  }, [userId, fetchRecurringExpenses]);

  const createRecurringExpense = useCallback(
    async (
      category: string,
      amount: number,
      note: string,
      tag: "need" | "want" | "neutral"
    ) => {
      if (!userId) return;
      const newRecurring = await api.createRecurringExpense(
        userId,
        category,
        amount,
        note,
        tag
      );
      setRecurringExpenses((prev) => [...prev, newRecurring]);
    },
    [userId]
  );

  const deleteRecurringExpense = useCallback(async (id: string) => {
    await api.deleteRecurringExpense(id);
    setRecurringExpenses((prev) => prev.filter((r) => r._id !== id));
  }, []);

  const updateRecurringExpense = useCallback(
    async (
      id: string,
      updates: {
        category?: string;
        amount?: number;
        note?: string;
        tag?: string;
      }
    ) => {
      const updated = await api.updateRecurringExpense(id, updates);
      setRecurringExpenses((prev) =>
        prev.map((r) => (r._id === id ? updated : r))
      );
    },
    []
  );

  return {
    recurringExpenses,
    fetchRecurringExpenses,
    createRecurringExpense,
    deleteRecurringExpense,
    updateRecurringExpense,
  };
}

