// 文件路径: ai/tools/prepareTools.ts

import { toolRegistry } from "./toolRegistry";

export const prepareTools = (toolNames: string[]) => {
  return toolNames
    .map((toolName: string) => toolRegistry[toolName])
    .filter(Boolean); // 过滤掉未找到的工具
};
