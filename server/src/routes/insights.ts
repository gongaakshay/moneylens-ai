import express, { Request, Response } from "express";
import { MonthData } from "../models";
import InsightsService from "../services/InsightsService";
import { logger } from "../config/logger";

const router = express.Router();

/**
 * GET /api/insights/overview?userId=xxx
 * Get overview insights across all months
 */
router.get("/overview", async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId is required" });
    }

    // Fetch all months for user
    const months = await MonthData.find({ userId }).sort({ year: 1, month: 1 });

    // Get insights (cached or generated)
    const insights = await InsightsService.getOverviewInsights(
      userId,
      months as any
    );

    res.json(insights);
  } catch (error) {
    logger.error("Error fetching overview insights:", error);
    res.status(500).json({ error: "Failed to fetch overview insights" });
  }
});

/**
 * GET /api/insights/month/:monthId?userId=xxx
 * Get monthly insights for a specific month
 */
router.get("/month/:monthId", async (req: Request, res: Response) => {
  try {
    const { monthId } = req.params;
    const { userId } = req.query;

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId is required" });
    }

    // Fetch the month data
    const monthData = await MonthData.findById(monthId);

    if (!monthData) {
      return res.status(404).json({ error: "Month not found" });
    }

    // Verify ownership
    if (monthData.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Fetch previous month for comparison
    const allMonths = await MonthData.find({ userId }).sort({
      year: 1,
      month: 1,
    });
    const currentIndex = allMonths.findIndex(
      (m) => m._id.toString() === monthId
    );
    const previousMonthData =
      currentIndex > 0 ? allMonths[currentIndex - 1] : undefined;

    // Get insights (cached or generated)
    const insights = await InsightsService.getMonthlyInsights(
      userId,
      monthId,
      monthData as any,
      previousMonthData as any
    );

    res.json(insights);
  } catch (error) {
    logger.error("Error fetching monthly insights:", error);
    res.status(500).json({ error: "Failed to fetch monthly insights" });
  }
});

/**
 * POST /api/insights/regenerate/overview
 * Force regenerate overview insights (clear cache)
 */
router.post("/regenerate/overview", async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Fetch all months for user
    const months = await MonthData.find({ userId }).sort({ year: 1, month: 1 });

    // Regenerate insights
    const insights = await InsightsService.regenerateOverviewInsights(
      userId,
      months as any
    );

    res.json(insights);
  } catch (error) {
    logger.error("Error regenerating overview insights:", error);
    res.status(500).json({ error: "Failed to regenerate insights" });
  }
});

/**
 * POST /api/insights/regenerate/month/:monthId
 * Force regenerate monthly insights (clear cache)
 */
router.post(
  "/regenerate/month/:monthId",
  async (req: Request, res: Response) => {
    try {
      const { monthId } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      // Fetch the month data
      const monthData = await MonthData.findById(monthId);

      if (!monthData) {
        return res.status(404).json({ error: "Month not found" });
      }

      // Verify ownership
      if (monthData.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Fetch previous month
      const allMonths = await MonthData.find({ userId }).sort({
        year: 1,
        month: 1,
      });
      const currentIndex = allMonths.findIndex(
        (m) => m._id.toString() === monthId
      );
      const previousMonthData =
        currentIndex > 0 ? allMonths[currentIndex - 1] : undefined;

      // Regenerate insights
      const insights = await InsightsService.regenerateMonthlyInsights(
        userId,
        monthId,
        monthData as any,
        previousMonthData as any
      );

      res.json(insights);
    } catch (error) {
      logger.error("Error regenerating monthly insights:", error);
      res.status(500).json({ error: "Failed to regenerate insights" });
    }
  }
);

export default router;

