import { useCallback } from "react";
import * as api from "@/services/api";
import { MonthData } from "@/types";

export function useExpense(updateMonthInState: (month: MonthData) => void) {
  const addExpense = useCallback(
    async (
      monthId: string,
      category: string,
      amount: number,
      comment: string
    ) => {
      const updatedMonth = await api.addExpense(
        monthId,
        category,
        amount,
        comment
      );
      updateMonthInState(updatedMonth);
    },
    [updateMonthInState]
  );

  const addExpenseEntry = useCallback(
    async (
      monthId: string,
      category: string,
      amount: number,
      note: string,
      tag?: "need" | "want" | "neutral"
    ) => {
      const updatedMonth = await api.addExpenseEntry(
        monthId,
        category,
        amount,
        note,
        tag
      );
      updateMonthInState(updatedMonth);
    },
    [updateMonthInState]
  );

  const editExpense = useCallback(
    async (
      expenseId: string,
      monthId: string,
      category: string,
      amount: number,
      comment: string
    ) => {
      const updatedMonth = await api.editExpense(
        expenseId,
        monthId,
        category,
        amount,
        comment
      );
      updateMonthInState(updatedMonth);
    },
    [updateMonthInState]
  );

  const deleteExpense = useCallback(
    async (expenseId: string, monthId: string) => {
      const updatedMonth = await api.deleteExpense(expenseId, monthId);
      updateMonthInState(updatedMonth);
    },
    [updateMonthInState]
  );

  const editExpenseEntry = useCallback(
    async (
      entryId: string,
      monthId: string,
      amount: number,
      note: string,
      tag?: "need" | "want" | "neutral"
    ) => {
      const updatedMonth = await api.editExpenseEntry(
        entryId,
        monthId,
        amount,
        note,
        tag
      );
      updateMonthInState(updatedMonth);
    },
    [updateMonthInState]
  );

  const deleteExpenseEntry = useCallback(
    async (entryId: string, monthId: string) => {
      const updatedMonth = await api.deleteExpenseEntry(entryId, monthId);
      updateMonthInState(updatedMonth);
    },
    [updateMonthInState]
  );

  return {
    addExpense,
    addExpenseEntry,
    editExpense,
    deleteExpense,
    editExpenseEntry,
    deleteExpenseEntry,
  };
}

