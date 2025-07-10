// database/server/handler.ts
import serverDb from "./db";

interface BaseItem {
  id: string;
  type: string;
  updatedAt?: string | number;
  created?: string | number;
  userId: string;
  [key: string]: any;
}

async function fetchUserData(
  types: string | string[],
  userId: string
): Promise<Record<string, BaseItem[]>> {
  const results: Record<string, BaseItem[]> = {};
  if (!userId || userId === "local" || userId === "undefined") return results;
  const typeArray = Array.isArray(types) ? types : [types];
  for (const type of typeArray) {
    const prefix = `${type}-${userId}`;
    for await (const [, value] of serverDb.iterator({
      gte: prefix,
      lte: `${prefix}\uffff`,
    })) {
      (results[type] ||= []).push(value as BaseItem);
    }
  }
  return results;
}

export const handleQuery = async (req: any, res: any) => {
  const userId = req.params.userId;
  if (
    !userId ||
    userId === "local" ||
    userId.trim() === "" ||
    userId === "undefined"
  ) {
    return res.status(400).json({ error: "UserId is invalid or missing" });
  }
  const { type } = req.body as { type?: string };
  if (!type || typeof type !== "string") {
    return res
      .status(400)
      .json({ error: "Query condition with valid 'type' is required" });
  }
  const limit = Number(req.query.limit) || undefined;
  try {
    const data = (await fetchUserData(type, userId))[type] || [];
    const result = limit ? data.slice(0, limit) : data;
    return res.status(200).json({ data: { data: result } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
};
