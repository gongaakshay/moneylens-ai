import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ExpenseItem } from '@/types';
import { getCategoryColor } from '@/utils/calculations';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface ExpenseBreakdownChartProps {
  expenses: ExpenseItem[];
}

export function ExpenseBreakdownChart({ expenses }: ExpenseBreakdownChartProps) {
  if (expenses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        No expense data to display
      </div>
    );
  }

  const data = {
    labels: (expenses || []).map((e) => e.category),
    datasets: [
      {
        data: expenses.map((e) => e.amount),
        backgroundColor: expenses.map((_, i) => getCategoryColor(i)),
        borderColor: 'rgb(30, 41, 59)',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: 'rgb(148, 163, 184)',
          padding: 12,
          usePointStyle: true,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgb(30, 41, 59)',
        titleColor: 'rgb(255, 255, 255)',
        bodyColor: 'rgb(148, 163, 184)',
        borderColor: 'rgb(71, 85, 105)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context: { label: string; parsed: number }) => {
            const value = context.parsed;
            const total = expenses.reduce((sum, e) => sum + e.amount, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ₹${value.toLocaleString('en-IN')} (${percentage}%)`;
          },
        },
      },
      datalabels: {
        color: '#ffffff',
        font: {
          weight: 'bold' as const,
          size: 14,
        },
        formatter: (value: number) => {
          const total = expenses.reduce((sum, e) => sum + e.amount, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return parseFloat(percentage) > 5 ? `${percentage}%` : '';
        },
      },
    },
  };

  return (
    <div className="h-64">
      <Pie data={data} options={options} />
    </div>
  );
}

