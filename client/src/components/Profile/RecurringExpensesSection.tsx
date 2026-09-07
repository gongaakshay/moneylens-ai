import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { RecurringExpensesSkeleton } from "@/components/Skeletons/RecurringExpensesSkeleton";
import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/utils/calculations";
import type { RecurringExpense } from "@/types";
import { toast } from "sonner";

interface RecurringExpensesSectionProps {
  recurringExpenses: RecurringExpense[];
  currency: "USD" | "INR";
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
  onEdit: (expense: RecurringExpense) => void;
}

export function RecurringExpensesSection({
  recurringExpenses,
  currency,
  isLoading,
  onDelete,
  onEdit,
}: RecurringExpensesSectionProps) {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    expense: RecurringExpense | null;
  }>({ open: false, expense: null });

  const handleDelete = async (expense: RecurringExpense) => {
    try {
      await onDelete(expense._id);
      toast.success(`Recurring expense "${expense.category}" deleted`);
      setDeleteDialog({ open: false, expense: null });
    } catch (_error) {
      console.error("Failed to delete recurring expense:", _error);
      toast.error("Failed to delete. Please try again.");
    }
  };

  return (
    <>
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Recurring Expenses</CardTitle>
          <CardDescription className="text-slate-400">
            These expenses will be automatically added when you create a new
            month
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <RecurringExpensesSkeleton />
          ) : recurringExpenses.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No recurring expenses yet. Mark an expense as recurring when
              creating it.
            </div>
          ) : (
            <div className="space-y-2">
              {recurringExpenses.map((expense) => (
                <div
                  key={expense._id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-slate-900/50 rounded-lg border border-slate-700/30"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white break-words">
                        {expense.category}
                      </span>
                      <span className="text-xs flex-shrink-0">
                        {expense.tag === "need"
                          ? "🔴"
                          : expense.tag === "want"
                          ? "🟡"
                          : "⚪"}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-400 mt-1 break-words">
                      {expense.note}
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 flex-shrink-0">
                    <span className="font-semibold text-red-400 text-base sm:text-base whitespace-nowrap">
                      {formatCurrency(expense.amount, currency)}
                    </span>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(expense)}
                        className="h-8 w-8 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 flex-shrink-0"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setDeleteDialog({ open: true, expense })
                        }
                        className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm">
                  <span className="text-slate-400">
                    Total recurring per month:
                  </span>
                  <span className="font-bold text-red-400 text-base sm:text-lg">
                    {formatCurrency(
                      recurringExpenses.reduce((sum, e) => sum + e.amount, 0),
                      currency
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, expense: deleteDialog.expense })
        }
        title="Delete Recurring Expense"
        description={`Are you sure you want to delete the recurring expense "${deleteDialog.expense?.category}"? This will not affect existing month entries.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          if (deleteDialog.expense) {
            handleDelete(deleteDialog.expense);
          }
        }}
      />
    </>
  );
}

