import crypto from "crypto";
import { InsightsCache } from "../models";
import OpenAIService, {
  MonthData,
  OverviewInsights,
  MonthlyInsights,
} from "./OpenAIService";
import { logger } from "../config/logger";

const CACHE_TTL_HOURS = 24;

class InsightsService {
  /**
   * Generate cache key for overview insights
   */
  private getOverviewCacheKey(userId: string): string {
    return `overview-${userId}`;
  }

  /**
   * Generate cache key for monthly insights
   */
  private getMonthlyCacheKey(userId: string, monthId: string): string {
    return `monthly-${userId}-${monthId}`;
  }

  /**
   * Generate hash of data for snapshot comparison
   */
  private generateDataSnapshot(data: any): string {
    const hash = crypto.createHash("sha256");
    hash.update(JSON.stringify(data));
    return hash.digest("hex");
  }

  /**
   * Get expiry date for cache (24 hours from now)
   */
  private getExpiryDate(): Date {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + CACHE_TTL_HOURS);
    return expiryDate;
  }

  /**
   * Get overview insights with caching
   */
  async getOverviewInsights(
    userId: string,
    allMonthsData: MonthData[]
  ): Promise<OverviewInsights> {
    try {
      const cacheKey = this.getOverviewCacheKey(userId);
      const dataSnapshot = this.generateDataSnapshot(allMonthsData);

      // Check cache
      const cached = await InsightsCache.findOne({
        userId,
        cacheKey,
        expiresAt: { $gt: new Date() },
      });

      if (cached && cached.dataSnapshot === dataSnapshot) {
        logger.info(`Cache hit for overview insights: ${userId}`);
        return cached.insights as OverviewInsights;
      }

      logger.info(`Cache miss for overview insights: ${userId}. Generating...`);

      // Generate new insights
      const insights = await OpenAIService.generateOverviewInsights(
        userId,
        allMonthsData
      );

      // Store in cache
      await InsightsCache.findOneAndUpdate(
        { userId, cacheKey },
        {
          userId,
          cacheKey,
          insightType: "overview",
          insights,
          dataSnapshot,
          generatedAt: new Date(),
          expiresAt: this.getExpiryDate(),
        },
        { upsert: true, new: true }
      );

      logger.info(`Cached overview insights for user: ${userId}`);

      return insights;
    } catch (error) {
      logger.error("Error in getOverviewInsights:", error);
      throw error;
    }
  }

  /**
   * Get monthly insights with caching
   */
  async getMonthlyInsights(
    userId: string,
    monthId: string,
    monthData: MonthData,
    previousMonthData?: MonthData
  ): Promise<MonthlyInsights> {
    try {
      const cacheKey = this.getMonthlyCacheKey(userId, monthId);
      const dataSnapshot = this.generateDataSnapshot({
        monthData,
        previousMonthData,
      });

      // Check cache
      const cached = await InsightsCache.findOne({
        userId,
        cacheKey,
        monthId,
        expiresAt: { $gt: new Date() },
      });

      if (cached && cached.dataSnapshot === dataSnapshot) {
        logger.info(`Cache hit for monthly insights: ${monthId}`);
        return cached.insights as MonthlyInsights;
      }

      logger.info(`Cache miss for monthly insights: ${monthId}. Generating...`);

      // Generate new insights
      const insights = await OpenAIService.generateMonthlyInsights(
        userId,
        monthData,
        previousMonthData
      );

      // Store in cache
      await InsightsCache.findOneAndUpdate(
        { userId, cacheKey },
        {
          userId,
          cacheKey,
          insightType: "monthly",
          monthId,
          insights,
          dataSnapshot,
          generatedAt: new Date(),
          expiresAt: this.getExpiryDate(),
        },
        { upsert: true, new: true }
      );

      logger.info(`Cached monthly insights for month: ${monthId}`);

      return insights;
    } catch (error) {
      logger.error("Error in getMonthlyInsights:", error);
      throw error;
    }
  }

  /**
   * Clear all cached insights for a user (overview + all months)
   */
  async clearUserCache(userId: string): Promise<void> {
    try {
      const result = await InsightsCache.deleteMany({ userId });
      logger.info(
        `Cleared ${result.deletedCount} cached insights for user: ${userId}`
      );
    } catch (error) {
      logger.error("Error clearing user cache:", error);
      // Don't throw - cache clearing failure shouldn't break the app
    }
  }

  /**
   * Clear cached insights for a specific month
   */
  async clearMonthCache(userId: string, monthId: string): Promise<void> {
    try {
      const cacheKey = this.getMonthlyCacheKey(userId, monthId);
      const result = await InsightsCache.deleteOne({ userId, cacheKey });
      logger.info(
        `Cleared cached insights for month ${monthId}: ${result.deletedCount} deleted`
      );

      // Also clear overview cache since month data affects it
      const overviewCacheKey = this.getOverviewCacheKey(userId);
      await InsightsCache.deleteOne({ userId, cacheKey: overviewCacheKey });
      logger.info(`Cleared overview cache for user: ${userId}`);
    } catch (error) {
      logger.error("Error clearing month cache:", error);
      // Don't throw - cache clearing failure shouldn't break the app
    }
  }

  /**
   * Regenerate insights (clear cache and generate fresh)
   */
  async regenerateOverviewInsights(
    userId: string,
    allMonthsData: MonthData[]
  ): Promise<OverviewInsights> {
    const cacheKey = this.getOverviewCacheKey(userId);
    await InsightsCache.deleteOne({ userId, cacheKey });
    return this.getOverviewInsights(userId, allMonthsData);
  }

  /**
   * Regenerate monthly insights (clear cache and generate fresh)
   */
  async regenerateMonthlyInsights(
    userId: string,
    monthId: string,
    monthData: MonthData,
    previousMonthData?: MonthData
  ): Promise<MonthlyInsights> {
    const cacheKey = this.getMonthlyCacheKey(userId, monthId);
    await InsightsCache.deleteOne({ userId, cacheKey });
    return this.getMonthlyInsights(
      userId,
      monthId,
      monthData,
      previousMonthData
    );
  }
}

export default new InsightsService();
