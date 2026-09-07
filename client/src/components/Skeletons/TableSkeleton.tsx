import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border border-slate-700/50 overflow-hidden shadow-xl" aria-busy="true" aria-label="Loading table data">
      {/* Table Header */}
      <div className="bg-slate-800/30 border-b border-slate-700/50 p-4">
        <div className="flex gap-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24 ml-auto" />
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>

      {/* Table Body */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="border-b border-slate-700/50 p-4 last:border-b-0"
        >
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-8 w-8 rounded ml-auto" />
          </div>
        </div>
      ))}

      {/* Table Footer */}
      <div className="bg-slate-800/50 p-4 border-t border-slate-700/50">
        <div className="flex gap-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-6 w-32 ml-auto" />
        </div>
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="h-64 flex items-center justify-center bg-slate-900/30 rounded-lg border border-slate-700/30" aria-busy="true" aria-label="Loading chart">
      <div className="space-y-3 w-full px-8">
        <div className="flex items-end justify-center gap-2 h-40">
          {[40, 65, 45, 80, 55, 70, 50].map((height, i) => (
            <Skeleton
              key={i}
              className="w-8"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <div className="flex justify-center gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

