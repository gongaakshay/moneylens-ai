import axios from "axios";
import { AuthUser, MonthData, RecurringExpense, OverviewInsights, MonthlyInsights } from "@/types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth
export async function login(
  username: string,
  password: string
): Promise<AuthUser> {
  const response = await api.post<AuthUser>("/auth/login", {
    username,
    password,
  });
  return response.data;
}

export async function register(
  username: string,
  password: string,
  name?: string,
  securityQuestion?: string,
  securityAnswer?: string
): Promise<AuthUser> {
  const response = await api.post<AuthUser>("/auth/register", {
    username,
    password,
    name,
    securityQuestion,
    securityAnswer,
  });
  return response.data;
}

export async function updateProfile(
  userId: string,
  name?: string,
  currency?: "USD" | "INR"
): Promise<AuthUser> {
  const response = await api.put<AuthUser>("/auth/profile", {
    userId,
    name,
    currency,
  });
  return response.data;
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>("/auth/change-password", {
    userId,
    currentPassword,
    newPassword,
  });
  return response.data;
}

export async function deleteAccount(
  userId: string,
  password: string
): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>("/auth/account", {
    data: { userId, password },
  });
  return response.data;
}

// Security Questions
export async function setSecurityQuestion(
  userId: string,
  question: string,
  answer: string
): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>("/auth/security-question", {
    userId,
    question,
    answer,
  });
  return response.data;
}

export async function updateSecurityQuestion(
  userId: string,
  currentPassword: string,
  question: string,
  answer: string
): Promise<{ message: string }> {
  const response = await api.put<{ message: string }>("/auth/security-question", {
    userId,
    currentPassword,
    question,
    answer,
  });
  return response.data;
}

export async function getSecurityQuestion(
  username: string
): Promise<{ question: string | null; hasSecurityQuestion: boolean; isAdmin: boolean }> {
  const response = await api.get<{ question: string | null; hasSecurityQuestion: boolean; isAdmin: boolean }>(
    `/auth/security-question/${username}`
  );
  return response.data;
}

export async function verifySecurityAnswer(
  username: string,
  securityAnswer: string
): Promise<{ verified: boolean }> {
  const response = await api.post<{ verified: boolean }>("/auth/verify-security-answer", {
    username,
    securityAnswer,
  });
  return response.data;
}

export async function resetPasswordWithSecurity(
  username: string,
  securityAnswer: string,
  newPassword: string
): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>("/auth/reset-password-security", {
    username,
    securityAnswer,
    newPassword,
  });
  return response.data;
}

// Data
export async function fetchMonthsData(userId: string): Promise<MonthData[]> {
  const response = await api.get<MonthData[]>("/data", {
    params: { userId },
  });
  return response.data;
}

export async function fetchMonth(monthId: string): Promise<MonthData> {
  const response = await api.get<MonthData>(`/data/month/${monthId}`);
  return response.data;
}

export async function createMonth(
  userId: string,
  year: number,
  month: number
): Promise<MonthData> {
  const response = await api.post<MonthData>("/data/month", {
    userId,
    year,
    month,
  });
  return response.data;
}

export async function deleteMonth(
  monthId: string,
  userId: string
): Promise<{ success: boolean; monthName: string }> {
  const response = await api.delete<{ success: boolean; monthName: string }>(
    `/data/month/${monthId}`,
    {
      params: { userId },
    }
  );
  return response.data;
}

// Income
export async function addIncome(
  monthId: string,
  category: string,
  amount: number,
  comment: string
): Promise<MonthData> {
  const response = await api.post<MonthData>("/data/income", {
    monthId,
    category,
    amount,
    comment,
  });
  return response.data;
}

export async function addIncomeEntry(
  monthId: string,
  category: string,
  amount: number,
  note: string
): Promise<MonthData> {
  const response = await api.post<MonthData>("/data/income/entry", {
    monthId,
    category,
    amount,
    note,
  });
  return response.data;
}

export async function editIncome(
  incomeId: string,
  monthId: string,
  category: string,
  amount: number,
  comment: string
): Promise<MonthData> {
  const response = await api.put<MonthData>(`/data/income/${incomeId}`, {
    monthId,
    category,
    amount,
    comment,
  });
  return response.data;
}

export async function deleteIncome(
  incomeId: string,
  monthId: string
): Promise<MonthData> {
  const response = await api.delete<MonthData>(`/data/income/${incomeId}`, {
    data: { monthId },
  });
  return response.data;
}

