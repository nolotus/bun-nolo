// database/server/handler.ts (假设文件名)
import serverDb from "./db"; // 确保数据库实例导入路径正确
import { Request, Response } from "express"; // 假设使用 Express

// 定义基础数据项接口 (与客户端保持一致或按需定义)
interface BaseItem {
  id: string;
  type: string; // 或者更具体的 DataType 枚举/类型
  updatedAt?: string | number;
  created?: string | number;
  userId: string;
  [key: string]: any;
}

/**
 * 服务端数据获取逻辑
 * @param types 要查询的数据类型或类型数组
 * @param userId 要查询的用户 ID
 * @returns 按类型分组的数据对象，例如 { "cybot": [...] }
 */
async function fetchUserData(
  types: string | string[],
  userId: string
): Promise<Record<string, BaseItem[]>> {
  const results: Record<string, BaseItem[]> = {};
  const typeArray = Array.isArray(types) ? types : [types];

  // 基本校验 userId
  if (!userId || userId === "local" || userId === "undefined") {
    console.error("fetchUserData: Invalid userId received:", userId);
    // 可以选择抛出错误或返回空结果，这里选择返回空结果
    return results;
    // 或者 throw new Error("Invalid userId provided to fetchUserData");
  }

  try {
    // 重要：LevelDB 的范围查询需要确保 gte 和 lte 逻辑正确
    // 如果只查一种类型，迭代器可以更精确
    if (typeArray.length === 1) {
      const type = typeArray[0];
      const prefix = `${type}-${userId}`;
      for await (const [key, value] of serverDb.iterator({
        gte: prefix,
        lte: `${prefix}\uffff`, // 使用 \uffff 作为上限通配符
      })) {
        // 理论上这里 key 肯定是以 prefix 开头，value 是 BaseItem 结构
        if (!results[type]) {
          results[type] = [];
        }
        // 最好在这里做个类型断言或校验，确保 value 符合 BaseItem 结构
        results[type].push(value as BaseItem);
      }
    } else {
      // 如果需要同时查询多种类型，需要更复杂的迭代逻辑或多次迭代
      // 以下是一个简化的多次迭代示例 (效率可能不如单次迭代优化)
      console.warn(
        "fetchUserData: Iterating multiple types separately, consider optimization if performance critical."
      );
      for (const type of typeArray) {
        const prefix = `${type}-${userId}`;
        for await (const [key, value] of serverDb.iterator({
          gte: prefix,
          lte: `${prefix}\uffff`,
        })) {
          if (!results[type]) {
            results[type] = [];
          }
          results[type].push(value as BaseItem);
        }
      }
      // 注意：原始代码中的单次迭代器写法在处理多个不连续 type 时可能有问题，
      // 例如 gte: typeA-userId, lte: typeZ-userId 会迭代中间所有其他类型的数据。
      // 上面的多次迭代更安全，但效率稍低。请根据实际情况选择。
    }

    // 返回按类型分组的结果
    return results;
  } catch (error) {
    console.error("Error in fetchUserData:", error);
    // 向上抛出错误，让 handleQuery 处理
    throw error;
  }
}

/**
 * 处理客户端查询请求的 Handler
 * @param req Express 请求对象
 * @param res Express 响应对象
 */
export const handleQuery = async (req: Request, res: Response) => {
  try {
    // 提取并校验参数
    const userId = req.params.userId;
    const condition = req.body as { type?: string }; // 类型断言 body 结构
    const limit = Number(req.query.limit) || undefined; // 提供默认值或处理 NaN

    // 严格校验 userId
    if (
      !userId ||
      userId === "local" ||
      userId.trim() === "" ||
      userId === "undefined"
    ) {
      console.log("handleQuery: Bad request - Invalid userId:", userId);
      return res.status(400).json({ error: "UserId is invalid or missing" });
    }

    // 校验 condition 和 type
    if (
      !condition ||
      typeof condition.type !== "string" ||
      condition.type.trim() === ""
    ) {
      console.log(
        "handleQuery: Bad request - Invalid condition type:",
        condition?.type
      );
      return res
        .status(400)
        .json({ error: "Query condition with valid 'type' is required" });
    }

    const type = condition.type;

    console.log("Query options:", { userId, type, limit }); // 日志记录查询参数

    // 调用数据获取逻辑
    const fetchedDataByType = await fetchUserData(type, userId); // 只查询一个类型

    // 从结果中提取该类型的数据数组，如果该类型无数据，则为空数组
    const dataArray = fetchedDataByType[type] || [];

    // (可选) 应用 limit - 如果数据库层面没有 limit，可以在这里应用
    const limitedDataArray = limit ? dataArray.slice(0, limit) : dataArray;
    // 注意：如果 fetchUserData 内部或数据库层面已经做了排序和 limit，这里可能不需要

    console.log(
      `handleQuery: Found ${dataArray.length} items for type '${type}', returning ${limitedDataArray.length} items.`
    );

    // **关键：构建符合客户端期望的响应结构**
    return res.status(200).json({
      data: {
        data: limitedDataArray, // 将数据数组放在 data.data 路径下
      },
    });
  } catch (err) {
    // 标准化错误响应
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    console.error("Error in handleQuery:", message, err); // 记录详细错误
    return res.status(500).json({ error: message });
  }
};

// 可能还需要其他导出或路由设置，取决于你的服务器框架
