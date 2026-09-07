export interface User {
  _id: string;
  username: string;
  password: string;
  name?: string;
  currency?: 'USD' | 'INR';
}

export interface IncomeEntry {
  id: string;
  amount: number;
  note: string;
}

export interface IncomeItem {
  id: string;
  category: string;
  amount: number;
  comment: string;
  entries?: IncomeEntry[];
}

export interface ExpenseEntry {
  id: string;
  amount: number;
  note: string;
  tag?: 'need' | 'want' | 'neutral';
}

export interface ExpenseItem {
  id: string;
  category: string;
  amount: number;
  comment: string;
  entries?: ExpenseEntry[];
}

export interface MonthData {
  _id: string;
  userId: string;
  monthName: string;
  year: number;
  month: number;
  income: IncomeItem[];
  expenses: ExpenseItem[];
  totalIncome: number;
  totalExpense: number;
  carryForward: number;
}

export interface RecurringExpense {
  _id: string;
  userId: string;
  category: string;
  amount: number;
  note: string;
  tag: 'need' | 'want' | 'neutral';
  createdAt: string;
}

export interface AppData {
  users: User[];
  months: MonthData[];
  recurringExpenses: RecurringExpense[];
}

export interface AuthUser {
  id: string;
  username: string;
  name?: string;
  currency?: 'USD' | 'INR';
}

// AI Insights Types
export interface FinancialInsight {
  id: string;
  title: string;
  description: string;
  category: 'spending' | 'budget' | 'savings' | 'prediction' | 'health';
  severity?: 'info' | 'warning' | 'success' | 'critical';
  actionable?: boolean;
}

export interface OverviewInsights {
  financialHealthScore: number;
  summary: string;
  insights: FinancialInsight[];
  predictions: string[];
  generatedAt: string;
}

export interface MonthlyInsights {
  monthSummary: string;
  insights: FinancialInsight[];
  comparisons: {
    previousMonth?: string;
    changes: Array<{
      category: string;
      change: number;
      direction: 'up' | 'down';
    }>;
  };
  recommendations: string[];
  generatedAt: string;
}
