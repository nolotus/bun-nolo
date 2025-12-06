import { getNoloKey } from "ai/llm/getNoloKey";
import { getUser } from "auth/server/getUser";
import { authenticateRequest } from "auth/utils";
import { getModelPricing, getPrices, getFinalPrice } from "ai/llm/getPricing";
import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: { colorize: true },
        }
      : undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
});

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const formatSseError = (msg: string, code: string) =>
  new TextEncoder().encode(
    `data: ${JSON.stringify({ error: { msg, code } })}\n\n`
  );

// 计算消息预估成本的辅助函数
const calculateMessageCost = (
  model: string,
  provider: string,
  messages: any[]
): number => {
  try {
    // 获取服务器价格信息
    const serverPrices = getModelPricing(provider, model);
    if (!serverPrices) {
      logger.info("无法获取模型定价信息");
      return 0;
    }

    // 这里需要获取用户的config定价信息，暂时使用默认值
    const userConfig = {
      inputPrice: 0, // 用户自定义的输入价格
      outputPrice: 0, // 用户自定义的输出价格
    };

    // 计算价格
    const prices = getPrices(userConfig, serverPrices);
    const finalPrice = getFinalPrice(prices);

    logger.info(`模型 ${model} 预估成本计算`, {
      serverPrices,
      userConfig,
      prices,
      finalPrice,
      model,
      provider,
    });

    return finalPrice;
  } catch (error) {
    logger.error("计算消息成本时出错:", error);
    return 0;
  }
};

// 计算图片URL数量的函数
const countImageUrls = (messages: any[]): number => {
  if (!Array.isArray(messages)) return 0;

  return messages.reduce((count: number, msg: any) => {
    if (msg.content && Array.isArray(msg.content)) {
      return (
        count +
        msg.content.filter((item: any) => item.type === "image_url").length
      );
    }
    return count;
  }, 0);
};

// ==================== 各个检查函数 ====================

// 1. 基础余额检查：余额小于等于1时拒绝
const checkBasicBalance = (balance: number) => {
  if (balance <= 1) {
    return {
      allowed: false,
      error: {
        message: "余额不足，无法继续访问",
        code: "INSUFFICIENT_BALANCE",
        status: 402,
        details: { currentBalance: balance },
      },
    };
  }
  return { allowed: true };
};

// 2. 多图片余额检查：图片数量大于1且余额小于等于20时拒绝
const checkMultipleImagesBalance = (balance: number, imageUrlCount: number) => {
  if (imageUrlCount > 1 && balance <= 20) {
    return {
      allowed: false,
      error: {
        message: `多图片请求需要余额>20（当前${balance}，图片数${imageUrlCount}）`,
        code: "INSUFFICIENT_BALANCE_FOR_MULTIPLE_IMAGES",
        status: 402,
        details: {
          currentBalance: balance,
          imageUrlCount,
          requiredBalance: 20,
        },
      },
    };
  }
  return { allowed: true };
};

// 3. 预估成本检查：预估成本超过余额50%时给出警告
const checkEstimatedCost = (
  balance: number,
  estimatedCost: number,
  imageUrlCount: number
) => {
  if (estimatedCost > 0 && estimatedCost > balance * 0.5) {
    logger.warn(
      `警告：预估成本 $${estimatedCost.toFixed(6)} 超过余额的50% (${(balance * 0.5).toFixed(2)})`,
      {
        estimatedCost,
        balance,
        threshold: balance * 0.5,
        imageUrlCount,
      }
    );
  }
  return { allowed: true }; // 这个检查只是警告，不阻止请求
};

// ==================== 统一的请求检查函数 ====================
interface RequestCheckResult {
  allowed: boolean;
  error?: {
    message: string;
    code: string;
    status: number;
    details?: any;
  };
  imageUrlCount?: number;
  estimatedCost?: number;
}

const performRequestChecks = async (
  userId: string,
  balance: number,
  model: string,
  provider: string,
  messages: any[],
  auth: any
): Promise<RequestCheckResult> => {
  try {
    // 计算图片URL数量
    const imageUrlCount = countImageUrls(messages);
    logger.info(`图片URL数量统计`, { imageUrlCount });

    // 计算预估消息成本
    const estimatedCost = calculateMessageCost(model, provider, messages || []);
    logger.info(`预估消息成本: $${estimatedCost.toFixed(6)}`, {
      model,
      provider,
      estimatedCost,
    });

    // ==================== 逐个执行检查 ====================

    // 1. 基础余额检查
    const basicBalanceCheck = checkBasicBalance(balance);
    if (!basicBalanceCheck.allowed) {
      return {
        allowed: false,
        error: basicBalanceCheck.error,
        imageUrlCount,
        estimatedCost,
      };
    }

    // 2. 多图片余额检查
    const multipleImagesCheck = checkMultipleImagesBalance(
      balance,
      imageUrlCount
    );
    if (!multipleImagesCheck.allowed) {
      return {
        allowed: false,
        error: multipleImagesCheck.error,
        imageUrlCount,
        estimatedCost,
      };
    }

    // 3. 预估成本检查（只是警告）
    checkEstimatedCost(balance, estimatedCost, imageUrlCount);

    // 所有检查通过
    return {
      allowed: true,
      imageUrlCount,
      estimatedCost,
    };
  } catch (error) {
    logger.error("请求检查过程中发生错误:", error);
    return {
      allowed: false,
      error: {
        message: "请求检查失败",
        code: "CHECK_FAILED",
        status: 500,
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      },
    };
  }
};

