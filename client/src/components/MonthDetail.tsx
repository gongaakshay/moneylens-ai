import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { formatCurrency } from "@/utils/calculations";
import { exportMonthToExcel } from "@/utils/excelExport";
import { toast } from "sonner";
import { IncomeSection } from "./IncomeSection";
import { ExpenseSection } from "./ExpenseSection";
import { MonthlyInsightsCard } from "./AIInsights/MonthlyInsightsCard";
import { MonthDetailSkeleton } from "./Skeletons/MonthDetailSkeleton";
import { ExpenseBreakdownChart } from "./Charts/ExpenseBreakdownChart";
import { IncomeBreakdownChart } from "./Charts/IncomeBreakdownChart";
import { IncomeVsExpenseChart } from "./Charts/IncomeVsExpenseChart";
import { NeedWantNeutralChart } from "./Charts/NeedWantNeutralChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Wallet,
  Download,
  Loader2,
  BarChart3,
  Sparkles,
} from "lucide-react";

export function MonthDetail() {
  const { monthId } = useParams<{ monthId: string }>();
  const navigate = useNavigate();
  const { months, isLoading, currency, user } = useApp();
  const [isExporting, setIsExporting] = useState(false);

  const month = months.find((m) => m._id === monthId);

  const handleExportMonth = async () => {
    if (!month) return;

    setIsExporting(true);
    try {
      const filename = await exportMonthToExcel(month, currency);
      toast.success(`Excel file "${filename}" downloaded successfully`);
    } catch (err: any) {
      toast.error(err.message || "Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return <MonthDetailSkeleton />;
  }

  if (!month) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-white mb-4">Month not found</h2>
        <Button
          onClick={() => navigate("/dashboard")}
          variant="outline"
          className="text-slate-300 border-slate-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const isPositive = month.carryForward >= 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() => navigate("/dashboard")}
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">{month.monthName}</h1>
          <p className="text-slate-400">Manage your income and expenses</p>
        </div>
        <Button
          onClick={handleExportMonth}
          disabled={isExporting}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Export
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Income</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {formatCurrency(month.totalIncome, currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-xl">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Expense</p>
                <p className="text-2xl font-bold text-red-400">
                  {formatCurrency(month.totalExpense, currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl ${
                  isPositive ? "bg-emerald-500/10" : "bg-red-500/10"
                }`}
              >
                <Wallet
                  className={`w-6 h-6 ${
                    isPositive ? "text-emerald-400" : "text-red-400"
                  }`}
                />
              </div>
              <div>
                <p className="text-sm text-slate-400">Carry Forward</p>
                <div className="flex items-center gap-2">
                  <p
                    className={`text-2xl font-bold ${
                      isPositive ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {formatCurrency(month.carryForward, currency)}
                  </p>
                  <Badge variant={isPositive ? "success" : "destructive"}>
                    {isPositive ? "Surplus" : "Deficit"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="income" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700/50 p-1">
          <TabsTrigger
            value="income"
            className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:text-white transition-colors"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Income
          </TabsTrigger>
          <TabsTrigger
            value="expenses"
            className="data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:text-white transition-colors"
          >
            <TrendingDown className="w-4 h-4 mr-2" />
            Expenses
          </TabsTrigger>
          <TabsTrigger
            value="charts"
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:text-white transition-colors"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="ai-insights"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:text-white transition-colors"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="income">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-6">
              <IncomeSection
                monthId={month._id}
                income={month.income}
                totalIncome={month.totalIncome}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-6">
              <ExpenseSection
                monthId={month._id}
                expenses={month.expenses}
                totalExpense={month.totalExpense}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Income Breakdown
                </h3>
                <IncomeBreakdownChart income={month.income} />
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Expense Breakdown
                </h3>
                <ExpenseBreakdownChart expenses={month.expenses} />
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-6 h-full flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Income vs Expense
                </h3>
                <div className="flex-1 min-h-[400px]">
                  <IncomeVsExpenseChart
                    totalIncome={month.totalIncome}
                    totalExpense={month.totalExpense}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-6 h-full flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Need vs Want vs Neutral
                </h3>
                <div className="flex-1 min-h-[400px]">
                  <NeedWantNeutralChart expenses={month.expenses} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-insights">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-6">
              {user && monthId && (
                <MonthlyInsightsCard userId={user.id} monthId={monthId} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
