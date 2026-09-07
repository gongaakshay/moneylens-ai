import { IncomeEntry, ExpenseEntry } from "@/types";
import { formatCurrency } from "@/utils/calculations";
import { Button } from "@/components/ui/button";
import { ValidatedInput } from "@/components/ui/validated-input";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, Pencil, Trash2, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface BreakdownTooltipProps {
  entries: (IncomeEntry | ExpenseEntry)[] | undefined;
  currency: "USD" | "INR";
  type: "income" | "expense";
  maxPreviewEntries?: number;
  onEdit?: (
    entryId: string,
    amount: number,
    note: string,
    tag?: "need" | "want" | "neutral"
  ) => Promise<void>;
  onDelete?: (entryId: string) => Promise<void>;
}

export function BreakdownTooltip({
  entries,
  currency,
  type,
  onEdit,
  onDelete,
}: BreakdownTooltipProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<
    (IncomeEntry | ExpenseEntry) | null
  >(null);
  const [deletingEntry, setDeletingEntry] = useState<
    (IncomeEntry | ExpenseEntry) | null
  >(null);
  const [editForm, setEditForm] = useState({
    amount: "",
    note: "",
    tag: "neutral" as "need" | "want" | "neutral",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!entries || entries.length === 0) {
    return <span className="text-slate-500 text-sm italic">No entries</span>;
  }

  const hasTag = (entry: any): entry is ExpenseEntry => "tag" in entry;

  const handleEdit = (entry: IncomeEntry | ExpenseEntry) => {
    setEditingEntry(entry);
    setEditForm({
      amount: entry.amount.toString(),
      note: entry.note,
      tag: hasTag(entry) ? entry.tag || "neutral" : "neutral",
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingEntry || !onEdit) return;

    const amount = parseFloat(editForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }

    if (!editForm.note.trim()) {
      toast.error("Please enter a note");
      return;
    }

    setIsSubmitting(true);
    try {
      await onEdit(
        editingEntry.id,
        amount,
        editForm.note.trim(),
        type === "expense" ? editForm.tag : undefined
      );
      setEditDialogOpen(false);
      setEditingEntry(null);
      toast.success("Entry updated successfully");
    } catch (error) {
      console.error("Failed to edit entry:", error);
      toast.error("Failed to edit entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (entry: IncomeEntry | ExpenseEntry) => {
    if (!onDelete) return;

    try {
      await onDelete(entry.id);
      toast.success("Entry deleted successfully");
      setDeleteDialogOpen(false);
      setDeletingEntry(null);
    } catch (error) {
      console.error("Failed to delete entry:", error);
      toast.error("Failed to delete entry. Please try again.");
    }
  };

  // Format full breakdown text with all entries
  const formatBreakdown = (entries: (IncomeEntry | ExpenseEntry)[]) => {
    return entries
      .map((entry) => {
        const tagIndicator = hasTag(entry)
          ? entry.tag === "need"
            ? "🔴"
            : entry.tag === "want"
            ? "🟡"
            : "⚪"
          : "";
        return `${tagIndicator} ${entry.amount}(${entry.note || "No note"})`;
      })
      .join(" + ");
  };

  // Render entry table (shared between tooltip and dialog)
  const renderEntryTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left py-2 px-3 text-slate-400 font-medium">
              Description
            </th>
            <th className="text-right py-2 px-3 text-slate-400 font-medium">
              Amount
            </th>
            {(onEdit || onDelete) && (
              <th className="text-right py-2 px-3 text-slate-400 font-medium">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="max-h-64 overflow-y-auto">
          {entries.map((entry, index) => (
            <tr
              key={entry.id || index}
              className="border-b border-slate-700/50 last:border-0 hover:bg-slate-700/30"
            >
              <td className="py-2 px-3 text-slate-200">
                <div className="flex items-center gap-2">
                  {type === "expense" && hasTag(entry) && (
                    <span className="text-base leading-none">
                      {entry.tag === "need"
                        ? "🔴"
                        : entry.tag === "want"
                        ? "🟡"
                        : "⚪"}
                    </span>
                  )}
                  <span>{entry.note || "No note"}</span>
                </div>
              </td>
              <td
                className={`py-2 px-3 text-right font-mono font-semibold ${
                  type === "income"
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {formatCurrency(entry.amount, currency)}
              </td>
              {(onEdit || onDelete) && (
                <td className="py-2 px-3 text-right">
                  <div className="flex gap-1 justify-end">
                    {onEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(entry);
                        }}
                        className="p-1.5 hover:bg-blue-500/20 text-blue-400 rounded transition-colors"
                        title="Edit entry"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingEntry(entry);
                          setDeleteDialogOpen(true);
                        }}
                        className="p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t border-slate-600 bg-slate-800/50">
          <tr>
            <td
              colSpan={1 + (onEdit || onDelete ? 1 : 0)}
              className="py-2 px-3 text-slate-400 font-medium text-xs"
            >
              Total ({entries.length}{" "}
              {entries.length === 1 ? "entry" : "entries"})
            </td>
            <td
              className={`py-2 px-3 text-right font-mono font-bold ${
                type === "income"
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {formatCurrency(
                entries.reduce((sum, entry) => sum + entry.amount, 0),
                currency
              )}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );

  return (
    <>
      {/* Mobile: Clickable cell that opens dialog */}
      {isMobile ? (
        <button
          onClick={() => setViewDialogOpen(true)}
          className="flex items-center gap-2 cursor-pointer hover:bg-slate-700/30 active:bg-slate-700/50 rounded px-2 py-1 -mx-2 -my-1 transition-colors w-full text-left"
        >
          <span className="text-slate-400 font-mono text-sm">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </span>
          <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
        </button>
      ) : (
        // Desktop: Hover tooltip
        <TooltipProvider>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help group">
                <span className="text-slate-400 font-mono text-sm break-words">
                  {formatBreakdown(entries)}
                </span>
                <Info className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-400 transition-colors flex-shrink-0" />
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              align="start"
              className="max-w-2xl p-0 bg-slate-800 border-slate-600 shadow-xl"
            >
              <div className="p-4">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-3">
                  Transaction Details (Click icons to edit/delete)
                </div>
                {renderEntryTable()}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Mobile: View Entries Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {type === "income" ? "Income" : "Expense"} Entries
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {onEdit || onDelete
                ? "Tap the icons to edit or delete individual entries."
                : "View all transaction entries for this category."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {renderEntryTable()}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setViewDialogOpen(false)}
              className="text-slate-400"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>
              Edit {type === "income" ? "Income" : "Expense"} Entry
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Update the entry details below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-amount" className="text-slate-300">
                Amount ({currency === "INR" ? "₹" : "$"})
              </Label>
              <ValidatedInput
                id="edit-amount"
                type="number"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm({ ...editForm, amount: e.target.value })
                }
                className="bg-slate-800 border-slate-700 text-white"
                min="0"
                step="0.01"
                inputMode="decimal"
                disabled={isSubmitting}
                autoFocus
                realTimeValidation={true}
                validation={(value) => {
                  const num = parseFloat(value);
                  if (!value) return "Amount is required";
                  if (isNaN(num)) return "Please enter a valid number";
                  if (num <= 0) return "Amount must be greater than 0";
                  return null;
                }}
                onEnter={handleSaveEdit}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-note" className="text-slate-300">
                Note
              </Label>
              <ValidatedInput
                id="edit-note"
                value={editForm.note}
                onChange={(e) =>
                  setEditForm({ ...editForm, note: e.target.value })
                }
                className="bg-slate-800 border-slate-700 text-white"
                disabled={isSubmitting}
                maxLength={100}
                validation={(value) => {
                  if (!value.trim()) return "Note is required";
                  if (value.length < 3) return "Note must be at least 3 characters";
                  return null;
                }}
                showClearButton
                onClear={() => setEditForm({ ...editForm, note: "" })}
                onEnter={handleSaveEdit}
              />
            </div>

            {type === "expense" && (
              <div className="space-y-2">
                <Label htmlFor="edit-tag" className="text-slate-300">
                  Tag
                </Label>
                <Select
                  value={editForm.tag}
                  onValueChange={(value: "need" | "want" | "neutral") =>
                    setEditForm({ ...editForm, tag: value })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
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
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setEditDialogOpen(false);
                setEditingEntry(null);
              }}
              className="text-slate-400"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className={
                type === "income"
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "bg-red-500 hover:bg-red-600"
              }
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Entry Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Entry"
        description={
          deletingEntry
            ? `Are you sure you want to delete this entry: ${formatCurrency(
                deletingEntry.amount,
                currency
              )} - ${deletingEntry.note}?`
            : "Are you sure you want to delete this entry?"
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          if (deletingEntry) {
            handleDelete(deletingEntry);
          }
        }}
      />
    </>
  );
}
