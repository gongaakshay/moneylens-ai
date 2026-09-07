import { useState } from "react";
import { MonthCard } from "@/components/MonthCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MonthTrendChart } from "@/components/Charts/MonthTrendChart";
import { CarryForwardTrendChart } from "@/components/Charts/CarryForwardTrendChart";
import { InvestmentTrendChart } from "@/components/Charts/InvestmentTrendChart";
import { Download, Loader2, TrendingUp, ChevronDown, ChevronRight, BarChart3 } from "lucide-react";
import { MonthData } from "@/types";

interface YearSectionProps {
  year: number;
  months: MonthData[];
  isExporting: boolean;
  onExportYear: (year: number) => void;
}

export function YearSection({
  year,
  months,
  isExporting,
  onExportYear,
}: YearSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCharts, setShowCharts] = useState(false);
  
  const yearTotal = {
    income: months.reduce((sum, m) => sum + m.totalIncome, 0),
    expense: months.reduce((sum, m) => sum + m.totalExpense, 0),
  };
  const yearBalance = yearTotal.income - yearTotal.expense;

  return (
    <div className="space-y-4">
      {/* Year Section Container */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600/50 transition-all">
        {/* Compact Year Header */}
        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 sm:gap-3 flex-1 text-left group min-w-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                )}
                <span className="text-xl sm:text-2xl font-bold text-white">{year}</span>
                <span className="text-xs sm:text-sm text-slate-500 whitespace-nowrap">({months.length} months)</span>
              </div>
            </button>

            {/* Inline Stats */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-wrap">
              <div className="flex flex-wrap gap-2 flex-1 sm:flex-initial">
                <div className="px-2.5 sm:px-3 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-xs whitespace-nowrap">
                  <span className="text-slate-400">Total Money: </span>
                  <span className="text-emerald-400 font-semibold">{yearTotal.income.toLocaleString()}</span>
                </div>
                <div className="px-2.5 sm:px-3 py-1.5 bg-red-500/10 rounded-lg border border-red-500/20 text-xs whitespace-nowrap">
                  <span className="text-slate-400">Expense: </span>
                  <span className="text-red-400 font-semibold">{yearTotal.expense.toLocaleString()}</span>
                </div>
                <div className={`px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap ${
                  yearBalance >= 0 
                    ? 'bg-blue-500/10 border-blue-500/20' 
                    : 'bg-orange-500/10 border-orange-500/20'
                }`}>
                  <span className="text-slate-400">Net: </span>
                  <span className={`font-semibold ${yearBalance >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                    {yearBalance >= 0 ? '+' : ''}{yearBalance.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <Button
                onClick={() => onExportYear(year)}
                disabled={isExporting}
                size="sm"
                variant="outline"
                className="bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-600 h-8 w-full sm:w-auto"
              >
                {isExporting ? (
                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                ) : (
                  <Download className="w-3 h-3 mr-1.5" />
                )}
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Collapsible Content - Nested inside year container */}
        {isExpanded && (
          <div className="border-t border-slate-700/50 animate-fade-in">
            {/* Month Cards Grid - Wrapped container */}
            <div className="p-3 sm:p-4 sm:pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {[...months]
                  .sort((a, b) => b.month - a.month)
                  .map((month, idx) => (
                    <div 
                      key={month._id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${idx * 0.03}s` }}
                    >
                      <MonthCard month={month} />
                    </div>
                  ))}
              </div>
            </div>

            {/* Charts Toggle Button */}
            <div className="border-t border-slate-700/50 pt-3 sm:pt-4 mb-3 sm:mb-4">
              <div className="flex justify-center px-3 sm:px-4">
                <Button
                  onClick={() => setShowCharts(!showCharts)}
                  variant="outline"
                  size="sm"
                  className="bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white border-slate-700/50 hover:border-slate-600/50 transition-all"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {showCharts ? 'Hide Charts' : 'Show Trend Charts'}
                  {showCharts ? (
                    <ChevronDown className="w-4 h-4 ml-2" />
                  ) : (
                    <ChevronRight className="w-4 h-4 ml-2" />
                  )}
                </Button>
              </div>
            </div>

            {/* Collapsible Charts */}
            {showCharts && (
              <div className="border-t border-slate-700/50 pt-3 sm:pt-4 px-3 sm:px-4 pb-3 sm:pb-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 animate-fade-in">
                  <Card className="group relative overflow-hidden bg-slate-800/90 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/70 transition-all duration-300 shadow-lg">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="p-4 relative">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-blue-500/10 rounded-lg">
                          <TrendingUp className="w-4 h-4 text-blue-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-white">
                          Month Trends
                        </h3>
                      </div>
                      <MonthTrendChart months={months} />
                    </CardContent>
                  </Card>

                  <Card className="group relative overflow-hidden bg-slate-800/90 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/70 transition-all duration-300 shadow-lg">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="p-4 relative">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-white">
                          Carry Forward
                        </h3>
                      </div>
                      <CarryForwardTrendChart months={months} />
                    </CardContent>
                  </Card>

                  <Card className="group relative overflow-hidden bg-slate-800/90 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/70 transition-all duration-300 shadow-lg lg:col-span-2">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="p-4 relative">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-purple-500/10 rounded-lg">
                          <TrendingUp className="w-4 h-4 text-purple-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-white">
                          Investment Trend
                        </h3>
                      </div>
                      <InvestmentTrendChart months={months} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

