// src/handlers/getTransactionsHandler.ts

import { authenticateRequest } from "auth/utils";
import { createTransactionKey } from "database/keys";
import serverDb from "database/server/db";
import pino from "pino";

const logger = pino({ name: "getTransactions" });

// 定义通用的 CORS 头
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * 创建一个标准的 JSON 响应
 * @param data - 响应数据
 * @param status - HTTP 状态码
 * @returns Response 对象
 */
const createJsonResponse = (data: any, status: number = 200): Response => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
  });
};

/**
 * 处理查询用户交易记录的请求
 * 支持基于游标的分页
 */
export const handleGetTransactions = async (req: Request) => {
  try {
    // 步骤 1: 验证用户身份
    const authResult = await authenticateRequest(req);
    if (authResult instanceof Response) {
      return authResult;
    }
    const { userId } = authResult;

    // 步骤 2: 解析请求体以获取分页参数
    let body: { limit?: number; cursor?: string } = {};
    try {
      body = await req.json();
    } catch (e) {
      // 请求体为空或无效，使用默认值
    }

    const limit = body.limit || 20;
    const cursor = body.cursor; // 游标是上一页最后一条记录的 txId

    // 步骤 3: 使用 unifiedKeys 构建数据库查询参数
    const { start, end } = createTransactionKey.range(userId);

    const queryOptions: any = {
      gte: start,
      limit: limit + 1, // 多取一条来判断是否还有下一页
      reverse: true, // 按时间倒序返回
    };

    if (cursor) {
      // 如果有游标，查询的上限(lt)就是这个游标对应的键
      // 在 reverse=true 时，lt 表示从比游标键更小（更早）的记录开始
      queryOptions.lt = createTransactionKey.record(userId, cursor);
    } else {
      // 如果没有游标，查询的上限(lte)就是用户所有交易记录的末尾
      queryOptions.lte = end;
    }

    // 步骤 4: 查询数据库
    const iterator = serverDb.iterator(queryOptions);
    const transactions = [];
    for await (const [, value] of iterator) {
      transactions.push(value);
    }

    // 步骤 5: 准备响应数据和下一个游标
    let nextCursor: string | null = null;
    if (transactions.length > limit) {
      const lastTransaction = transactions.pop(); // 移除用于判断下一页存在性的额外记录
      nextCursor = lastTransaction?.txId || null;
    }

    return createJsonResponse({
      success: true,
      data: transactions,
      nextCursor,
    });
  } catch (error: any) {
    logger.error({ error }, "Failed to get user transactions");
    return createJsonResponse(
      {
        success: false,
        error: {
          message: "Internal server error while fetching transactions.",
          code: "TRANSACTION_FETCH_FAILED",
        },
      },
      500
    );
  }
};
