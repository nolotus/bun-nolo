// chat/messages/parseMultilineSSE.ts

const DEBUG_SSE = true; // 调试时开 true，看原始 chunk；稳定后可改成 false

/**
 * 创建一个 SSE 解析器实例，支持跨 chunk 累积完整事件。
 *
 * 用法：
 *   const parseSSE = createSSEParser();
 *   const objs = parseSSE(chunk); // 每次网络 chunk 调一次
 */
export function createSSEParser() {
  // buffer 保存「还没形成完整事件」的残余文本（跨 chunk 累积）
  let buffer = "";

  return function parseSSE(chunk: string): any[] {
    const results: any[] = [];
    if (!chunk) return results;

    // 追加到全局 buffer
    buffer += chunk;

    // 按 “空行” 分割成若干完整事件：
    //   一个 event = 若干行，以空行 (\n\n 或 \r\n\r\n) 结束
    // 最后一个 event 可能是不完整的（没有空行），保留在 buffer 里等下一个 chunk
    const events = buffer.split(/\r?\n\r?\n/);
    buffer = events.pop() ?? ""; // 最后一个当作“残余”，留在 buffer

    for (const ev of events) {
      if (!ev.trim()) continue;

      // 一个 event 内，可能有多行，但对 OpenAI 来说正常都是单行 data
      const lines = ev.split(/\r?\n/);
      for (const line of lines) {
        const t = line.trim();
        if (!t.startsWith("data:")) continue;

        const content = t.substring(5).trim();
        if (!content) continue;

        if (content === "[DONE]") {
          if (DEBUG_SSE) {
            console.log("[SSE DONE received]");
          }
          // [DONE] 只表示结束，不再返回更多结果
          // buffer 清空即可；这里直接 continue
          buffer = "";
          continue;
        }

        try {
          const obj = JSON.parse(content);
          if (DEBUG_SSE) {
            console.log("[SSE parsed JSON]", obj);
          }
          results.push(obj);
        } catch (e) {
          // 这里如果报错，说明服务器真的发了不完整 / 非 JSON 的内容
          console.error("[SSE JSON.parse error]", e, "content:", content);
          // 出错时不清空 buffer，只是跳过这一行，方便你从日志里排查
        }
      }
    }

    return results;
  };
}

/** 若仍需旧的函数名导入，可用此单例（但不隔离并发流） */
export const parseMultilineSSE = createSSEParser();
