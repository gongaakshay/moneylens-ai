import { FinancialInsight } from "@/types";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Activity,
  Info,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface InsightItemProps {
  insight: FinancialInsight;
}

export function InsightItem({ insight }: InsightItemProps) {
  const getIcon = () => {
    switch (insight.category) {
      case "spending":
        return <TrendingDown className="w-5 h-5" />;
      case "savings":
        return <TrendingUp className="w-5 h-5" />;
      case "budget":
        return <Activity className="w-5 h-5" />;
      case "prediction":
        return <Lightbulb className="w-5 h-5" />;
      case "health":
        return <Activity className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getSeverityStyles = () => {
    switch (insight.severity) {
      case "critical":
        return "bg-red-500/10 border-red-500/30 text-red-400";
      case "warning":
        return "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
      case "success":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
      case "info":
      default:
        return "bg-blue-500/10 border-blue-500/30 text-blue-400";
    }
  };

  const getSeverityIcon = () => {
    switch (insight.severity) {
      case "critical":
        return <XCircle className="w-4 h-4" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4" />;
      case "success":
        return <CheckCircle className="w-4 h-4" />;
      case "info":
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const severityStyles = getSeverityStyles();

  return (
    <div
      className={`border rounded-lg p-4 ${severityStyles} transition-all hover:scale-[1.02]`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">{getIcon()}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-white">{insight.title}</h4>
            {insight.severity && (
              <span className="opacity-70">{getSeverityIcon()}</span>
            )}
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {insight.description}
          </p>
          {insight.actionable && (
            <div className="mt-2 flex items-center gap-1 text-xs opacity-80">
              <Lightbulb className="w-3 h-3" />
              <span>Actionable</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

