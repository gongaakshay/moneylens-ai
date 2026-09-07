import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { MonthData } from '@/types';
import { formatCurrency } from '@/utils/calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Wallet, Trash2, ChevronRight, Sparkles } from 'lucide-react';
import { useSwipe } from '@/hooks/useSwipe';
import { toast } from 'sonner';

interface MonthCardProps {
  month: MonthData;
}

export function MonthCard({ month }: MonthCardProps) {
  const navigate = useNavigate();
  const { currency, deleteMonth, user } = useApp();
  const isPositive = month.carryForward >= 0;
  const isAdmin = user?.username.toLowerCase() === 'admin';

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { handlers, swipeState } = useSwipe({
    onSwipeLeft: () => {
      if (!isAdmin) {
        setDeleteDialogOpen(true);
      } else {
        toast.error("Deletion of period is disabled for the admin account to prevent accidental removal of the demo account.");
      }
    },
    threshold: 80,
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMonth(month._id);
      toast.success(`${month.monthName} deleted successfully`);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete month:', error);
      toast.error('Failed to delete month. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || deleteDialogOpen) {
      return;
    }
    navigate(`/month/${month._id}`);
  };

  const savingsRate = month.totalIncome > 0 
    ? ((month.totalIncome - month.totalExpense) / month.totalIncome) * 100 
    : 0;

  return (
    <>
      <div className="relative overflow-hidden rounded-xl" {...(!isAdmin ? handlers : {})}>
        {!isAdmin && (
          <div
            className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-end px-6 pointer-events-none z-0"
            style={{
              opacity: Math.min(Math.abs(swipeState.swipeProgress) / 80, 1),
            }}
          >
            <Trash2 className="w-6 h-6 text-white" />
          </div>
        )}

        <Card
          className="group relative overflow-hidden bg-slate-800/90 backdrop-blur-sm border-slate-700/50 hover:border-slate-600 hover:bg-slate-800 hover:shadow-lg transition-all duration-200 cursor-pointer"
          style={{
            transform: !isAdmin ? `translateX(${swipeState.swipeProgress}px)` : 'translateX(0)',
            transition: swipeState.isSwiping ? 'none' : 'transform 0.3s ease-out',
          }}
          onClick={handleCardClick}
        >
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-slate-600/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <CardHeader className="pb-2 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg backdrop-blur-sm border border-blue-400/20 transition-all">
                  <Sparkles className="w-3 h-3 text-blue-400" />
                </div>
                <CardTitle className="text-lg font-bold text-white transition-colors">
                  {month.monthName}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-300 transition-all">
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="hidden md:flex">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isAdmin) {
                              setDeleteDialogOpen(true);
                            }
                          }}
                          disabled={isAdmin}
                          title={isAdmin ? undefined : "Delete month"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {isAdmin && (
                      <TooltipContent side="left" className="max-w-xs z-[100]">
                        <p>Deletion of period is disabled for the admin account to prevent accidental removal of the demo account.</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3 relative z-10">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10 group-hover:border-emerald-500/20 transition-all">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                  <div className="p-0.5 bg-emerald-500/10 rounded">
                    <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />
                  </div>
                  <span className="font-medium">Income</span>
                </div>
                <p className="text-lg font-bold text-emerald-400">
                  {formatCurrency(month.totalIncome, currency)}
                </p>
              </div>
              
              <div className="p-2 bg-red-500/5 rounded-lg border border-red-500/10 group-hover:border-red-500/20 transition-all">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                  <div className="p-0.5 bg-red-500/10 rounded">
                    <TrendingDown className="w-2.5 h-2.5 text-red-400" />
                  </div>
                  <span className="font-medium">Expense</span>
                </div>
                <p className="text-lg font-bold text-red-400">
                  {formatCurrency(month.totalExpense, currency)}
                </p>
              </div>
            </div>
            
            <div className="pt-2 border-t border-slate-700/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Wallet className="w-3 h-3" />
                  <span className="font-medium">Carry Forward</span>
                </div>
                <Badge 
                  variant={isPositive ? 'success' : 'destructive'} 
                  className={`text-xs font-bold ${
                    isPositive 
                      ? 'bg-blue-500/10 text-blue-400 border-blue-400/30' 
                      : 'bg-orange-500/10 text-orange-400 border-orange-400/30'
                  }`}
                >
                  {isPositive ? '+' : ''}{formatCurrency(month.carryForward, currency)}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Savings Rate</span>
                  <span className={`font-semibold ${
                    savingsRate >= 30 ? 'text-emerald-400' : 
                    savingsRate >= 10 ? 'text-blue-400' : 
                    'text-slate-400'
                  }`}>
                    {savingsRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-700/30 rounded-full h-1 overflow-hidden">
                  <div 
                    className={`h-1 rounded-full transition-all duration-500 ${
                      savingsRate >= 30 ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 
                      savingsRate >= 10 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 
                      'bg-gradient-to-r from-slate-500 to-slate-600'
                    }`}
                    style={{ width: `${Math.min(Math.abs(savingsRate), 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Month"
        description={`Are you sure you want to delete ${month.monthName}? This will permanently remove all income and expense data for this period. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </>
  );
}

