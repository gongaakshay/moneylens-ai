import { useState } from "react";
import { ExpenseItem, ExpenseEntry } from "@/types";
import { useApp } from "@/context/AppContext";
import { useTableControls } from "@/hooks/useTableControls";
import { useDialogState } from "@/hooks/useDialogState";
import { useFormState } from "@/hooks/useFormState";
import { useTransactionForm } from "@/hooks/useTransactionForm";
import { formatCurrency } from "@/utils/calculations";
import { EXPENSE_CATEGORIES } from "@/constants/categories";
import { Button } from "@/components/ui/button";
import { ValidatedInput } from "@/components/ui/validated-input";
import { Label } from "@/components/ui/label";
import { CategorySelect } from "@/components/shared/CategorySelect";
import { TagFilter } from "@/components/shared/TagFilter";
import { SortableHeader } from "@/components/shared/SortableHeader";
import { TableControls } from "@/components/shared/TableControls";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Plus, Trash2 } from "lucide-react";
import { CategoryIcon } from "@/components/Tables/CategoryIcon";
import { BreakdownTooltip } from "@/components/Tables/BreakdownTooltip";
import { toast } from "sonner";

interface ExpenseSectionProps {
  monthId: string;
  expenses: ExpenseItem[];
  totalExpense: number;
}

interface ExpenseFormData {
  category: string;
  amount: string;
  note: string;
  tag: "need" | "want" | "neutral";
  isRecurring: boolean;
}