// Edit income entry
export async function editIncomeEntry(
  entryId: string,
  monthId: string,
  amount: number,
  note: string
): Promise<MonthData> {
  const response = await api.put<MonthData>(`/data/income/entry/${entryId}`, {
    monthId,
    amount,
    note,
  });
  return response.data;
}

// Delete income entry
export async function deleteIncomeEntry(
  entryId: string,
  monthId: string
): Promise<MonthData> {
  const response = await api.delete<MonthData>(
    `/data/income/entry/${entryId}`,
    {
      data: { monthId },
    }
  );
  return response.data;
}

// Expense
export async function addExpense(
  monthId: string,
  category: string,
  amount: number,
  comment: string
): Promise<MonthData> {
  const response = await api.post<MonthData>("/data/expense", {
    monthId,
    category,
    amount,
    comment,
  });
  return response.data;
}

export async function addExpenseEntry(
  monthId: string,
  category: string,
  amount: number,
  note: string,
  tag?: "need" | "want" | "neutral"
): Promise<MonthData> {
  const response = await api.post<MonthData>("/data/expense/entry", {
    monthId,
    category,
    amount,
    note,
    tag,
  });
  return response.data;
}

export async function editExpense(
  expenseId: string,
  monthId: string,
  category: string,
  amount: number,
  comment: string
): Promise<MonthData> {
  const response = await api.put<MonthData>(`/data/expense/${expenseId}`, {
    monthId,
    category,
    amount,
    comment,
  });
  return response.data;
}

export async function deleteExpense(
  expenseId: string,
  monthId: string
): Promise<MonthData> {
  const response = await api.delete<MonthData>(`/data/expense/${expenseId}`, {
    data: { monthId },
  });
  return response.data;
}

// Edit expense entry
export async function editExpenseEntry(
  entryId: string,
  monthId: string,
  amount: number,
  note: string,
  tag?: "need" | "want" | "neutral"
): Promise<MonthData> {
  const response = await api.put<MonthData>(`/data/expense/entry/${entryId}`, {
    monthId,
    amount,
    note,
    tag,
  });
  return response.data;
}

// Delete expense entry
export async function deleteExpenseEntry(
  entryId: string,
  monthId: string
): Promise<MonthData> {
  const response = await api.delete<MonthData>(
    `/data/expense/entry/${entryId}`,
    {
      data: { monthId },
    }
  );
  return response.data;
}

// Recurring Expenses
export async function fetchRecurringExpenses(
  userId: string
): Promise<RecurringExpense[]> {
  const response = await api.get<RecurringExpense[]>("/recurring", {
    params: { userId },
  });
  return response.data;
}

export async function createRecurringExpense(
  userId: string,
  category: string,
  amount: number,
  note: string,
  tag: "need" | "want" | "neutral"
): Promise<RecurringExpense> {
  const response = await api.post<RecurringExpense>("/recurring", {
    userId,
    category,
    amount,
    note,
    tag,
  });
  return response.data;
}

export async function deleteRecurringExpense(id: string): Promise<void> {
  await api.delete(`/recurring/${id}`);
}

export async function updateRecurringExpense(
  id: string,
  updates: { category?: string; amount?: number; note?: string; tag?: string }
): Promise<RecurringExpense> {
  const response = await api.put(`/recurring/${id}`, updates);
  return response.data;
}

// AI Insights
export async function fetchOverviewInsights(
  userId: string
): Promise<OverviewInsights> {
  const response = await api.get<OverviewInsights>("/insights/overview", {
    params: { userId },
  });
  return response.data;
}

export async function fetchMonthlyInsights(
  userId: string,
  monthId: string
): Promise<MonthlyInsights> {
  const response = await api.get<MonthlyInsights>(
    `/insights/month/${monthId}`,
    {
      params: { userId },
    }
  );
  return response.data;
}

export async function regenerateOverviewInsights(
  userId: string
): Promise<OverviewInsights> {
  const response = await api.post<OverviewInsights>(
    "/insights/regenerate/overview",
    { userId }
  );
  return response.data;
}

export async function regenerateMonthlyInsights(
  userId: string,
  monthId: string
): Promise<MonthlyInsights> {
  const response = await api.post<MonthlyInsights>(
    `/insights/regenerate/month/${monthId}`,
    { userId }
  );
  return response.data;
}
