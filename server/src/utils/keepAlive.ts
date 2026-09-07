import axios from "axios";
import { logger } from "../config/logger";

const KEEP_ALIVE_INTERVAL = 5 * 60 * 1000; // 5 minutes
const HEALTH_ENDPOINT = process.env.RENDER_EXTERNAL_URL
  ? `${process.env.RENDER_EXTERNAL_URL}/api/health`
  : null;

/**
 * Self-ping mechanism to keep the Render instance alive
 * Only runs in production on Render
 */
export function startKeepAlive() {
  // Only enable on Render (free tier)
  if (!HEALTH_ENDPOINT || process.env.NODE_ENV !== "production") {
    logger.info("Keep-alive disabled (not on Render or not in production)");
    return;
  }

  logger.info(
    `Keep-alive enabled: pinging ${HEALTH_ENDPOINT} every ${
      KEEP_ALIVE_INTERVAL / 1000
    }s`
  );

  setInterval(async () => {
    try {
      const response = await axios.get(HEALTH_ENDPOINT, {
        timeout: 10000,
      });
      logger.info(`Keep-alive ping successful: ${response.data.status}`);
    } catch (error) {
      logger.error("Keep-alive ping failed:", error);
    }
  }, KEEP_ALIVE_INTERVAL);
}
