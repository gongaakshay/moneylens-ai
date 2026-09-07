import { RecurringExpense } from "../models";
import { logger } from "../config/logger";

export class RecurringExpenseService {
  /**
   * Get all recurring expenses for a user
   */
  async getRecurringExpenses(userId: string) {
    const userRecurring = await RecurringExpense.find({ userId }).sort({
      createdAt: -1,
    });

    return userRecurring;
  }

  /**
   * Create a new recurring expense
   */
  async createRecurringExpense(
    userId: string,
    category: string,
    amount: number,
    note: string,
    tag: "need" | "want" | "neutral"
  ) {
    const newRecurring = await RecurringExpense.create({
      userId,
      category,
      amount: Number(amount),
      note: note || "",
      tag: tag || "neutral",
    });

    logger.info(
      `Recurring expense created: ${category} - ${amount} for user ${userId}`
    );

    return newRecurring;
  }

  /**
   * Update a recurring expense
   */
  async updateRecurringExpense(
    id: string,
    updates: {
      category?: string;
      amount?: number;
      note?: string;
      tag?: "need" | "want" | "neutral";
    }
  ) {
    const updateData: any = {};

    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.amount !== undefined)
      updateData.amount = Number(updates.amount);
    if (updates.note !== undefined) updateData.note = updates.note;
    if (updates.tag !== undefined) updateData.tag = updates.tag;

    const updated = await RecurringExpense.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated) {
      throw new Error("RECURRING_NOT_FOUND");
    }

    logger.info(`Recurring expense updated: ${id} - ${updates.category}`);

    return updated;
  }

  /**
   * Delete a recurring expense
   */
  async deleteRecurringExpense(id: string) {
    const deleted = await RecurringExpense.findByIdAndDelete(id);

    if (!deleted) {
      throw new Error("RECURRING_NOT_FOUND");
    }

    logger.info(`Recurring expense deleted: ${id} - ${deleted.category}`);

    return { success: true };
  }
}

// Export singleton instance
export const recurringExpenseService = new RecurringExpenseService();

