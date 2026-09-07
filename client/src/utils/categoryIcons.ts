import {
  Wallet,
  TrendingUp,
  Gift,
  Briefcase,
  PiggyBank,
  Home,
  DollarSign,
  CreditCard,
  ShoppingCart,
  ShoppingBag,
  Utensils,
  Zap,
  Car,
  Heart,
  Sparkles,
  Shield,
  TrendingDown,
  Package,
  Film,
  LucideIcon,
} from 'lucide-react';

export const INCOME_CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Salary': Briefcase,
  'Carry Forward': Wallet,
  'Bonus': Gift,
  'Freelance': TrendingUp,
  'Investment Returns': PiggyBank,
  'Rental Income': Home,
  'Others': DollarSign,
};

export const EXPENSE_CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Rent': Home,
  'EMIs': CreditCard,
  'Groceries': ShoppingCart,
  'Shopping': ShoppingBag,
  'Food & Drinks': Utensils,
  'Credit Card': CreditCard,
  'Bills & Utility': Zap,
  'Transportation': Car,
  'Medical': Heart,
  'Personal Care': Sparkles,
  'Entertainment': Film,
  'Insurance': Shield,
  'Investment': TrendingDown,
  'Miscellaneous': Package,
};

export function getIncomeCategoryIcon(category: string): LucideIcon {
  return INCOME_CATEGORY_ICONS[category] || DollarSign;
}

export function getExpenseCategoryIcon(category: string): LucideIcon {
  return EXPENSE_CATEGORY_ICONS[category] || Package;
}

