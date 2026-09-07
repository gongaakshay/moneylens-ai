import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface TableControlsProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  searchClassName?: string;
}

export function TableControls({
  searchQuery,
  onSearchChange,
  placeholder = "Search...",
  hasActiveFilters,
  onClearFilters,
  searchClassName = "",
}: TableControlsProps) {
  return (
    <div className="flex items-center gap-2">
      {hasActiveFilters && (
        <Button
          onClick={onClearFilters}
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white hover:bg-slate-700/50 h-9"
        >
          <X className="w-4 h-4 mr-1" />
          Clear Filters
        </Button>
      )}
      <div className={`relative flex-1 ${searchClassName}`}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 transition-all"
        />
      </div>
    </div>
  );
}

