import { Router, Request, Response } from "express";
import { monthDataService, InsightsService } from "../services";
import { logger } from "../config/logger";

const router = Router();

// Get all months data for a user
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }

    const userMonths = await monthDataService.getAllMonths(userId);
    res.json(userMonths);
  } catch (error) {
    logger.error("Error fetching months:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Get a specific month
router.get("/month/:monthId", async (req: Request, res: Response) => {
  try {
    const month = await monthDataService.getMonthById(req.params.monthId);
    res.json(month);
  } catch (error: any) {
    if (error.message === "MONTH_NOT_FOUND") {
      res.status(404).json({ error: "Month not found" });
    } else {
      logger.error("Error fetching month:", error);
      res.status(500).json({ error: "Failed to fetch month data" });
    }
  }
});

// Add new month
router.post("/month", async (req: Request, res: Response) => {
  try {
    const { userId, year, month } = req.body;
    if (!userId || !year || month === undefined) {
      res.status(400).json({ error: "userId, year, and month are required" });
      return;
    }

    const newMonth = await monthDataService.createMonth(userId, year, month);
    
    // Clear insights cache
    await InsightsService.clearUserCache(userId);
    
    res.status(201).json(newMonth);
  } catch (error: any) {
    if (error.message === "MONTH_EXISTS") {
      res.status(400).json({ error: "Month already exists" });
    } else {
      logger.error("Error creating month:", error);
      res.status(500).json({ error: "Failed to create month" });
    }
  }
});

// ========== Income Endpoints ==========

// Add income entry
router.post("/income/entry", async (req: Request, res: Response) => {
  try {
    const { monthId, category, amount, note } = req.body;
    if (!monthId || !category || amount === undefined) {
      res
        .status(400)
        .json({ error: "monthId, category, and amount are required" });
      return;
    }

    const month = await monthDataService.addIncomeEntry(
      monthId,
      category,
      amount,
      note
    );
    
    // Clear insights cache
    await InsightsService.clearMonthCache(month.userId, monthId);
    
    res.status(201).json(month);
  } catch (error: any) {
    if (error.message === "MONTH_NOT_FOUND") {
      res.status(404).json({ error: "Month not found" });
    } else {
      logger.error("Error adding income entry:", error);
      res.status(500).json({ error: "Failed to add income entry" });
    }
  }
});

// Update income entry
router.put("/income/entry/:entryId", async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;
    const { monthId, amount, note } = req.body;

    if (!monthId || amount === undefined) {
      res.status(400).json({ error: "monthId and amount are required" });
      return;
    }

    const month = await monthDataService.updateIncomeEntry(
      entryId,
      monthId,
      amount,
      note
    );
    
    // Clear insights cache
    await InsightsService.clearMonthCache(month.userId, monthId);
    
    res.json(month);
  } catch (error: any) {
    if (error.message === "MONTH_NOT_FOUND") {
      res.status(404).json({ error: "Month not found" });
    } else if (error.message === "ENTRY_NOT_FOUND") {
      res.status(404).json({ error: "Income entry not found" });
    } else {
      logger.error("Error updating income entry:", error);
      res.status(500).json({ error: "Failed to update income entry" });
    }
  }
});

// Delete income entry
router.delete("/income/entry/:entryId", async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;
    const { monthId } = req.body;

    if (!monthId) {
      res.status(400).json({ error: "monthId is required" });
      return;
    }

    const month = await monthDataService.deleteIncomeEntry(entryId, monthId);
    
    // Clear insights cache
    await InsightsService.clearMonthCache(month.userId, monthId);
    
    res.json(month);
  } catch (error: any) {
    if (error.message === "MONTH_NOT_FOUND") {
      res.status(404).json({ error: "Month not found" });
    } else if (error.message === "ENTRY_NOT_FOUND") {
      res.status(404).json({ error: "Income entry not found" });
    } else {
      logger.error("Error deleting income entry:", error);
      res.status(500).json({ error: "Failed to delete income entry" });
    }
  }
});

// Delete income category
router.delete("/income/:incomeId", async (req: Request, res: Response) => {
  try {
    const { incomeId } = req.params;
    const monthId = req.query.monthId as string;

    if (!monthId) {
      res.status(400).json({ error: "monthId is required" });
      return;
    }

    const month = await monthDataService.deleteIncomeCategory(incomeId, monthId);
    
    // Clear insights cache
    await InsightsService.clearMonthCache(month.userId, monthId);
    
    res.json(month);
  } catch (error: any) {
    if (error.message === "MONTH_NOT_FOUND") {
      res.status(404).json({ error: "Month not found" });
    } else {
      logger.error("Error deleting income:", error);
      res.status(500).json({ error: "Failed to delete income" });
    }
  }
});

