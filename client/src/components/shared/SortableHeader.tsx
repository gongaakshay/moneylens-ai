import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface SortableHeaderProps {
  label: string;
  column: string;
  sortBy: string | null;
  sortOrder: "asc" | "desc";
  onSort: (column: string) => void;
  className?: string;
}

export function SortableHeader({
  label,
  column,
  sortBy,
  sortOrder,
  onSort,
  className = "",
}: SortableHeaderProps) {
  const getSortIcon = () => {
    if (sortBy !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 ml-1 opacity-50" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 ml-1" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 ml-1" />
    );
  };

  return (
    <div
      className={`flex items-center cursor-pointer ${className}`}
      onClick={() => onSort(column)}
    >
      {label}
      {getSortIcon()}
    </div>
  );
}

