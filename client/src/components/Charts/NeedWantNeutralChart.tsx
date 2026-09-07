import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { ExpenseItem } from "@/types";
import { useApp } from "@/context/AppContext";
import { formatCurrency as formatCurrencyUtil } from "@/utils/currency";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface NeedWantNeutralChartProps {
  expenses: ExpenseItem[];
}

const COLORS = {
  need: "#ef4444", // red
  want: "#eab308", // yellow
  neutral: "#94a3b8", // slate
};

// const EMOJIS = {
//   need: '🔴',
//   want: '🟡',
//   neutral: '⚪',
// };

export function NeedWantNeutralChart({ expenses }: NeedWantNeutralChartProps) {
  const { currency } = useApp();
  
  // Aggregate expenses by tag
  const tagTotals = (expenses || []).reduce((acc, expense) => {
    if (expense.entries && expense.entries.length > 0) {
      expense.entries.forEach((entry) => {
        const tag = entry.tag || "neutral";
        acc[tag] = (acc[tag] || 0) + entry.amount;
      });
    } else {
      // Legacy format - default to neutral
      acc.neutral = (acc.neutral || 0) + expense.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const chartData = [
    { name: "need", label: "Need", value: tagTotals.need || 0 },
    { name: "want", label: "Want", value: tagTotals.want || 0 },
    { name: "neutral", label: "Neutral", value: tagTotals.neutral || 0 },
  ].filter((item) => item.value > 0);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (chartData.length === 0 || total === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        No expense data available
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return formatCurrencyUtil(value, currency);
  };

  const data = {
    labels: chartData.map((item) => `${item.label}`),
    datasets: [
      {
        data: chartData.map((item) => item.value),
        backgroundColor: chartData.map(
          (item) => COLORS[item.name as keyof typeof COLORS]
        ),
        borderColor: "rgb(30, 41, 59)",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "rgb(148, 163, 184)",
          padding: 12,
          usePointStyle: true,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgb(30, 41, 59)",
        titleColor: "rgb(255, 255, 255)",
        bodyColor: "rgb(148, 163, 184)",
        borderColor: "rgb(71, 85, 105)",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context: { label: string; parsed: number }) => {
            const value = context.parsed;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(
              value
            )} (${percentage}%)`;
          },
        },
      },
      datalabels: {
        color: "#ffffff",
        font: {
          weight: "bold" as const,
          size: 14,
        },
        formatter: (value: number) => {
          const percentage = ((value / total) * 100).toFixed(1);
          return parseFloat(percentage) > 5 ? `${percentage}%` : "";
        },
      },
    },
  };

  return (
    <div className="space-y-4">
      <div className="h-64">
        <Pie data={data} options={options} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {chartData.map((item) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <div
              key={item.name}
              className="bg-slate-700/30 border border-slate-700/50 rounded-lg p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-slate-400">{item.label}</span>
              </div>
              <p className="text-lg font-bold text-white">
                {formatCurrency(item.value)}
              </p>
              <p className="text-xs text-slate-400">{percentage}% of total</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
