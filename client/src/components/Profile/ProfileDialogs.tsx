import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SECURITY_QUESTIONS } from "@/constants/securityQuestions";
import { EXPENSE_CATEGORIES } from "@/constants/categories";
import { ShieldCheck, AlertTriangle, Loader2 } from "lucide-react";
import { CategoryIcon } from "@/components/Tables/CategoryIcon";
import type { RecurringExpense } from "@/types";

interface ProfileDialogsProps {
  // Security Question Dialog
  securityQuestionDialogOpen: boolean;
  setSecurityQuestionDialogOpen: (open: boolean) => void;
  currentSecurityQuestion: string;
  newSecurityQuestion: string;
  setNewSecurityQuestion: (question: string) => void;
  newSecurityAnswer: string;
  setNewSecurityAnswer: (answer: string) => void;
  securityPassword: string;
  setSecurityPassword: (password: string) => void;
  isUpdatingSecurity: boolean;
  onUpdateSecurityQuestion: (e: React.FormEvent) => void;

  // Edit Recurring Expense Dialog
  editingExpense: RecurringExpense | null;
  setEditingExpense: (expense: RecurringExpense | null) => void;
  editForm: {
    category: string;
    amount: number;
    note: string;
    tag: "need" | "want" | "neutral";
  };
  setEditForm: (form: {
    category: string;
    amount: number;
    note: string;
    tag: "need" | "want" | "neutral";
  }) => void;
  onEditSubmit: () => void;
}

export function ProfileDialogs({
  securityQuestionDialogOpen,
  setSecurityQuestionDialogOpen,
  currentSecurityQuestion,
  newSecurityQuestion,
  setNewSecurityQuestion,
  newSecurityAnswer,
  setNewSecurityAnswer,
  securityPassword,
  setSecurityPassword,
  isUpdatingSecurity,
  onUpdateSecurityQuestion,
  editingExpense,
  setEditingExpense,
  editForm,
  setEditForm,
  onEditSubmit,
}: ProfileDialogsProps) {
  return (
    <>
      {/* Security Question Update Dialog */}
      <Dialog
        open={securityQuestionDialogOpen}
        onOpenChange={setSecurityQuestionDialogOpen}
      >
        <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Change Security Question
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Update your security question and answer for account recovery.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onUpdateSecurityQuestion}>
            {/* Warning Banner */}
            <div className="rounded-lg bg-amber-900/20 border border-amber-600/30 p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-amber-200">
                    🔐 Important:
                  </p>
                  <p className="text-sm text-amber-200/90">
                    Changing your security question requires your current
                    password for verification. Make sure to remember your new
                    answer!
                  </p>
                </div>
              </div>
            </div>

            {currentSecurityQuestion && (
              <div className="rounded-lg bg-slate-700/30 border border-slate-600/50 p-3 mb-4">
                <Label className="text-xs text-slate-400">
                  Current Question
                </Label>
                <p className="text-sm text-slate-300 mt-1">
                  {currentSecurityQuestion}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-security-question" className="text-slate-300">
                  New Security Question *
                </Label>
                <Select
                  value={newSecurityQuestion}
                  onValueChange={setNewSecurityQuestion}
                >
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white focus:border-emerald-500 focus:ring-emerald-500/20">
                    <SelectValue placeholder="Select a security question" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {SECURITY_QUESTIONS.map((q) => (
                      <SelectItem
                        key={q}
                        value={q}
                        className="text-white focus:bg-slate-700 focus:text-white"
                      >
                        {q}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-security-answer" className="text-slate-300">
                  Your Answer *{" "}
                  <span className="text-xs text-slate-500">
                    (min. 3 characters)
                  </span>
                </Label>
                <Input
                  id="new-security-answer"
                  type="text"
                  placeholder="Enter your answer"
                  value={newSecurityAnswer}
                  onChange={(e) => setNewSecurityAnswer(e.target.value)}
                  required
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
                <p className="text-xs text-slate-500">
                  Answers are not case-sensitive. Keep it simple and memorable.
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="security-current-password"
                  className="text-slate-300"
                >
                  Current Password *
                </Label>
                <Input
                  id="security-current-password"
                  type="password"
                  placeholder="Enter your current password"
                  value={securityPassword}
                  onChange={(e) => setSecurityPassword(e.target.value)}
                  required
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 mt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSecurityQuestionDialogOpen(false);
                  setNewSecurityAnswer("");
                  setSecurityPassword("");
                }}
                disabled={isUpdatingSecurity}
                className="text-slate-400 hover:text-white hover:bg-slate-700/50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdatingSecurity}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold"
              >
                {isUpdatingSecurity ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Security Question"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Recurring Expense Dialog */}
      <Dialog
        open={!!editingExpense}
        onOpenChange={(open) => !open && setEditingExpense(null)}
      >
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Edit Recurring Expense</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update the details of this recurring expense
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category" className="text-slate-300">
                Category
              </Label>
              <Select
                value={editForm.category}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, category: value })
                }
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem
                      key={cat}
                      value={cat}
                      className="text-white focus:bg-slate-700 focus:text-white"
                    >
                      <div className="flex items-center gap-2">
                        <CategoryIcon
                          category={cat}
                          type="expense"
                          className="w-4 h-4"
                        />
                        <span>{cat}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-amount" className="text-slate-300">
                Amount
              </Label>
              <Input
                id="edit-amount"
                type="number"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm({ ...editForm, amount: Number(e.target.value) })
                }
                className="bg-slate-900/50 border-slate-600 text-white"
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-note" className="text-slate-300">
                Note
              </Label>
              <Input
                id="edit-note"
                value={editForm.note}
                onChange={(e) =>
                  setEditForm({ ...editForm, note: e.target.value })
                }
                className="bg-slate-900/50 border-slate-600 text-white"
                placeholder="Add a note"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tag" className="text-slate-300">
                Tag
              </Label>
              <Select
                value={editForm.tag}
                onValueChange={(value: "need" | "want" | "neutral") =>
                  setEditForm({ ...editForm, tag: value })
                }
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="need" className="text-white">
                    🔴 Need
                  </SelectItem>
                  <SelectItem value="want" className="text-white">
                    🟡 Want
                  </SelectItem>
                  <SelectItem value="neutral" className="text-white">
                    ⚪ Neutral
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setEditingExpense(null)}
              className="text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              Cancel
            </Button>
            <Button
              onClick={onEditSubmit}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

