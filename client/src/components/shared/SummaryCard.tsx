import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface SummaryCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  iconBgColor?: string;
  iconColor?: string;
  valueColor?: string;
  children?: ReactNode;
}

export function SummaryCard({
  icon: Icon,
  label,
  value,
  iconBgColor = "bg-slate-700/50",
  iconColor = "text-slate-300",
  valueColor = "text-white",
}: SummaryCardProps) {
  return (
    <Card className="bg-slate-800/50 border-slate-700/50">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 ${iconBgColor} rounded-xl`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <div>
            <p className="text-sm text-slate-400">{label}</p>
            <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

