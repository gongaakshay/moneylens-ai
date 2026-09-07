import { useState, useMemo, useCallback } from "react";

export type SortOrder = "asc" | "desc";

interface UseTableControlsOptions<T> {
  data: T[];
  searchFields?: (keyof T)[];
  initialSortBy?: keyof T;
  initialSortOrder?: SortOrder;
}

export function useTableControls<T extends Record<string, any>>({
  data,
  searchFields = [],
  initialSortBy,
  initialSortOrder = "asc",
}: UseTableControlsOptions<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<keyof T | null>(initialSortBy || null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder);
  const [filters, setFilters] = useState<Map<string, Set<any>>>(new Map());

  const handleSort = useCallback((column: keyof T) => {
    setSortBy((prev) => {
      if (prev === column) {
        setSortOrder((order) => {
          if (order === "asc") return "desc";
          // Reset sorting
          setSortBy(null);
          return "asc";
        });
      } else {
        setSortOrder("asc");
      }
      return column;
    });
  }, []);

  const toggleFilter = useCallback((filterKey: string, value: any) => {
    setFilters((prev) => {
      const newFilters = new Map(prev);
      const filterSet = newFilters.get(filterKey) || new Set();
      
      if (filterSet.has(value)) {
        filterSet.delete(value);
      } else {
        filterSet.add(value);
      }
      
      if (filterSet.size === 0) {
        newFilters.delete(filterKey);
      } else {
        newFilters.set(filterKey, filterSet);
      }
      
      return newFilters;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSortBy(null);
    setSortOrder("asc");
    setFilters(new Map());
  }, []);

  const processedData = useMemo(() => {
    let filtered = [...data];

    // Apply search
    if (searchQuery.trim() && searchFields.length > 0) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) =>
        searchFields.some((field) => {
          const value = item[field];
          if (typeof value === "string") {
            return value.toLowerCase().includes(query);
          }
          if (Array.isArray(value)) {
            return value.some((v: any) =>
              typeof v === "string"
                ? v.toLowerCase().includes(query)
                : v.note?.toLowerCase().includes(query)
            );
          }
          return false;
        })
      );
    }

    // Apply filters
    if (filters.size > 0) {
      filtered = filtered.filter((item) => {
        for (const [filterKey, filterValues] of filters.entries()) {
          const itemValue = item[filterKey];
          
          // If the item has entries array, check if any entry matches
          if (Array.isArray(item.entries)) {
            const hasMatch = item.entries.some((entry: any) =>
              filterValues.has(entry[filterKey] || entry.tag || "neutral")
            );
            if (!hasMatch) return false;
          } else if (!filterValues.has(itemValue)) {
            return false;
          }
        }
        return true;
      });
    }

    // Apply sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        
        let compareValue = 0;
        if (typeof aVal === "string" && typeof bVal === "string") {
          compareValue = aVal.localeCompare(bVal);
        } else if (typeof aVal === "number" && typeof bVal === "number") {
          compareValue = aVal - bVal;
        }
        
        return sortOrder === "asc" ? compareValue : -compareValue;
      });
    }

    return filtered;
  }, [data, searchQuery, searchFields, sortBy, sortOrder, filters]);

  const hasActiveFilters =
    searchQuery.trim() !== "" || filters.size > 0 || sortBy !== null;

  return {
    searchQuery,
    setSearchQuery,
    sortBy,
    sortOrder,
    handleSort,
    filters,
    toggleFilter,
    clearFilters,
    processedData,
    hasActiveFilters,
  };
}

