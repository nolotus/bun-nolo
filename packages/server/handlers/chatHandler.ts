import { getNoloKey } from "ai/llm/getNoloKey";
import { getUser } from "auth/server/getUser";
import { authenticateRequest } from "auth/utils";
import * as fs from "fs/promises";
import * as path from "path";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const formatSseError = (msg: string, code: string) =>
  new TextEncoder().encode(
    `data: ${JSON.stringify({ error: { msg, code } })}\n\n`
  );

export async function handleChatRequest(req: Request, extraHeaders = {}) {
  const auth = await authenticateRequest(req);
  // 先判断是否需要直接返回鉴权失败的 Response
  if (auth instanceof Response) return auth;

  const { userId } = auth;
  const { balance = 0 } = await getUser(userId);
  console.log("balance", balance);

  // 余额拦截：小于等于 0.1 不允许访问
  if (balance <= 1) {
    return new Response(
      JSON.stringify({
        error: {
          message: "余额不足，无法继续访问",
          code: "INSUFFICIENT_BALANCE",
        },
      }),
      {
        status: 402, // Payment Required
        headers: {
          "Content-Type": "application/json",
          ...CORS,
          ...extraHeaders,
        },
      }
    );
  }

  try {
    const { url, KEY, provider = "", ...body } = await req.json();
    console.log("body", body);
    const { model, messages } = body;

    // 正确显示messages，包含格式化输出
    console.log("=== Messages Debug Info ===");
    console.log("Messages type:", typeof messages);
    console.log(
      "Messages array length:",
      Array.isArray(messages) ? messages.length : "Not an array"
    );
    console.log("Messages content:", JSON.stringify(messages, null, 2));
    console.log("=== End Messages Debug ===");

    // 检查image_url数量
    const imageUrlCount = Array.isArray(messages)
      ? messages.reduce((count: number, msg: any) => {
          if (msg.content && Array.isArray(msg.content)) {
            return (
              count +
              msg.content.filter((item: any) => item.type === "image_url")
                .length
            );
          }
          return count;
        }, 0)
      : 0;

    console.log(`Image URL count: ${imageUrlCount}`);

    // 新增：图片数量大于1时检查余额是否大于20
    if (imageUrlCount > 1) {
      console.log(
        `检测到 ${imageUrlCount} 张图片，检查用户余额是否符合要求（需要 > 20）`
      );
      if (balance <= 20) {
        return new Response(
          JSON.stringify({
            error: {
              message: "使用多张图片需要余额大于20，当前余额不足",
              code: "INSUFFICIENT_BALANCE_FOR_MULTIPLE_IMAGES",
              details: {
                currentBalance: balance,
                requiredBalance: 20,
                imageCount: imageUrlCount,
              },
            },
          }),
          {
            status: 402, // Payment Required
            headers: {
              "Content-Type": "application/json",
              ...CORS,
              ...extraHeaders,
            },
          }
        );
      } else {
        console.log(`余额检查通过：当前余额 ${balance} > 20`);
      }
    }

    // 如果image_url数量超过5，写入blacklist
    if (imageUrlCount > 5) {
      const blacklistData = {
        timestamp: new Date().toISOString(),
        auth: auth,
        messages: messages,
        model: model,
        imageUrlCount: imageUrlCount,
        requestInfo: {
          url: url,
          provider: provider,
          userId: userId,
        },
      };

      try {
        const blacklistPath = path.join(process.cwd(), "blacklist");
        await fs.appendFile(
          blacklistPath,
          JSON.stringify(blacklistData, null, 2) + "\n"
        );
        console.log(
          `Blacklist entry added: ${imageUrlCount} image URLs detected`
        );
      } catch (fileError) {
        console.error("Failed to write to blacklist:", fileError);
      }
    }

    const apiKey = KEY?.trim() || getNoloKey(provider);
    if (!apiKey)
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

    const headers = provider.includes("anthropic")
      ? {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        }
      : {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        };

    // 全部都用 300s
    const TIMEOUT = 300_000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort("timeout"), TIMEOUT);

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

    return new Response(stream, { status: 200, headers: streamHeaders });
  } catch (e: any) {
    const isAbort = e?.name === "AbortError";
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