// ========== Expense Endpoints ==========

// Add expense entry
router.post("/expense/entry", async (req: Request, res: Response) => {
  try {
    const { monthId, category, amount, note, tag } = req.body;
    if (!monthId || !category || amount === undefined) {
      res
        .status(400)
        .json({ error: "monthId, category, and amount are required" });
      return;
    }

    const month = await monthDataService.addExpenseEntry(
      monthId,
      category,
      amount,
      note,
      tag
    );
    
    // Clear insights cache
    await InsightsService.clearMonthCache(month.userId, monthId);
    
    res.status(201).json(month);
  } catch (error: any) {
    if (error.message === "MONTH_NOT_FOUND") {
      res.status(404).json({ error: "Month not found" });
    } else {
      logger.error("Error adding expense entry:", error);
      res.status(500).json({ error: "Failed to add expense entry" });
    }
  }
});

// Update expense entry
router.put("/expense/entry/:entryId", async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;
    const { monthId, amount, note, tag } = req.body;

    if (!monthId || amount === undefined) {
      res.status(400).json({ error: "monthId and amount are required" });
      return;
    }

    const month = await monthDataService.updateExpenseEntry(
      entryId,
      monthId,
      amount,
      note,
      tag
    );
    
    // Clear insights cache
    await InsightsService.clearMonthCache(month.userId, monthId);
    
    res.json(month);
  } catch (error: any) {
    if (error.message === "MONTH_NOT_FOUND") {
      res.status(404).json({ error: "Month not found" });
    } else if (error.message === "ENTRY_NOT_FOUND") {
      res.status(404).json({ error: "Expense entry not found" });
    } else {
      logger.error("Error updating expense entry:", error);
      res.status(500).json({ error: "Failed to update expense entry" });
    }
  }
});

// Delete expense entry
router.delete("/expense/entry/:entryId", async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;
    const { monthId } = req.body;

    if (!monthId) {
      res.status(400).json({ error: "monthId is required" });
      return;
    }

    const month = await monthDataService.deleteExpenseEntry(entryId, monthId);
    
    // Clear insights cache
    await InsightsService.clearMonthCache(month.userId, monthId);
    
    res.json(month);
  } catch (error: any) {
    if (error.message === "MONTH_NOT_FOUND") {
      res.status(404).json({ error: "Month not found" });
    } else if (error.message === "ENTRY_NOT_FOUND") {
      res.status(404).json({ error: "Expense entry not found" });
    } else {
      logger.error("Error deleting expense entry:", error);
      res.status(500).json({ error: "Failed to delete expense entry" });
    }
  }
});

// Delete expense category
router.delete("/expense/:expenseId", async (req: Request, res: Response) => {
  try {
    const { expenseId } = req.params;
    const monthId = req.query.monthId as string;

    if (!monthId) {
      res.status(400).json({ error: "monthId is required" });
      return;
    }

    const month = await monthDataService.deleteExpenseCategory(expenseId, monthId);
    
    // Clear insights cache
    await InsightsService.clearMonthCache(month.userId, monthId);
    
    res.json(month);
  } catch (error: any) {
    if (error.message === "MONTH_NOT_FOUND") {
      res.status(404).json({ error: "Month not found" });
    } else {
      logger.error("Error deleting expense:", error);
      res.status(500).json({ error: "Failed to delete expense" });
    }
  }
});

// Delete entire month
router.delete("/month/:monthId", async (req: Request, res: Response) => {
  try {
    const { monthId } = req.params;
    const userId = req.query.userId as string;

    if (!userId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }

    const result = await monthDataService.deleteMonth(monthId, userId);
    
    // Clear insights cache
    await InsightsService.clearMonthCache(userId, monthId);
    await InsightsService.clearUserCache(userId);
    
    res.json(result);
  } catch (error: any) {
    if (error.message === "MONTH_NOT_FOUND") {
      res.status(404).json({ error: "Month not found" });
    } else if (error.message === "ADMIN_DELETION_BLOCKED") {
      res.status(403).json({ error: "Deletion of period is disabled for the admin account to prevent accidental removal of the demo account." });
    } else {
      logger.error("Error deleting month:", error);
      res.status(500).json({ error: "Failed to delete month" });
    }
  }
});

export default router;
