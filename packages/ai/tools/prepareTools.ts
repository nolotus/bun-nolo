// 文件路径: ai/tools/prepareTools.ts

import { makeAppointmentTool } from "ai/tools/appointment";
import { runCybotTool } from "./runCybot";
import { generateTableTool } from "./generateTableTool";
import { createPageTool } from "./createPageTool"; // 新工具文件
import { generateImageTool } from "./generateImageTool"; // 新工具文件

export const prepareTools = (toolNames) => {
  const tools = toolNames.map((toolName: string) => {
    if (toolName === "makeAppointment") {
      return makeAppointmentTool;
    }
    if (toolName === "runCybot") {
      return runCybotTool;
    }
    if (toolName === "generateTable") {
      return generateTableTool;
    }
    if (toolName === "createPage") {
      return createPageTool; // 映射到创建页面工具
    }
    if (toolName === "generateImage") {
      return generateImageTool; // 映射到生成图片工具
    }
  });
  return tools;
};
