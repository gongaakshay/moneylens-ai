import { LucideIcon } from 'lucide-react';
import { getIncomeCategoryIcon, getExpenseCategoryIcon } from '@/utils/categoryIcons';

interface CategoryIconProps {
  category: string;
  type: 'income' | 'expense';
  className?: string;
}

export function CategoryIcon({ category, type, className = '' }: CategoryIconProps) {
  const Icon: LucideIcon = type === 'income' 
    ? getIncomeCategoryIcon(category)
    : getExpenseCategoryIcon(category);
  
  const colorClass = type === 'income' 
    ? 'text-emerald-400/80' 
    : 'text-red-400/80';
  
  return (
    <div className={`p-2 rounded-lg ${type === 'income' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
      <Icon className={`w-4 h-4 ${colorClass} ${className}`} />
    </div>
  );
}

