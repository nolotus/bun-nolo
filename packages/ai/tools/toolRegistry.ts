// 文件路径: ai/tools/toolRegistry.ts

import { makeAppointmentTool } from "ai/tools/appointment";
import { runCybotTool } from "./runCybot";
import { generateTableTool } from "./generateTableTool";
import { createPageTool } from "./createPageTool";
import { generateImageTool } from "./generateImageTool";
import { createCategoryTool } from "./createCategoryTool";

// 工具注册表
export const toolRegistry: Record<string, any> = {
  makeAppointment: makeAppointmentTool,
  runCybot: runCybotTool,
  generateTable: generateTableTool,
  createPage: createPageTool,
  generateImage: generateImageTool,
  createCategory: createCategoryTool,
};

// 工具描述映射，用于 ToolSelector 显示描述
export const toolDescriptions: Record<
  string,
  { name: string; description: string }
> = {
  makeAppointment: {
    name: "makeAppointment",
    description: "Schedule appointments and manage calendar events",
  },
  runCybot: {
    name: "runCybot",
    description: "Execute other cybots and combine their capabilities",
  },
  generateTable: {
    name: "generateTable",
    description: "根据 JSON 数据生成 Excel 表格",
  },
  createPage: {
    name: "createPage",
    description: "在当前空间中创建新页面",
  },
  generateImage: {
    name: "generateImage",
    description: "根据提示生成图片",
  },
  createCategory: {
    name: "createCategory",
    description: "在当前空间中创建新分类",
  },
};
