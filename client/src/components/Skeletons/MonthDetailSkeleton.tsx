import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function MonthDetailSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading month details">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-6">
        <div className="flex gap-2 p-1 bg-slate-800/50 border border-slate-700/50 rounded-lg w-fit">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-md" />
          ))}
        </div>

        {/* Tab Content Skeleton (Table) */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-9 w-32 rounded-md" />
            </div>

            <Skeleton className="h-10 w-full rounded-md" />

            {/* Table Skeleton */}
            <div className="rounded-lg border border-slate-700/50 overflow-hidden">
              <div className="bg-slate-800/30 border-b border-slate-700/50 p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-24 ml-auto" />
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
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
              <div className="bg-slate-800/50 p-4 border-t border-slate-700/50">
                <div className="flex gap-4">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-6 w-32 ml-auto" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

