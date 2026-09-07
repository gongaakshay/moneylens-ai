import { IncomeItem, ExpenseItem } from '@/types';

export function calculateTotalIncome(income: IncomeItem[]): number {
  return income.reduce((sum, item) => sum + item.amount, 0);
}

export function calculateTotalExpense(expenses: ExpenseItem[]): number {
  return expenses.reduce((sum, item) => sum + item.amount, 0);
}

export function calculateCarryForward(income: IncomeItem[], expenses: ExpenseItem[]): number {
  return calculateTotalIncome(income) - calculateTotalExpense(expenses);
}

export function formatCurrency(amount: number, currency: 'USD' | 'INR' = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('en-IN').format(amount);
}

export function getCategoryColor(index: number): string {
  const colors = [
    'hsl(221, 83%, 53%)',   // Primary blue
    'hsl(142, 76%, 36%)',   // Green
    'hsl(0, 84%, 60%)',     // Red
    'hsl(38, 92%, 50%)',    // Orange
    'hsl(262, 83%, 58%)',   // Purple
    'hsl(186, 100%, 42%)',  // Cyan
    'hsl(330, 81%, 60%)',   // Pink
    'hsl(45, 93%, 47%)',    // Yellow
    'hsl(199, 89%, 48%)',   // Light blue
    'hsl(12, 76%, 61%)',    // Coral
    'hsl(173, 58%, 39%)',   // Teal
    'hsl(280, 65%, 60%)',   // Violet
  ];
  return colors[index % colors.length];
}

