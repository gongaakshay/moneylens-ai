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

interface CarryForwardTrendChartProps {
  months: MonthData[];
  currentMonthId?: string;
}

export function CarryForwardTrendChart({
  months,
  currentMonthId,
}: CarryForwardTrendChartProps) {
  if (months.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        No data to display
      </div>
    );
  }

  // Sort months chronologically
  const sortedMonths = [...(months || [])].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  const currentIndex = currentMonthId 
    ? sortedMonths.findIndex((m) => m._id === currentMonthId)
    : -1;

  const data = {
    labels: sortedMonths.map((m) => m.monthName),
    datasets: [
      {
        label: "Carry Forward",
        data: sortedMonths.map((m) => m.carryForward),
        fill: true,
        backgroundColor: (context: {
          chart: { ctx: CanvasRenderingContext2D };
        }) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 250);
          gradient.addColorStop(0, "rgba(52, 211, 153, 0.3)");
          gradient.addColorStop(1, "rgba(52, 211, 153, 0)");
          return gradient;
        },
        borderColor: "rgb(52, 211, 153)",
        borderWidth: 3,
        tension: 0.4,
        pointBackgroundColor: sortedMonths.map((_, i) =>
          i === currentIndex ? "rgb(52, 211, 153)" : "rgba(52, 211, 153, 0.5)"
        ),
        pointBorderColor: sortedMonths.map((_, i) =>
          i === currentIndex ? "rgb(255, 255, 255)" : "rgb(52, 211, 153)"
        ),
        pointBorderWidth: sortedMonths.map((_, i) => (i === currentIndex ? 3 : 1)),
        pointRadius: sortedMonths.map((_, i) => (i === currentIndex ? 8 : 4)),
        pointHoverRadius: 8,
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
      datalabels: {
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
          label: (context: { parsed: { y: number } }) => {
            const value = context.parsed.y;
            const sign = value >= 0 ? "+" : "";
            return `${sign}₹${value.toLocaleString("en-IN")}`;
          },
        },
      },
    },
    scales: {
      y: {
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
              const sign = value >= 0 ? "" : "-";
              return `${sign}₹${Math.abs(value / 1000).toFixed(0)}K`;
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
            size: 11,
          },
        },
      },
    },
  };

  return (
    <div className="h-64">
      <Line data={data} options={options} />
    </div>
  );
}
