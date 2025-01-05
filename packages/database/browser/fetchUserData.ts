import { db } from "./db";
export async function fetchUserData(type, userId) {
  const prefix = `${type}-${userId}`;
  const results = [];

  try {
    for await (const [key, value] of db.iterator({
      gte: prefix,
      lte: prefix + "\uffff",
    })) {
      results.push(value);
    }
    return results;
  } catch (error) {
    console.error("Query error:", error);
    throw error;
  }
}
