import { Router, Request, Response } from "express";
import { recurringExpenseService } from "../services";
import { logger } from "../config/logger";

const router = Router();

// Get all recurring expenses for a user
router.get("/", async (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  if (!userId) {
    res.status(400).json({ error: "userId is required" });
    return;
  }

  try {
    const recurring = await recurringExpenseService.getRecurringExpenses(userId);
    res.json(recurring);
  } catch (error) {
    logger.error("Error fetching recurring expenses:", error);
    res.status(500).json({ error: "Failed to fetch recurring expenses" });
  }
});

// Create recurring expense
router.post("/", async (req: Request, res: Response) => {
  const { userId, category, amount, note, tag } = req.body;
  if (!userId || !category || amount === undefined) {
    res
      .status(400)
      .json({ error: "userId, category, and amount are required" });
    return;
  }

  try {
    const newRecurring = await recurringExpenseService.createRecurringExpense(
      userId,
      category,
      amount,
      note,
      tag
    );
    res.status(201).json(newRecurring);
  } catch (error) {
    logger.error("Error creating recurring expense:", error);
    res.status(500).json({ error: "Failed to create recurring expense" });
  }
});

// Update recurring expense
router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { category, amount, note, tag } = req.body;

  try {
    const updated = await recurringExpenseService.updateRecurringExpense(id, {
      category,
      amount,
      note,
      tag,
    });
    res.json(updated);
  } catch (error: any) {
    if (error.message === "RECURRING_NOT_FOUND") {
      res.status(404).json({ error: "Recurring expense not found" });
    } else {
      logger.error("Error updating recurring expense:", error);
      res.status(500).json({ error: "Failed to update recurring expense" });
    }
  }
});

// Delete recurring expense
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await recurringExpenseService.deleteRecurringExpense(id);
    res.json(result);
  } catch (error: any) {
    if (error.message === "RECURRING_NOT_FOUND") {
      res.status(404).json({ error: "Recurring expense not found" });
    } else {
      logger.error("Error deleting recurring expense:", error);
      res.status(500).json({ error: "Failed to delete recurring expense" });
    }
  }
});

export default router;
