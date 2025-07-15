/**
 * 将原始 SSE 文本分割、累积并返回完整的 JSON 对象数组
 */
export function parseMultilineSSE(rawText: string): any[] {
  const results: any[] = [];
  // 按双换行分割成若干事件块
  const events = rawText.split(/\r?\n\r?\n/);
  let carry = ""; // 用于跨块、跨行累积 JSON 片段

  for (const ev of events) {
    if (!ev.trim()) continue;

    // 把本块所有以 data: 开头的行内容累积到 carry
    for (const line of ev.split(/\r?\n/)) {
      const t = line.trim();
      if (!t.startsWith("data:")) continue;
      const content = t.substring(5).trim();
      if (content === "[DONE]") {
        carry = ""; // 对方主动结束，丢弃残余
        continue;
      }
      carry += content;
    }

    // 尝试一次完整解析
    try {
      const obj = JSON.parse(carry);
      results.push(obj);
      carry = "";
    } catch {
      // 还不够完整，留待下一个 chunk
    }
  }

  return results;
}
