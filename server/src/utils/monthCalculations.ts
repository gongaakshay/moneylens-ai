import { IMonthData } from '../models/MonthData';

export function recalculateMonthTotals(month: IMonthData): void {
  month.totalIncome = (month.income || []).reduce((sum, item) => sum + item.amount, 0);
  month.totalExpense = (month.expenses || []).reduce((sum, item) => sum + item.amount, 0);
  month.carryForward = month.totalIncome - month.totalExpense;
}

