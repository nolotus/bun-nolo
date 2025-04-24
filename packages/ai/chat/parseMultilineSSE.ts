// 解析多行 SSE 数据 - 改进版
export function parseMultilineSSE(rawText: string) {
  const results = [];
  const lines = rawText.split("\n");
  let currentJsonBuffer = ""; // 用于累积可能跨行的JSON片段

  for (let line of lines) {
    line = line.trim();
    if (!line) continue; // 跳过空行

    if (line.startsWith("data:")) {
      const dataContent = line.substring(5).trim();

      // *** 改进：处理 [DONE] 标记 ***
      if (dataContent === "[DONE]") {
        // 这是流结束的信号，通常不需要解析为JSON
        console.log("[SSE Parser] Received stream end signal: [DONE]");
        continue; // 跳过处理 [DONE]
      }

      // 尝试解析当前行数据
      try {
        // 首先尝试独立解析，如果成功，说明之前的buffer是完整的或空的
        const parsedData = JSON.parse(dataContent);
        // 如果之前的buffer有内容但未解析成功，这里解析成功意味着新JSON开始了
        if (currentJsonBuffer) {
          console.warn(
            "[SSE Parser] Discarding incomplete JSON buffer due to new valid JSON:",
            currentJsonBuffer
          );
          currentJsonBuffer = ""; // 清空旧buffer
        }
        results.push(parsedData);
      } catch (e) {
        // 如果独立解析失败，尝试将其附加到缓冲区
        currentJsonBuffer += dataContent;
        // 尝试解析累积的缓冲区
        try {
          const parsedAccumulated = JSON.parse(currentJsonBuffer);
          results.push(parsedAccumulated);
          currentJsonBuffer = ""; // 解析成功，清空缓冲区
        } catch (accumulatedError) {
          // 如果累积解析仍然失败，继续累积，等待更多数据
          // （假设JSON对象可能跨越更多行）
          // console.log("[SSE Parser] Accumulating partial JSON:", currentJsonBuffer);
        }
      }
    } else {
      // 如果行不是以 "data:" 开头，并且我们有累积的缓冲区，
      // 这可能意味着JSON数据被非标准地中断了。
      if (currentJsonBuffer) {
        console.warn(
          "[SSE Parser] Non 'data:' line encountered, discarding incomplete JSON buffer:",
          currentJsonBuffer
        );
        currentJsonBuffer = ""; // 清空缓冲区
      }
    }
  }

  // 循环结束后，检查缓冲区是否还有未解析的内容
  if (currentJsonBuffer) {
    console.warn(
      "[SSE Parser] Stream ended with incomplete JSON data in buffer:",
      currentJsonBuffer
    );
    // 可以选择尝试最后一次解析，或者直接丢弃
    // try {
    //   const parsedData = JSON.parse(currentJsonBuffer);
    //   results.push(parsedData);
    // } catch (finalError) {
    //   console.error("[SSE Parser] Failed to parse final accumulated data:", finalError);
    // }
  }

  return results;
}