export function ExpenseSection({
  monthId,
  expenses,
  totalExpense,
}: ExpenseSectionProps) {
  const {
    addExpenseEntry,
    deleteExpense,
    editExpenseEntry,
    deleteExpenseEntry,
    currency,
    createRecurringExpense,
  } = useApp();

  const {
    isOpen: isAddDialogOpen,
    openDialog,
    closeDialog,
    setIsOpen: setIsAddDialogOpen,
  } = useDialogState();

  const { formData, setFormData, resetForm } = useFormState<ExpenseFormData>({
    category: "",
    amount: "",
    note: "",
    tag: "neutral",
    isRecurring: false,
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    expense: ExpenseItem | null;
  }>({ open: false, expense: null });

  const groupedExpenses = (expenses || []).reduce((acc, expense) => {
    const existing = acc.find((e) => e.category === expense.category);
    if (existing) {
      if (expense.entries && expense.entries.length > 0) {
        existing.entries = [...(existing.entries || []), ...expense.entries];
      } else if (expense.amount > 0 || expense.comment) {
        existing.entries = existing.entries || [];
        existing.entries.push({
          id: expense.id,
          amount: expense.amount,
          note: expense.comment,
        });
      }
      existing.amount += expense.amount;
    } else {
      const entries: ExpenseEntry[] =
        expense.entries && expense.entries.length > 0
          ? expense.entries
          : expense.amount > 0 || expense.comment
          ? [
              {
                id: expense.id,
                amount: expense.amount,
                note: expense.comment,
              },
            ]
          : [];

      acc.push({
        ...expense,
        entries,
      });
    }
    return acc;
  }, [] as ExpenseItem[]);

  const displayExpenses = groupedExpenses.filter(
    (expense) =>
      expense.amount > 0 || (expense.entries && expense.entries.length > 0)
  );

  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    sortOrder,
    handleSort,
    filters,
    toggleFilter,
    clearFilters,
    processedData,
    hasActiveFilters,
  } = useTableControls({
    data: displayExpenses,
    searchFields: ["category", "entries"],
  });

  const tagFilter = filters.get("tag") || new Set();

  const { validateAndSubmit } = useTransactionForm(
    async (data) => {
      await addExpenseEntry(
        monthId,
        data.category,
        data.amount,
        data.note,
        data.tag
      );

      if (formData.isRecurring) {
        await createRecurringExpense(
          data.category,
          data.amount,
          data.note,
          data.tag!
        );
      }
    },
    () => {
      resetForm();
      closeDialog();
      toast.success("Expense added successfully");
    }
  );

  const handleAddExpense = async () => {
    await validateAndSubmit(formData);
  };

  const handleDeleteCategory = async (expense: ExpenseItem) => {
    try {
      await deleteExpense(expense.id, monthId);
      toast.success(`Expense category "${expense.category}" deleted`);
      setDeleteDialog({ open: false, expense: null });
    } catch (error) {
      console.error("Failed to delete expense:", error);
      toast.error("Failed to delete expense. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold text-white">Expenses</h3>
        <Button
          onClick={openDialog}
          size="sm"
          className="bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all duration-200 hover:shadow-red-500/30"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Expense
        </Button>
      </div>

      <TableControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search by category or note..."
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />

      {processedData.length > 0 && (
        <div className="text-xs text-slate-500 flex items-center gap-1">
          <span className="hidden md:inline">
            💡 Tip: Hover over breakdown to view and edit entries
          </span>
          <span className="md:hidden">
            💡 Tip: Tap breakdown to view and edit entries
          </span>
        </div>
      )}

      <TagFilter
        tagFilter={tagFilter as Set<"need" | "want" | "neutral">}
        onToggleTag={(tag) => toggleFilter("tag", tag)}
      />

      <div className="rounded-lg border border-slate-700/50 overflow-hidden shadow-xl">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700/50 hover:bg-slate-800/50 bg-slate-800/30">
              <TableHead
                className="text-slate-300 font-semibold cursor-pointer hover:text-red-400 transition-colors select-none w-1/4"
                onClick={() => handleSort("category")}
              >
                <SortableHeader
                  label="Category"
                  column="category"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead
                className="text-slate-300 text-right font-semibold cursor-pointer hover:text-red-400 transition-colors select-none w-32"
                onClick={() => handleSort("amount")}
              >
                <SortableHeader
                  label="Amount"
                  column="amount"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  className="justify-end"
                />
              </TableHead>
              <TableHead className="text-slate-300 font-semibold">
                <div className="flex items-center gap-1">
                  <span>Breakdown</span>
                  <span className="hidden md:inline text-xs text-slate-500 font-normal">
                    (hover to view)
                  </span>
                  <span className="md:hidden text-xs text-slate-500 font-normal">
                    (tap to view)
                  </span>
                </div>
              </TableHead>
              <TableHead className="text-slate-300 text-right w-20 font-semibold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedData.length === 0 ? (
              <TableRow className="border-slate-700/50 hover:bg-transparent">
                <TableCell
                  colSpan={4}
                  className="text-center text-slate-400 py-12"
                >
                  {searchQuery || tagFilter.size > 0 ? (
                    <div className="space-y-2">
                      <div className="text-lg">No results found</div>
                      <div className="text-sm">Try adjusting your filters</div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-lg">No expense entries yet</div>
                      <div className="text-sm">
                        Click "Add Expense" to get started
                      </div>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              processedData.map((expense, index) => (
                <TableRow
                  key={expense.id}
                  className="border-slate-700/50 hover:bg-gradient-to-r hover:from-slate-800/80 hover:to-slate-800/50 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-200 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell className="text-white font-medium">
                    <div className="flex items-center gap-3">
                      <CategoryIcon
                        category={expense.category}
                        type="expense"
                      />
                      <span className="text-sm">{expense.category}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-red-400 text-right font-semibold font-mono text-base">
                    {formatCurrency(expense.amount, currency)}
                  </TableCell>
                  <TableCell>
                    <BreakdownTooltip
                      entries={expense.entries}
                      currency={currency}
                      type="expense"
                      maxPreviewEntries={2}
                      onEdit={async (entryId, amount, note, tag) => {
                        try {
                          await editExpenseEntry(
                            entryId,
                            monthId,
                            amount,
                            note,
                            tag
                          );
                        } catch (error) {
                          console.error("Failed to edit expense entry:", error);
                        }
                      }}
                      onDelete={async (entryId) => {
                        try {
                          await deleteExpenseEntry(entryId, monthId);
                        } catch (error) {
                          console.error(
                            "Failed to delete expense entry:",
                            error
                          );
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 opacity-50 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                      onClick={() => setDeleteDialog({ open: true, expense })}
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter className="bg-slate-800/50 backdrop-blur-sm">
            <TableRow className="border-slate-700/50 hover:bg-slate-800/70">
              <TableCell className="text-white font-semibold">Total</TableCell>
              <TableCell className="text-red-400 text-right font-bold text-lg font-mono">
                {formatCurrency(totalExpense, currency)}
              </TableCell>
              <TableCell colSpan={2}>
                <div className="text-xs text-slate-500 text-right">
                  {displayExpenses.length}{" "}
                  {displayExpenses.length === 1 ? "category" : "categories"}
                  {(searchQuery || tagFilter.size > 0) &&
                    ` • ${processedData.length} visible`}
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription className="text-slate-400">
              Enter the expense details. You can add multiple entries to the
              same category.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-slate-300">
                Category
              </Label>
              <CategorySelect
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
                categories={EXPENSE_CATEGORIES}
                type="expense"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-slate-300">
                Amount (₹)
              </Label>
              <ValidatedInput
                id="amount"
                type="number"
                placeholder="e.g., 1619"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="bg-slate-800 border-slate-700 text-white"
                min="0"
                step="0.01"
                inputMode="decimal"
                realTimeValidation={true}
                validation={(value) => {
                  const num = parseFloat(value);
                  if (!value) return "Amount is required";
                  if (isNaN(num)) return "Please enter a valid number";
                  if (num <= 0) return "Amount must be greater than 0";
                  return null;
                }}
                onEnter={handleAddExpense}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note" className="text-slate-300">
                Note
              </Label>
              <ValidatedInput
                id="note"
                placeholder="e.g., IRCTC, Uber ride, Grocery store"
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                className="bg-slate-800 border-slate-700 text-white"
                maxLength={100}
                validation={(value) => {
                  if (!value.trim()) return "Note is required";
                  if (value.length < 3)
                    return "Note must be at least 3 characters";
                  return null;
                }}
                showClearButton
                onClear={() => setFormData({ ...formData, note: "" })}
                onEnter={handleAddExpense}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tag" className="text-slate-300">
                Tag
              </Label>
              <Select
                value={formData.tag}
                onValueChange={(value: "need" | "want" | "neutral") =>
                  setFormData({ ...formData, tag: value })
                }
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Select a tag" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem
                    value="need"
                    className="text-white focus:bg-slate-700 focus:text-white"
                  >
                    🔴 Need
                  </SelectItem>
                  <SelectItem
                    value="want"
                    className="text-white focus:bg-slate-700 focus:text-white"
                  >
                    🟡 Want
                  </SelectItem>
                  <SelectItem
                    value="neutral"
                    className="text-white focus:bg-slate-700 focus:text-white"
                  >
                    ⚪ Neutral
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) =>
                    setFormData({ ...formData, isRecurring: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                />
                <Label
                  htmlFor="isRecurring"
                  className="text-slate-300 cursor-pointer"
                >
                  Make it recurring (auto-add to future months)
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                closeDialog();
                resetForm();
              }}
              className="text-slate-400 "
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddExpense}
              className="bg-red-500 hover:bg-red-600"
            >
              Add Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, expense: deleteDialog.expense })
        }
        title="Delete Expense Category"
        description={`Are you sure you want to delete all "${deleteDialog.expense?.category}" expenses? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          if (deleteDialog.expense) {
            handleDeleteCategory(deleteDialog.expense);
          }
        }}
      />
    </div>
  );
}
