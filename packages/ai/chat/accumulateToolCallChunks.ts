/**
 * 处理流式工具调用数据块，将其累积到数组中。
 * @param currentAccumulatedCalls - 当前已累积的工具调用数组。
 * @param toolCallChunks - 从流中接收到的新工具调用数据块。
 * @returns - 返回一个新的、包含了新数据块信息的累积数组。
 */
export function accumulateToolCallChunks(
  currentAccumulatedCalls: any[],
  toolCallChunks: any[]
): any[] {
  // 创建一个副本以避免直接修改原始数组
  let newAccumulatedCalls = [...currentAccumulatedCalls];

  for (const toolCallChunk of toolCallChunks) {
    const index = toolCallChunk.index;
    const id = toolCallChunk.id;
    const type = toolCallChunk.type;
    const functionCall = toolCallChunk.function;

    // 方式一：处理分块流，通过 index 合并
    if (index != null) {
      // 确保数组有足够的位置
      while (newAccumulatedCalls.length <= index) {
        newAccumulatedCalls.push({});
      }
      const currentTool = newAccumulatedCalls[index];

      // 逐步填充工具调用的各个字段
      if (id && !currentTool.id) currentTool.id = id;
      if (type && !currentTool.type) currentTool.type = type;
      if (functionCall) {
        if (!currentTool.function) {
          currentTool.function = { name: "", arguments: "" };
        }
        if (functionCall.name) {
          currentTool.function.name += functionCall.name;
        }
        if (functionCall.arguments) {
          currentTool.function.arguments =
            (currentTool.function.arguments || "") + functionCall.arguments;
        }
      }
    }
    // 方式二：处理一次性发送的完整工具调用对象
    else if (
      id != null &&
      type === "function" &&
      functionCall?.name &&
      functionCall.arguments != null
    ) {
      const existingIndex = id
        ? newAccumulatedCalls.findIndex((c) => c.id === id)
        : -1;

      // 如果这是一个全新的调用，则直接推入数组
      if (existingIndex === -1 || !id) {
        newAccumulatedCalls.push({
          id,
          type,
          function: {
            name: functionCall.name,
            arguments: functionCall.arguments,
          },
        });
      }
    }
  }
  return newAccumulatedCalls;
}
