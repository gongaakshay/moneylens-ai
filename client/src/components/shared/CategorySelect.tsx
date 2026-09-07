import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryIcon } from "@/components/Tables/CategoryIcon";

interface CategorySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  categories: readonly string[];
  type: "income" | "expense";
  placeholder?: string;
  className?: string;
}

export function CategorySelect({
  value,
  onValueChange,
  categories,
  type,
  placeholder = "Select a category",
  className = "",
}: CategorySelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={`bg-slate-800 border-slate-700 text-white ${className}`}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-slate-800 border-slate-700">
        {categories.map((cat) => (
          <SelectItem
            key={cat}
            value={cat}
            className="text-white focus:bg-slate-700 focus:text-white"
          >
            <div className="flex items-center gap-2">
              <CategoryIcon category={cat} type={type} className="w-4 h-4" />
              <span>{cat}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

