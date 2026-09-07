import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Plus, Loader2, CalendarPlus, Sparkles } from "lucide-react";
import { MONTHS } from "@/constants/months";

interface MonthCreationDialogProps {
  onCreateMonth: (year: number, month: number) => Promise<void>;
}

export function MonthCreationDialog({
  onCreateMonth,
}: MonthCreationDialogProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [selectedYear, setSelectedYear] = useState<string>(
    currentYear.toString()
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    currentMonth.toString()
  );
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState("");

  const handleCreateMonth = async () => {
    if (!selectedYear || !selectedMonth) return;
    setIsCreating(true);
    setError("");
    try {
      await onCreateMonth(parseInt(selectedYear), parseInt(selectedMonth));
      setDialogOpen(false);
      setSelectedYear(currentYear.toString());
      setSelectedMonth(currentMonth.toString());
    } catch (err: any) {
      setError(err.message || "Failed to create month");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all">
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <Plus className="w-4 h-4 mr-2 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
          <span className="relative z-10">Add Period</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700/50 backdrop-blur-xl">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>
        
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-lg border border-emerald-400/30">
              <CalendarPlus className="w-5 h-5 text-emerald-400" />
            </div>
            <DialogTitle className="text-2xl font-bold text-white">
              Create New Period
            </DialogTitle>
          </div>
          <p className="text-slate-400 text-sm mt-2">
            Select a month and year to start tracking your finances
          </p>
        </DialogHeader>
        
        <div className="space-y-5 py-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month" className="text-slate-300 font-medium flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Month
              </Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white hover:border-emerald-400/50 transition-all backdrop-blur-sm">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {MONTHS.map((month, index) => (
                    <SelectItem
                      key={index}
                      value={index.toString()}
                      className="text-white focus:bg-slate-700 focus:text-emerald-400 cursor-pointer"
                    >
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year" className="text-slate-300 font-medium flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Year
              </Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white hover:border-cyan-400/50 transition-all backdrop-blur-sm">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {Array.from({ length: 10 }, (_, i) => currentYear - 5 + i).map(
                    (year) => (
                      <SelectItem
                        key={year}
                        value={year.toString()}
                        className="text-white focus:bg-slate-700 focus:text-cyan-400 cursor-pointer"
                      >
                        {year}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview Card */}
          <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-xl border border-emerald-400/20 backdrop-blur-sm">
            <p className="text-center text-slate-300 text-sm mb-1">Creating Period:</p>
            <p className="text-center text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {MONTHS[parseInt(selectedMonth)]} {selectedYear}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-center text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button 
              variant="ghost" 
              className="text-slate-300 hover:text-white hover:bg-slate-700/50"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleCreateMonth}
            disabled={isCreating || !selectedYear || !selectedMonth}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Create Period
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

