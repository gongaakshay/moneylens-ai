import { useState } from "react";
import { IncomeItem } from "@/types";
import { useApp } from "@/context/AppContext";
import { useTableControls } from "@/hooks/useTableControls";
import { useDialogState } from "@/hooks/useDialogState";
import { useFormState } from "@/hooks/useFormState";
import { useTransactionForm } from "@/hooks/useTransactionForm";
import { formatCurrency } from "@/utils/calculations";
import { INCOME_CATEGORIES } from "@/constants/categories";
import { Button } from "@/components/ui/button";
import { ValidatedInput } from "@/components/ui/validated-input";
import { Label } from "@/components/ui/label";
import { CategorySelect } from "@/components/shared/CategorySelect";
import { SortableHeader } from "@/components/shared/SortableHeader";
import { TableControls } from "@/components/shared/TableControls";
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
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { CategoryIcon } from "@/components/Tables/CategoryIcon";
import { BreakdownTooltip } from "@/components/Tables/BreakdownTooltip";

interface IncomeSectionProps {
  monthId: string;
  income: IncomeItem[];
  totalIncome: number;
}

interface IncomeFormData {
  category: string;
  amount: string;
  note: string;
}

export function IncomeSection({
  monthId,
  income,
  totalIncome,
}: IncomeSectionProps) {
  const { addIncomeEntry, deleteIncome, editIncomeEntry, deleteIncomeEntry, currency } = useApp();
  
  const { isOpen: isAddDialogOpen, openDialog, closeDialog, setIsOpen: setIsAddDialogOpen } = useDialogState();
  
  const {
    formData,
    setFormData,
    resetForm,
  } = useFormState<IncomeFormData>({
    category: "",
    amount: "",
    note: "",
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    item: IncomeItem | null;
  }>({ open: false, item: null });

  const groupedIncome = (income || []).reduce((acc, item) => {
    const existing = acc.find((i) => i.category === item.category);
    if (existing) {
      if (item.entries && item.entries.length > 0) {
        existing.entries = [...(existing.entries || []), ...item.entries];
      } else if (item.amount > 0 || item.comment) {
        existing.entries = existing.entries || [];
        existing.entries.push({
          id: item.id,
          amount: item.amount,
          note: item.comment,
        });
      }
      existing.amount += item.amount;
    } else {
      const entries =
        item.entries && item.entries.length > 0
          ? item.entries
          : item.amount > 0 || item.comment
          ? [
              {
                id: item.id,
                amount: item.amount,
                note: item.comment,
              },
            ]
          : [];

      acc.push({
        ...item,
        entries,
      });
    }
    return acc;
  }, [] as any[]);

  const displayIncome = groupedIncome.filter(
    (item) => item.amount > 0 || (item.entries && item.entries.length > 0)
  );
  
  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    sortOrder,
    handleSort,
    clearFilters,
    processedData,
    hasActiveFilters,
  } = useTableControls({
    data: displayIncome,
    searchFields: ["category", "entries"],
  });

  const { validateAndSubmit } = useTransactionForm(
    async (data) => {
      await addIncomeEntry(monthId, data.category, data.amount, data.note);
    },
    () => {
      resetForm();
      closeDialog();
      toast.success("Income added successfully");
    }
  );

  const handleAddIncome = async () => {
    await validateAndSubmit(formData);
  };

  const handleDeleteCategory = async (item: IncomeItem) => {
    try {
      await deleteIncome(item.id, monthId);
      toast.success(`Income category "${item.category}" deleted`);
      setDeleteDialog({ open: false, item: null });
    } catch (error) {
      console.error("Failed to delete income:", error);
      toast.error("Failed to delete income. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold text-white">Income</h3>
        <Button
          onClick={openDialog}
          size="sm"
          className="bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:shadow-emerald-500/30"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Income
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
          <span className="hidden md:inline">💡 Tip: Hover over breakdown to view and edit entries</span>
          <span className="md:hidden">💡 Tip: Tap breakdown to view and edit entries</span>
        </div>
      )}

      <div className="rounded-lg border border-slate-700/50 overflow-hidden shadow-xl">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700/50 hover:bg-slate-800/50 bg-slate-800/30">
              <TableHead
                className="text-slate-300 font-semibold cursor-pointer hover:text-emerald-400 transition-colors select-none w-1/4"
                onClick={() => handleSort("category")}
              >
                <SortableHeader
                  label="Category"
                  column="category"
                  sortBy={sortBy as string | null}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead
                className="text-slate-300 text-right font-semibold cursor-pointer hover:text-emerald-400 transition-colors select-none w-32"
                onClick={() => handleSort("amount")}
              >
                <SortableHeader
                  label="Amount"
                  column="amount"
                  sortBy={sortBy as string | null}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  className="justify-end"
                />
              </TableHead>
              <TableHead className="text-slate-300 font-semibold">
                <div className="flex items-center gap-1">
                  <span>Breakdown</span>
                  <span className="hidden md:inline text-xs text-slate-500 font-normal">(hover to view)</span>
                  <span className="md:hidden text-xs text-slate-500 font-normal">(tap to view)</span>
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
                  {searchQuery ? (
                    <div className="space-y-2">
                      <div className="text-lg">No results found</div>
                      <div className="text-sm">Try adjusting your search</div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-lg">No income entries yet</div>
                      <div className="text-sm">
                        Click "Add Income" to get started
                      </div>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              processedData.map((item, index) => (
                <TableRow
                  key={item.id}
                  className="border-slate-700/50 hover:bg-gradient-to-r hover:from-slate-800/80 hover:to-slate-800/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-200 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell className="text-white font-medium">
                    <div className="flex items-center gap-3">
                      <CategoryIcon category={item.category} type="income" />
                      <span className="text-sm">{item.category}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-emerald-400 text-right font-semibold font-mono text-base">
                    {formatCurrency(item.amount, currency)}
                  </TableCell>
                  <TableCell>
                    <BreakdownTooltip
                      entries={item.entries}
                      currency={currency}
                      type="income"
                      maxPreviewEntries={2}
                      onEdit={async (entryId, amount, note) => {
                        try {
                          await editIncomeEntry(entryId, monthId, amount, note);
                        } catch (error) {
                          console.error('Failed to edit income entry:', error);
                        }
                      }}
                      onDelete={async (entryId) => {
                        try {
                          await deleteIncomeEntry(entryId, monthId);
                        } catch (error) {
                          console.error('Failed to delete income entry:', error);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 opacity-50 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                      onClick={() => setDeleteDialog({ open: true, item })}
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
              <TableCell className="text-emerald-400 text-right font-bold text-lg font-mono">
                {formatCurrency(totalIncome, currency)}
              </TableCell>
              <TableCell colSpan={2}>
                <div className="text-xs text-slate-500 text-right">
                  {displayIncome.length}{" "}
                  {displayIncome.length === 1 ? "category" : "categories"}
                  {searchQuery && ` • ${processedData.length} visible`}
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Add New Income</DialogTitle>
            <DialogDescription className="text-slate-400">
              Enter the income details. You can add multiple entries to the same
              category.
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
                categories={INCOME_CATEGORIES}
                type="income"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-slate-300">
                Amount (₹)
              </Label>
              <ValidatedInput
                id="amount"
                type="number"
                placeholder="e.g., 50000"
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
                onEnter={handleAddIncome}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note" className="text-slate-300">
                Note
              </Label>
              <ValidatedInput
                id="note"
                placeholder="e.g., Monthly salary, Freelance project"
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                className="bg-slate-800 border-slate-700 text-white"
                maxLength={100}
                validation={(value) => {
                  if (!value.trim()) return "Note is required";
                  if (value.length < 3) return "Note must be at least 3 characters";
                  return null;
                }}
                showClearButton
                onClear={() => setFormData({ ...formData, note: "" })}
                onEnter={handleAddIncome}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                closeDialog();
                resetForm();
              }}
              className="text-slate-400"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddIncome}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              Add Income
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, item: deleteDialog.item })
        }
        title="Delete Income Category"
        description={`Are you sure you want to delete all "${deleteDialog.item?.category}" income entries? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          if (deleteDialog.item) {
            handleDeleteCategory(deleteDialog.item);
          }
        }}
      />
    </div>
  );
}
