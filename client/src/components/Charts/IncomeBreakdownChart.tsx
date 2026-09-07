import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { IncomeItem } from "@/types";
import { useApp } from "@/context/AppContext";
import { formatCurrency as formatCurrencyUtil } from "@/utils/currency";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface IncomeBreakdownChartProps {
  income: IncomeItem[];
}

const COLORS = [
  "#10b981", // emerald-500
  "#06b6d4", // cyan-500
  "#3b82f6", // blue-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#f59e0b", // amber-500
  "#14b8a6", // teal-500
  "#6366f1", // indigo-500
];

export function IncomeBreakdownChart({ income }: IncomeBreakdownChartProps) {
  const { currency } = useApp();

  const formatCurrency = (amount: number) => {
    return formatCurrencyUtil(amount, currency);
  };

  // Filter out zero-amount items and prepare data
  const validIncome = (income || []).filter((item) => item.amount > 0);

  if (validIncome.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        No income data available
      </div>
    );
  }

  const chartData = {
    labels: validIncome.map((item) => item.category),
    datasets: [
      {
        label: "Income",
        data: validIncome.map((item) => item.amount),
        backgroundColor: COLORS.slice(0, validIncome.length),
        borderColor: "#1e293b", // slate-800
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "#cbd5e1", // slate-300
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "#1e293b", // slate-800
        titleColor: "#ffffff",
        bodyColor: "#cbd5e1",
        borderColor: "#334155", // slate-700
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce(
              (sum: number, val: number) => sum + val,
              0
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
          },
        },
      },
      datalabels: {
        color: "#ffffff",
        font: {
          weight: "bold" as const,
          size: 14,
        },
        formatter: (value: number, context: any) => {
          const total = context.dataset.data.reduce(
            (sum: number, val: number) => sum + val,
            0
          );
          const percentage = ((value / total) * 100).toFixed(1);
          return parseFloat(percentage) > 5 ? `${percentage}%` : "";
        },
      },
    },
  };

  return (
    <div className="w-full h-64">
      <Pie data={chartData} options={options} />
    </div>
  );
}

