export function parseMultilineSSE(rawText: string) {
  console.debug("[parseMultilineSSE] rawText:", rawText);
  const results: any[] = [];
  const lines = rawText.split("\n");
  let currentJsonBuffer = "";

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.startsWith("data:")) {
      const dataContent = line.substring(5).trim();
      console.debug("[parseMultilineSSE] dataContent:", dataContent);

      if (dataContent === "[DONE]") {
        console.debug("[parseMultilineSSE] skip [DONE]");
        continue;
      }

      try {
        const parsedData = JSON.parse(dataContent);
        console.debug("[parseMultilineSSE] parsedData:", parsedData);
        currentJsonBuffer = "";
        results.push(parsedData);
      } catch (e) {
        // 累积到 buffer
        currentJsonBuffer += dataContent;
        console.debug(
          "[parseMultilineSSE] partial JSON, buffer:",
          currentJsonBuffer
        );
        try {
          const parsedAccumulated = JSON.parse(currentJsonBuffer);
          console.debug(
            "[parseMultilineSSE] parsedAccumulated:",
            parsedAccumulated
          );
          results.push(parsedAccumulated);
          currentJsonBuffer = "";
        } catch (_e2) {
          // 继续等下一行
        }
      }
    } else {
      if (currentJsonBuffer) {
        console.debug("[parseMultilineSSE] 非 data 行，清空 buffer");
        currentJsonBuffer = "";
      }
    }
  }

  if (currentJsonBuffer) {
    console.debug(
      "[parseMultilineSSE] end with leftover buffer:",
      currentJsonBuffer
    );
  }

  console.debug("[parseMultilineSSE] return results:", results);
  return results;
}
