/**
 * ✨ 新增辅助函数 ✨
 * 根据新的数据块更新累积的 token 使用量。
 * @param currentUsage - 当前的累积 usage 对象，可能为 null。
 * @param newUsageChunk - 从流中收到的新 usage 数据块。
 * @returns 更新后的 usage 对象。
 */
export function updateTotalUsage(currentUsage: any, newUsageChunk: any): any {
  if (!newUsageChunk) {
    return currentUsage;
  }

  // 如果是第一次接收，直接克隆新数据块
  if (!currentUsage) {
    return { ...newUsageChunk };
  }

  // 否则，在现有基础上进行累加或更新
  const updatedUsage = { ...currentUsage };

  updatedUsage.completion_tokens =
    newUsageChunk.completion_tokens ?? updatedUsage.completion_tokens;
  updatedUsage.prompt_tokens =
    newUsageChunk.prompt_tokens ?? updatedUsage.prompt_tokens;
  updatedUsage.total_tokens =
    newUsageChunk.total_tokens ?? updatedUsage.total_tokens;

  if (newUsageChunk.prompt_tokens_details) {
    updatedUsage.prompt_tokens_details = {
      ...(updatedUsage.prompt_tokens_details || {}),
      ...newUsageChunk.prompt_tokens_details,
    };
  }
  if (newUsageChunk.completion_tokens_details) {
    updatedUsage.completion_tokens_details = {
      ...(updatedUsage.completion_tokens_details || {}),
      ...newUsageChunk.completion_tokens_details,
    };
  }

  return updatedUsage;
}
