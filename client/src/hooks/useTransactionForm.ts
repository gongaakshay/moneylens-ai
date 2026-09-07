import { useCallback } from "react";
import { toast } from "sonner";

interface TransactionFormData {
  category: string;
  amount: string;
  note: string;
  tag?: "need" | "want" | "neutral";
}

export function useTransactionForm(
  onSubmit: (data: {
    category: string;
    amount: number;
    note: string;
    tag?: "need" | "want" | "neutral";
  }) => Promise<void>,
  onSuccess?: () => void
) {
  const validateAndSubmit = useCallback(
    async (formData: TransactionFormData) => {
      // Validation
      if (!formData.category.trim()) {
        toast.error("Please select a category");
        return false;
      }

      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        toast.error("Please enter a valid amount greater than 0");
        return false;
      }

      if (!formData.note.trim()) {
        toast.error("Please enter a note");
        return false;
      }

      try {
        await onSubmit({
          category: formData.category.trim(),
          amount,
          note: formData.note.trim(),
          tag: formData.tag,
        });
        onSuccess?.();
        return true;
      } catch (error) {
        console.error("Failed to submit transaction:", error);
        toast.error("Failed to save. Please try again.");
        return false;
      }
    },
    [onSubmit, onSuccess]
  );

  return { validateAndSubmit };
}

