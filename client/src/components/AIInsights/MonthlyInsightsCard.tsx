import { useState, useEffect } from "react";
import { MonthlyInsights } from "@/types";
import {
  fetchMonthlyInsights,
  regenerateMonthlyInsights,
} from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InsightItem } from "./InsightItem";
import { MonthlyInsightsSkeleton } from "@/components/Skeletons/InsightsSkeleton";
import {
  RefreshCw,
  Loader2,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface MonthlyInsightsCardProps {
  userId: string;
  monthId: string;
}

export function MonthlyInsightsCard({
  userId,
  monthId,
}: MonthlyInsightsCardProps) {
  const [insights, setInsights] = useState<MonthlyInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize from localStorage, default to true (expanded)
  const [showComparisons, setShowComparisons] = useState(() => {
    const saved = localStorage.getItem("monthlyInsightsComparisonsExpanded");
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Save to localStorage whenever collapse state changes
  useEffect(() => {
    localStorage.setItem("monthlyInsightsComparisonsExpanded", JSON.stringify(showComparisons));
  }, [showComparisons]);

  useEffect(() => {
    loadInsights();
  }, [userId, monthId]);

  const loadInsights = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchMonthlyInsights(userId, monthId);
      setInsights(data);
    } catch (err: any) {
      setError(err.message || "Failed to load insights");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      setError(null);
      const data = await regenerateMonthlyInsights(userId, monthId);
      setInsights(data);
    } catch (err: any) {
      setError(err.message || "Failed to regenerate insights");
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isLoading) {
    return <MonthlyInsightsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={loadInsights} variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              AI Monthly Insights
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Generated {new Date(insights.generatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          variant="outline"
          size="icon"
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-600 hover:border-slate-500 transition-all"
          title="Refresh insights"
        >
          {isRegenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Month Summary */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-3">
            Month Summary
          </h3>
          <p className="text-slate-300 leading-relaxed">
            {insights.monthSummary}
          </p>
        </CardContent>
      </Card>

      {/* Comparisons */}
      {insights.comparisons.changes.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            <button
              onClick={() => setShowComparisons(!showComparisons)}
              className="w-full flex items-center justify-between text-lg font-semibold text-white mb-4 hover:text-emerald-400 transition-colors"
            >
              <span>
                Month-over-Month Changes
                {insights.comparisons.previousMonth &&
                  ` (vs ${insights.comparisons.previousMonth})`}
              </span>
              {showComparisons ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            {showComparisons && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {insights.comparisons.changes.map((change, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/30"
                  >
                    <span className="text-sm text-slate-300">
                      {change.category}
                    </span>
                    <div className="flex items-center gap-2">
                      {change.direction === "up" ? (
                        <TrendingUp className="w-4 h-4 text-red-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-emerald-400" />
                      )}
                      <Badge
                        variant={
                          change.direction === "up" ? "destructive" : "default"
                        }
                        className={
                          change.direction === "down"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : ""
                        }
                      >
                        {change.direction === "up" ? "+" : ""}
                        {change.change.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Key Insights */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 gap-4">
          {insights.insights.map((insight) => (
            <InsightItem key={insight.id} insight={insight} />
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {insights.recommendations.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Actionable Recommendations
            </h3>
            <div className="space-y-2">
              {insights.recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/30"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-emerald-400">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

