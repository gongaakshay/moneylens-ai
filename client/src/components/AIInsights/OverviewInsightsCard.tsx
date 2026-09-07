import { useState, useEffect, useCallback, useRef } from "react";
import { OverviewInsights } from "@/types";
import {
  fetchOverviewInsights,
  regenerateOverviewInsights,
} from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InsightItem } from "./InsightItem";
import { InsightsSkeleton } from "@/components/Skeletons/InsightsSkeleton";
import {
  RefreshCw,
  Loader2,
  Sparkles,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface OverviewInsightsCardProps {
  userId: string;
}

const CACHE_KEY_PREFIX = "overviewInsights_";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function OverviewInsightsCard({ userId }: OverviewInsightsCardProps) {
  const [insights, setInsights] = useState<OverviewInsights | null>(() => {
    // Try to load from cache on mount
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${userId}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const cacheTime = parsed.cacheTime || 0;
        const now = Date.now();
        // If cache is still valid (less than 5 minutes old), use it
        if (now - cacheTime < CACHE_DURATION) {
          return parsed.data;
        }
      } catch {
        // Invalid cache, ignore
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(!insights); // Only show loader if no cached data
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userIdRef = useRef(userId);
  const hasLoadedRef = useRef(!!insights); // Set to true if we have cached insights

  // Update ref when userId changes
  useEffect(() => {
    if (userIdRef.current !== userId) {
      userIdRef.current = userId;
      hasLoadedRef.current = false;
    }
  }, [userId]);

  // Initialize from localStorage, default to true (expanded)
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem("overviewInsightsExpanded");
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Save to localStorage whenever collapse state changes
  useEffect(() => {
    localStorage.setItem(
      "overviewInsightsExpanded",
      JSON.stringify(isExpanded)
    );
  }, [isExpanded]);

  // Cache insights whenever they change
  useEffect(() => {
    if (insights) {
      localStorage.setItem(
        `${CACHE_KEY_PREFIX}${userId}`,
        JSON.stringify({
          data: insights,
          cacheTime: Date.now(),
        })
      );
    }
  }, [insights, userId]);

  const loadInsights = useCallback(async (force = false) => {
    // Skip if we already have insights and not forcing refresh
    if (!force && hasLoadedRef.current) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchOverviewInsights(userIdRef.current);
      setInsights(data);
      hasLoadedRef.current = true;
    } catch (err: any) {
      setError(err.message || "Failed to load insights");
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies - uses refs

  useEffect(() => {
    // Check if userId changed
    if (userIdRef.current !== userId) {
      userIdRef.current = userId;
      hasLoadedRef.current = false;
      
      // Check cache for new userId
      const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${userId}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const cacheTime = parsed.cacheTime || 0;
          const now = Date.now();
          // If cache is still valid (less than 5 minutes old), use it
          if (now - cacheTime < CACHE_DURATION) {
            setInsights(parsed.data);
            setIsLoading(false);
            hasLoadedRef.current = true;
            return; // Don't fetch if we have valid cache
          }
        } catch {
          // Invalid cache, continue to fetch
        }
      }
      
      // No valid cache, clear and fetch
      setInsights(null);
      setIsLoading(true);
    }

    // Only fetch if we don't have insights and haven't loaded yet
    if (!insights && !hasLoadedRef.current) {
      loadInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // Only depend on userId - insights and loadInsights are stable

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      setError(null);
      const data = await regenerateOverviewInsights(userId);
      setInsights(data);
      // Clear cache and reload
      localStorage.removeItem(`${CACHE_KEY_PREFIX}${userId}`);
    } catch (err: any) {
      setError(err.message || "Failed to regenerate insights");
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isLoading) {
    return <InsightsSkeleton />;
  }

  if (error) {
    return (
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={() => loadInsights(true)} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) return null;

  return (
    <Card className="bg-slate-800/50 border-slate-700/50">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
          >
            <div className="p-2 bg-emerald-500/10 rounded-lg flex-shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white break-words">
                AI Financial Insights
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 break-words">
                Generated {new Date(insights.generatedAt).toLocaleDateString()}
                {!isExpanded &&
                  ` • Score: ${insights.financialHealthScore}/100`}
              </p>
            </div>
          </button>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <Button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              variant="outline"
              size="icon"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-600 hover:border-slate-500 transition-all h-8 w-8 sm:h-10 sm:w-10"
              title="Refresh insights"
            >
              {isRegenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 hover:bg-slate-700/50 rounded transition-colors flex-shrink-0"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {isExpanded && (
          <>
            {/* Financial Health Score */}
            <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">
                  Financial Health Score
                </h3>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span className="text-3xl font-bold text-emerald-400">
                    {insights.financialHealthScore}
                    <span className="text-lg text-slate-400">/100</span>
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 mb-3">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full transition-all"
                  style={{ width: `${insights.financialHealthScore}%` }}
                />
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {insights.summary}
              </p>
            </div>

            {/* Key Insights */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Key Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.insights.map((insight) => (
                  <InsightItem key={insight.id} insight={insight} />
                ))}
              </div>
            </div>

            {/* Predictions */}
            {insights.predictions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Predictions & Recommendations
                </h3>
                <div className="space-y-2">
                  {insights.predictions.map((prediction, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/30"
                    >
                      <TrendingUp className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-slate-300">{prediction}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
