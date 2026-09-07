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

interface InvestmentTrendChartProps {
  months: MonthData[];
}

export function InvestmentTrendChart({ months }: InvestmentTrendChartProps) {
  const { currency } = useApp();

  const formatCurrency = (amount: number) => {
    return formatCurrencyUtil(amount, currency);
  };

  // Sort months chronologically
  const sortedMonths = [...(months || [])].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  // Extract investment data
  const investmentData = sortedMonths.map((month) => {
    const investmentExpense = month.expenses.find(
      (exp) => exp.category === "Investment"
    );
    return investmentExpense?.amount || 0;
  });

  // Check if there's any investment data
  const hasInvestmentData = investmentData.some((amount) => amount > 0);

  if (sortedMonths.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        No data available
      </div>
    );
  }

  if (!hasInvestmentData) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        No investment data recorded
      </div>
    );
  }

  const chartData = {
    labels: sortedMonths.map((m) => {
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
        label: "Investment",
        data: investmentData,
        borderColor: "#8b5cf6", // violet-500
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "#8b5cf6",
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
            const value = context.parsed.y || 0;
            return `Investment: ${formatCurrency(value)}`;
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

