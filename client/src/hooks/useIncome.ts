import { useCallback } from "react";
import * as api from "@/services/api";
import { MonthData } from "@/types";

export function useIncome(updateMonthInState: (month: MonthData) => void) {
  const addIncome = useCallback(
    async (
      monthId: string,
      category: string,
      amount: number,
      comment: string
    ) => {
      const updatedMonth = await api.addIncome(
        monthId,
        category,
        amount,
        comment
      );
      updateMonthInState(updatedMonth);
    },
    [updateMonthInState]
  );

  const addIncomeEntry = useCallback(
    async (monthId: string, category: string, amount: number, note: string) => {
      const updatedMonth = await api.addIncomeEntry(
        monthId,
        category,
        amount,
        note
      );
      updateMonthInState(updatedMonth);
    },
    [updateMonthInState]
  );

  const editIncome = useCallback(
    async (
      incomeId: string,
      monthId: string,
      category: string,
      amount: number,
      comment: string
    ) => {
      const updatedMonth = await api.editIncome(
        incomeId,
        monthId,
        category,
        amount,
        comment
      );
      updateMonthInState(updatedMonth);
    },
    [updateMonthInState]
  );

  const deleteIncome = useCallback(
    async (incomeId: string, monthId: string) => {
      const updatedMonth = await api.deleteIncome(incomeId, monthId);
      updateMonthInState(updatedMonth);
    },
    [updateMonthInState]
  );

  const editIncomeEntry = useCallback(
    async (entryId: string, monthId: string, amount: number, note: string) => {
      const updatedMonth = await api.editIncomeEntry(
        entryId,
        monthId,
        amount,
        note
      );
      updateMonthInState(updatedMonth);
    },
    [updateMonthInState]
  );

  const deleteIncomeEntry = useCallback(
    async (entryId: string, monthId: string) => {
      const updatedMonth = await api.deleteIncomeEntry(entryId, monthId);
      updateMonthInState(updatedMonth);
    },
    [updateMonthInState]
  );

  return {
    addIncome,
    addIncomeEntry,
    editIncome,
    deleteIncome,
    editIncomeEntry,
    deleteIncomeEntry,
  };
}

