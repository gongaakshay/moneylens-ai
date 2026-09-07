import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { MonthData } from "@/types";
import { useApp } from "@/context/AppContext";
import { formatCurrency as formatCurrencyUtil } from "@/utils/currency";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MonthTrendChartProps {
  months: MonthData[];
}

export function MonthTrendChart({ months }: MonthTrendChartProps) {
  const { currency } = useApp();

  const formatCurrency = (amount: number) => {
    return formatCurrencyUtil(amount, currency);
  };

  // Sort months chronologically
  const sortedMonths = [...(months || [])].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  // Use all months for the year (instead of limiting to 6)
  const displayMonths = sortedMonths;

  if (displayMonths.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        No data available
      </div>
    );
  }

  const chartData = {
    labels: displayMonths.map((m) => {
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return `${monthNames[m.month]} ${m.year}`;
    }),
    datasets: [
      {
        label: "Income",
        data: displayMonths.map((m) => m.totalIncome),
        borderColor: "#10b981", // emerald-500
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
      },
      {
        label: "Expenses",
        data: displayMonths.map((m) => m.totalExpense),
        borderColor: "#ef4444", // red-500
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "#ef4444",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
      },
      {
        label: "Carry Forward",
        data: displayMonths.map((m) => m.carryForward),
        borderColor: "#3b82f6", // blue-500
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        display: false,
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
            const label = context.dataset.label || "";
            const value = context.parsed.y || 0;
            return `${label}: ${formatCurrency(value)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "#334155", // slate-700
          drawBorder: false,
        },
        ticks: {
          color: "#cbd5e1", // slate-300
          padding: 10,
          font: {
            size: 11,
          },
          callback: function (value: any) {
            if (typeof value === "number") {
              return `${currency === "USD" ? "$" : "₹"}${(value / 1000).toFixed(
                0
              )}K`;
            }
            return value;
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#cbd5e1", // slate-300
          padding: 10,
          font: {
            size: 11,
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-80">
      <Line data={chartData} options={options} />
    </div>
  );
}
