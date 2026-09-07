import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useApp } from "@/context/AppContext";
import { formatCurrency as formatCurrencyUtil } from "@/utils/currency";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface IncomeVsExpenseChartProps {
  totalIncome: number;
  totalExpense: number;
}

export function IncomeVsExpenseChart({
  totalIncome,
  totalExpense,
}: IncomeVsExpenseChartProps) {
  const { currency } = useApp();

  const formatCurrency = (amount: number) => {
    return formatCurrencyUtil(amount, currency);
  };

  const data = {
    labels: ["Income", "Expense"],
    datasets: [
      {
        label: "Amount",
        data: [totalIncome, totalExpense],
        backgroundColor: [
          "rgba(52, 211, 153, 0.8)",
          "rgba(248, 113, 113, 0.8)",
        ],
        borderColor: ["rgb(52, 211, 153)", "rgb(248, 113, 113)"],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgb(30, 41, 59)",
        titleColor: "rgb(255, 255, 255)",
        bodyColor: "rgb(203, 213, 225)", // slate-300
        borderColor: "rgb(71, 85, 105)",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context: any) => {
            return formatCurrency(context.parsed.y);
          },
        },
      },
      datalabels: {
        color: "#ffffff",
        anchor: "end" as const,
        align: "end" as const,
        offset: 4,
        font: {
          weight: "bold" as const,
          size: 14,
        },
        formatter: (value: number) => {
          return formatCurrency(value);
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(71, 85, 105, 0.3)",
        },
        ticks: {
          color: "rgb(203, 213, 225)", // slate-300
          padding: 10,
          font: {
            size: 11,
          },
          callback: (value: any) => {
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
          color: "rgb(203, 213, 225)", // slate-300
          padding: 10,
          font: {
            size: 12,
            weight: 500,
          },
        },
      },
    },
  };

  return (
    <div className="h-64">
      <Bar data={data} options={options} />
    </div>
  );
}