export async function handleChatRequest(req: Request, extraHeaders = {}) {
  const auth = await authenticateRequest(req);
  // 先判断是否需要直接返回鉴权失败的 Response
  if (auth instanceof Response) return auth;

  const { userId } = auth;
  const { balance = 0 } = await getUser(userId);
  logger.info("用户余额检查", { userId, balance });

  try {
    const { url, KEY, ...body } = await req.json();

    logger.info("处理聊天请求", {
      url,
      hasKey: !!KEY,
      userId,
      bodyKeys: Object.keys(body),
    });

    const { model, messages, provider } = body;

    // 正确显示messages，包含格式化输出
    logger.info("=== Messages Debug Info ===", {
      type: typeof messages,
      length: Array.isArray(messages) ? messages.length : "Not an array",
      content: JSON.stringify(messages, null, 2),
    });
    logger.info("=== End Messages Debug ===");

    // 执行统一的请求检查
    const checkResult = await performRequestChecks(
      userId,
      balance,
      model,
      provider,
      messages,
      auth
    );

    // 如果检查不通过，返回错误响应
    if (!checkResult.allowed && checkResult.error) {
      logger.warn("请求检查失败", {
        userId,
        balance,
        errorCode: checkResult.error.code,
        errorMessage: checkResult.error.message,
      });

      return new Response(
        JSON.stringify({
          error: {
            message: checkResult.error.message,
            code: checkResult.error.code,
            details: checkResult.error.details,
          },
        }),
        {
          status: checkResult.error.status,
          headers: {
            "Content-Type": "application/json",
            ...CORS,
            ...extraHeaders,
          },
        }
      );
    }

    // 检查通过，继续后续逻辑
    logger.info("请求检查通过", {
      userId,
      imageUrlCount: checkResult.imageUrlCount,
      estimatedCost: checkResult.estimatedCost,
    });
    console.log("provider", provider);
    let apiKey;
    console.log('typeof provider === "object"', typeof provider === "object");
    if (!!KEY) {
      apiKey = KEY?.trim();
    } else if (typeof provider === "object") {
      apiKey = getNoloKey("openrouter");
    } else {
      apiKey = getNoloKey(provider);
    }
    if (!apiKey) {
      logger.warn("API密钥缺失", { provider, userId });
      return new Response(
        JSON.stringify({
          error: { message: "Missing API key", code: "MISSING_KEY" },
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...CORS,
            ...extraHeaders,
          },
        }
      );
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };
    // provider.includes("anthropic")
    //   ? {
    //       "Content-Type": "application/json",
    //       "x-api-key": apiKey,
    //       "anthropic-version": "2023-06-01",
    //     }
    //   :

    // 全部都用 300s
    const TIMEOUT = 300_000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort("timeout"), TIMEOUT);

    logger.info("发送上游请求", { url, provider, model, timeout: TIMEOUT });
    console.log("body", body);
    const upstream = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timer);

    const streamHeaders = {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      ...CORS,
      ...extraHeaders,
    };

    if (!upstream.ok) {
      const t = await upstream.text();
      const m = (() => {
        try {
          return JSON.parse(t)?.error?.message || t;
        } catch {
          return t;
        }
      })();

      logger.error("上游请求失败", {
        status: upstream.status,
        statusText: upstream.statusText,
        response: t,
      });

      return new Response(
        new ReadableStream({
          start(ctrl) {
            ctrl.enqueue(formatSseError(m, `UPSTREAM_${upstream.status}`));
            ctrl.close();
          },
        }),
        { status: 200, headers: streamHeaders }
      );
    }

    let idleTimer: ReturnType<typeof setTimeout>;
    const stream = upstream.body!.pipeThrough(
      new TransformStream({
        transform(chunk, ctrl) {
          clearTimeout(idleTimer);
          ctrl.enqueue(chunk);
          idleTimer = setTimeout(() => {
            ctrl.enqueue(formatSseError(`idle ${TIMEOUT / 1000}s`, "IDLE"));
          }, TIMEOUT);
        },
        flush() {
          clearTimeout(idleTimer);
        },
      })
    );

    logger.info("流式响应开始", { userId, model, provider });
    return new Response(stream, { status: 200, headers: streamHeaders });
  } catch (e: any) {
    const isAbort = e?.name === "AbortError";

    if (isAbort) {
      logger.error("请求超时", { error: e.message, timeout: TIMEOUT, userId });
    } else {
      logger.error("代理失败", { error: e.message, stack: e.stack, userId });
    }

    return new Response(
      JSON.stringify({
        error: {
          message: isAbort ? e?.message : "Proxy failed",
          code: "PROXY_FAILED",
        },
      }),
      {
        status: isAbort ? 504 : 500,
        headers: {
          "Content-Type": "application/json",
          ...CORS,
          ...extraHeaders,
        },
      }
    );
  }
}
