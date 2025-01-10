// ai/token/clear.ts
import { pino } from "pino";
import { browserDb } from "database/browser/db";
import { format } from "date-fns";
import { createTokenKey, createTokenStatsKey } from "database/keys";

const logger = pino({ name: "token-clear" });

/**
 * 清空指定用户当天的token记录和统计
 */
export const clearTodayTokens = async (userId: string) => {
  try {
    const today = format(new Date(), "yyyy-MM-dd");
    const todayTimestamp = new Date().setHours(0, 0, 0, 0);

    logger.info({ userId, today }, "Clearing today's token data");

    const { start, end } = createTokenKey.range(userId, todayTimestamp);
    const statsKey = createTokenStatsKey(userId, today);

    // 获取并删除今天的记录
    const batch = browserDb.batch();

    // 删除记录
    for await (const [key] of browserDb.iterator({
      gte: start,
      lte: end,
    })) {
      logger.debug({ key }, "Deleting token record");
      batch.del(key);
    }

    // 删除统计
    logger.debug({ statsKey }, "Deleting token stats");
    batch.del(statsKey);

    await batch.write();

    logger.info("Today's token data cleared successfully");
    return { success: true };
  } catch (err) {
    logger.error({ err }, "Failed to clear today's token data");
    throw err;
  }
};

/**
 * 清空指定用户所有token记录和统计
 */
export const clearAllTokens = async (userId: string) => {
  try {
    logger.info({ userId }, "Clearing all token data");

    const batch = browserDb.batch();
    let recordCount = 0;
    let statsCount = 0;

    // 清除所有记录
    for await (const [key] of browserDb.iterator({
      gte: createKey("token", userId),
      lte: createKey("token", userId + "\uffff"),
    })) {
      batch.del(key);
      recordCount++;
    }

    // 清除所有统计
    for await (const [key] of browserDb.iterator({
      gte: createTokenStatsKey(userId)(""),
      lte: createTokenStatsKey(userId)("\uffff"),
    })) {
      batch.del(key);
      statsCount++;
    }

    await batch.write();

    logger.info({ recordCount, statsCount }, "All token data cleared");
    return { success: true, recordCount, statsCount };
  } catch (err) {
    logger.error({ err }, "Failed to clear all token data");
    throw err;
  }
};

const createKey = (...parts: string[]) => parts.join("-");
