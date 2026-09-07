import { createContext, useContext, ReactNode } from "react";
import { AuthUser, MonthData, RecurringExpense } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useMonthData } from "@/hooks/useMonthData";
import { useIncome } from "@/hooks/useIncome";
import { useExpense } from "@/hooks/useExpense";
import { useRecurringExpenses } from "@/hooks/useRecurringExpenses";

interface AppContextType {
  user: AuthUser | null;
  months: MonthData[];
  isLoading: boolean;
  error: string | null;
  currency: "USD" | "INR";
  recurringExpenses: RecurringExpense[];
  login: (username: string, password: string) => Promise<boolean>;
  register: (
    username: string,
    password: string,
    name?: string,
    securityQuestion?: string,
    securityAnswer?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (name?: string, currency?: "USD" | "INR") => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  refreshData: () => Promise<void>;
  addIncome: (
    monthId: string,
    category: string,
    amount: number,
    comment: string
  ) => Promise<void>;
  addIncomeEntry: (
    monthId: string,
    category: string,
    amount: number,
    note: string
  ) => Promise<void>;
  editIncome: (
    incomeId: string,
    monthId: string,
    category: string,
    amount: number,
    comment: string
  ) => Promise<void>;
  editIncomeEntry: (
    entryId: string,
    monthId: string,
    amount: number,
    note: string
  ) => Promise<void>;
  deleteIncome: (incomeId: string, monthId: string) => Promise<void>;
  deleteIncomeEntry: (entryId: string, monthId: string) => Promise<void>;
  addExpense: (
    monthId: string,
    category: string,
    amount: number,
    comment: string
  ) => Promise<void>;
  addExpenseEntry: (
    monthId: string,
    category: string,
    amount: number,
    note: string,
    tag?: "need" | "want" | "neutral"
  ) => Promise<void>;
  editExpense: (
    expenseId: string,
    monthId: string,
    category: string,
    amount: number,
    comment: string
  ) => Promise<void>;
  editExpenseEntry: (
    entryId: string,
    monthId: string,
    amount: number,
    note: string,
    tag?: "need" | "want" | "neutral"
  ) => Promise<void>;
  deleteExpense: (expenseId: string, monthId: string) => Promise<void>;
  deleteExpenseEntry: (entryId: string, monthId: string) => Promise<void>;
  createMonth: (year: number, month: number) => Promise<void>;
  deleteMonth: (monthId: string) => Promise<void>;
  fetchRecurringExpenses: () => Promise<void>;
  createRecurringExpense: (
    category: string,
    amount: number,
    note: string,
    tag: "need" | "want" | "neutral"
  ) => Promise<void>;
  deleteRecurringExpense: (id: string) => Promise<void>;
  updateRecurringExpense: (
    id: string,
    updates: { category?: string; amount?: number; note?: string; tag?: string }
  ) => Promise<void>;
  setSecurityQuestion: (question: string, answer: string) => Promise<void>;
  updateSecurityQuestion: (
    currentPassword: string,
    question: string,
    answer: string
  ) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading, error: authError, login, register, logout, setUser } = useAuth();
  
  const currency = user?.currency || "INR";
  
  const {
    months,
    isLoading: dataLoading,
    error: dataError,
    refreshData,
    createMonth,
    deleteMonth,
    updateMonthInState,
  } = useMonthData(user?.id);
  
  const incomeOperations = useIncome(updateMonthInState);
  const expenseOperations = useExpense(updateMonthInState);
  
  const {
    recurringExpenses,
    fetchRecurringExpenses,
    createRecurringExpense,
    deleteRecurringExpense,
    updateRecurringExpense,
  } = useRecurringExpenses(user?.id);
  
  const profileOperations = useProfile(user, setUser);

  const isLoading = authLoading || dataLoading;
  const error = authError || dataError;

  const contextValue: AppContextType = {
    user,
    months,
    isLoading,
    error,
    currency,
    recurringExpenses,
    login,
    register,
    logout,
    updateProfile: profileOperations.updateProfile,
    changePassword: profileOperations.changePassword,
    deleteAccount: (password: string) =>
      profileOperations.deleteAccount(password, logout),
    refreshData,
    ...incomeOperations,
    ...expenseOperations,
    createMonth,
    deleteMonth,
    fetchRecurringExpenses,
    createRecurringExpense,
    deleteRecurringExpense,
    updateRecurringExpense,
    setSecurityQuestion: profileOperations.setSecurityQuestion,
    updateSecurityQuestion: profileOperations.updateSecurityQuestion,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
