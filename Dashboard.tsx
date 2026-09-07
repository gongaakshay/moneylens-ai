import { useApp } from "@/context/AppContext";
import { DashboardSkeleton } from "./Skeletons/DashboardSkeleton";
import { OverviewInsightsCard } from "./AIInsights/OverviewInsightsCard";

import { MonthCreationDialog } from "./Dashboard/MonthCreationDialog";
import { YearSection } from "./Dashboard/YearSection";
import { Card, CardContent } from "@/components/ui/card";
import { useExport } from "@/hooks/useExport";
import { CalendarIcon } from "lucide-react";


export function Dashboard() {
  const { months, isLoading, createMonth, currency, user } = useApp();
  const { isExporting, exportYear } = useExport(currency);

  const monthsByYear = (months || []).reduce((acc, month) => {
    const year = month.year;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(month);
    return acc;
  }, {} as Record<number, typeof months>);

  const sortedYears = Object.keys(monthsByYear)
    .map(Number)
    .sort((a, b) => b - a);



  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex justify-end">
        <MonthCreationDialog onCreateMonth={createMonth} />
      </div>



      {user && months.length > 0 && (
        <div className="animate-fade-in">
          <OverviewInsightsCard userId={user.id} />
        </div>
      )}

      {months.length === 0 ? (
        <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 border-2 border-dashed shadow-xl">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full"></div>
              <CalendarIcon className="relative w-20 h-20 text-slate-500 mb-6" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Start Your Financial Journey
            </h3>
            <p className="text-slate-400 mb-6 text-center max-w-md">
              Begin tracking your income and expenses to unlock powerful insights and achieve your financial goals
            </p>
            <MonthCreationDialog onCreateMonth={createMonth} />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          {sortedYears.map((year, idx) => (
            <div key={year} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
              <YearSection
                year={year}
                months={monthsByYear[year]}
                isExporting={isExporting}
                onExportYear={(yr) => exportYear(monthsByYear[yr], yr)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
