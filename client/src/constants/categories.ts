export const INCOME_CATEGORIES = [
  "Salary",
  "Carry Forward",
  "Bonus",
  "Freelance",
  "Investment Returns",
  "Rental Income",
  "Others",
] as const;

export const EXPENSE_CATEGORIES = [
  "Rent",
  "EMIs",
  "Groceries",
  "Shopping",
  "Food & Drinks",
  "Credit Card",
  "Bills & Utility",
  "Transportation",
  "Medical",
  "Personal Care",
  "Entertainment",
  "Insurance",
  "Investment",
  "Miscellaneous",
] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

