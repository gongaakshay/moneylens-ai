import { Skeleton } from "@/components/ui/skeleton";

export function RecurringExpensesSkeleton() {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Loading recurring expenses">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700/30"
        >
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      ))}
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-6 w-28" />
        </div>
      </div>
    </div>
  );
}

