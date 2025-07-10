// ai/token/clear.ts
import { browserDb } from "database/browser/db";
import { format } from "date-fns";
import { createTokenKey, createTokenStatsKey } from "database/keys";

/**
 * 清空指定用户当天的token记录和统计
 */
export const clearTodayTokens = async (userId: string) => {
  try {
    const today = format(new Date(), "yyyy-MM-dd");
    const todayTimestamp = new Date().setHours(0, 0, 0, 0);

    const { start, end } = createTokenKey.range(userId, todayTimestamp);
    const statsKey = createTokenStatsKey(userId, today);

    // 获取并删除今天的记录
    const batch = browserDb.batch();

    // 删除记录
    for await (const [key] of browserDb.iterator({
      gte: start,
      lte: end,
    })) {
      batch.del(key);
    }

    // 删除统计
    batch.del(statsKey);

    await batch.write();

    return { success: true };
  } catch (err) {
    throw err;
  }
};

/**
 * 清空指定用户所有token记录和统计
 */
export const clearAllTokens = async (userId: string) => {
  try {
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

    return { success: true, recordCount, statsCount };
  } catch (err) {
    throw err;
  }
};

const createKey = (...parts: string[]) => parts.join("-");
