/**
 * 处理流式工具调用数据块，将其累积到数组中。
 * 关键点：
 * - 支持按 index 拼接，也支持同一 id、无 index 的分片追加（OpenAI 风格常见）
 * - 字符串分片追加；对象分片直接覆盖（最后一段为准）
 * - 不再过滤特殊标记，保持原样透传
 */
export function accumulateToolCallChunks(
  currentAccumulatedCalls: any[],
  toolCallChunks: any[]
): any[] {
  const out = [...currentAccumulatedCalls];

  const appendArgs = (call: any, args: any) => {
    if (args == null) return;
    if (!call.function) call.function = { name: "", arguments: "" };

    if (typeof args === "string") {
      call.function.arguments = (call.function.arguments || "") + args;
    } else {
      // 模型直接给对象时，直接覆盖
      call.function.arguments = args;
    }
  };

  for (const chunk of toolCallChunks) {
    const { index, id, type, function: fn } = chunk;

    // 分块流（带 index）
    if (index != null) {
      while (out.length <= index) out.push({});
      const cur = out[index];

      if (id && !cur.id) cur.id = id;
      if (type && !cur.type) cur.type = type;

      if (fn) {
        if (!cur.function) cur.function = { name: "", arguments: "" };
        if (fn.name) cur.function.name += fn.name;
        appendArgs(cur, fn.arguments);
      }
      continue;
    }

    // 无 index，但有 fn 的分片（同 id 的后续片段会被追加）
    if (fn?.name && fn.arguments != null) {
      const existingIndex = id != null ? out.findIndex((c) => c.id === id) : -1;

      if (existingIndex >= 0) {
        const target = out[existingIndex];
        target.function = target.function || { name: "", arguments: "" };
        if (fn.name) target.function.name = fn.name; // 以最新的 name 为准
        appendArgs(target, fn.arguments);
      } else {
        const newCall = {
          id,
          type: type || "function",
          function: { name: fn.name, arguments: "" },
        };
        appendArgs(newCall, fn.arguments);
        out.push(newCall);
      }
      continue;
    }

    // 兜底：此处可按需扩展处理裸参数对象等情况
  }

  return out;
}
