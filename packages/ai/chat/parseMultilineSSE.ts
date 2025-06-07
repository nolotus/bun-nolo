export function parseMultilineSSE(rawText: string) {
  const results: any[] = [];
  const lines = rawText.split("\n");
  let currentJsonBuffer = "";

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.startsWith("data:")) {
      const dataContent = line.substring(5).trim();

      if (dataContent === "[DONE]") {
        continue;
      }

      try {
        const parsedData = JSON.parse(dataContent);
        currentJsonBuffer = "";
        results.push(parsedData);
      } catch (e) {
        // 累积到 buffer
        currentJsonBuffer += dataContent;
        try {
          const parsedAccumulated = JSON.parse(currentJsonBuffer);
          results.push(parsedAccumulated);
          currentJsonBuffer = "";
        } catch (_e2) {
          // 继续等下一行
        }
      }
    } else {
      if (currentJsonBuffer) {
        currentJsonBuffer = "";
      }
    }
  }

  return results;
}
