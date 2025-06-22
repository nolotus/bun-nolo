// /ai/tools/toolRegistry.ts

/* ============================================================
 *  所有 Tool 的统一注册与描述
 * ========================================================== */

// ---------- 工具定义导入 ----------
import { generateTableTool } from "./generateTableTool";
import { createPageTool } from "./createPageTool";
import { generateImageTool } from "./generateImageTool";
import { createCategoryTool } from "./createCategoryTool";
import { updateContentTitleTool } from "./updateContentTitleTool";
import { updateContentCategoryTool } from "./updateContentCategoryTool";
import { queryContentsByCategoryTool } from "./queryContentsByCategoryTool";
import { fetchWebpageTool } from "./fetchWebpageTool";
import { runStreamingAgentTool } from "./runStreamingAgentTool";
import { createTableTool } from "database/tools/createTableTool";
import { listTablesTool } from "database/tools/listTablesTool";
import { describeTableTool } from "./describeTableTool";
import { selectRowsTool } from "./selectRowsTool";
import { groupAggregateTool } from "./groupAggregateTool";
import { joinTablesTool } from "./joinTablesTool";
import { transformRowsTool } from "./transformRowsTool";
import { joinRowsTool } from "./joinRowsTool";
import { executeSqlTool } from "./executeSqlTool";
import { createPlanTool } from "./createPlanTool"; // 新增

// ---------- 工具执行函数导入 ----------
import { createPageFunc } from "./createPageTool";
import { createCategoryFunc } from "./createCategoryTool";
import { generateTable } from "./generateTableTool";
import { fetchWebpage } from "./fetchWebpageTool";
import { executeSql } from "./executeSqlTool";
import { runStreamingAgentFunc } from "./runStreamingAgentTool";
import { createPlanFunc } from "./createPlanTool"; // 新增
import { selectCurrentUserId } from "auth/authSlice";

/* ============================================================
 *  1. 工具注册表 (给 LLM)
 * ========================================================== */
export const toolRegistry: Record<string, any> = {
  createPlan: createPlanTool, // 新增
  generateTable: generateTableTool,
  createPage: createPageTool,
  generateImage: generateImageTool,
  createCategory: createCategoryTool,
  updateContentTitle: updateContentTitleTool,
  updateContentCategory: updateContentCategoryTool,
  queryContentsByCategory: queryContentsByCategoryTool,
  fetchWebpage: fetchWebpageTool,
  runStreamingAgent: runStreamingAgentTool,
  createTable: createTableTool,
  listTables: listTablesTool,
  describeTable: describeTableTool,
  selectRows: selectRowsTool,
  groupAggregate: groupAggregateTool,
  joinTables: joinTablesTool,
  transformRows: transformRowsTool,
  joinRows: joinRowsTool,
  executeSql: executeSqlTool,
};

/* ============================================================
 *  2. 工具执行器 (核心逻辑)
 * ========================================================== */
export const toolExecutors: Record<
  string,
  (
    args: any,
    thunkApi: any,
    context?: { parentMessageId: string }
  ) => Promise<any>
> = {
  create_plan: createPlanFunc, // 新增
  generate_table: async (args, thunkApi) => {
    const { getState } = thunkApi;
    const currentUserId = selectCurrentUserId(getState());
    return generateTable(args, thunkApi, currentUserId);
  },
  create_page: createPageFunc,
  create_category: createCategoryFunc,
  generate_image: async (args, thunkApi) => {
    console.log("Generating image with args:", args);
    return {
      success: true,
      id: `img_${Date.now()}`,
      name: "生成的图片",
      title: `图片：${args.prompt || "未命名"}`,
    };
  },
  fetch_webpage: async (args, thunkApi) => {
    const { getState } = thunkApi;
    const currentUserId = selectCurrentUserId(getState());
    return fetchWebpage(args, thunkApi, currentUserId);
  },
  execute_sql: executeSql,
  run_streaming_agent: runStreamingAgentFunc,
};

/* ============================================================
 *  3. 工具描述 (给 前端 UI，已增加分类)
 * ========================================================== */
export const toolDescriptions: Record<
  string,
  { name: string; description: string; category: string }
> = {
  // --- 计划与编排 ---
  createPlan: {
    name: "createPlan",
    description: "为复杂任务制定一个多步骤的执行计划",
    category: "计划与编排",
  },
  runStreamingAgent: {
    name: "runStreamingAgent",
    description: "调用指定的 Agent (智能代理) 来处理特定任务",
    category: "计划与编排",
  },
  // --- 内容管理 ---
  createPage: {
    name: "createPage",
    description: "在当前空间中创建新页面",
    category: "内容管理",
  },
  createCategory: {
    name: "createCategory",
    description: "在当前空间中创建新分类",
    category: "内容管理",
  },
  updateContentTitle: {
    name: "updateContentTitle",
    description: "更新内容的标题",
    category: "内容管理",
  },
  updateContentCategory: {
    name: "updateContentCategory",
    description: "更新内容的分类",
    category: "内容管理",
  },
  queryContentsByCategory: {
    name: "queryContentsByCategory",
    description: "查询分类下的所有内容",
    category: "内容管理",
  },
  // --- 数据操作 ---
  generateTable: {
    name: "generateTable",
    description: "根据 JSON 数据生成 Excel 表格",
    category: "数据操作",
  },
  createTable: {
    name: "createTable",
    description: "注册一张新表",
    category: "数据操作",
  },
  listTables: {
    name: "listTables",
    description: "列出所有可用的表",
    category: "数据操作",
  },
  describeTable: {
    name: "describeTable",
    description: "读取表的元数据信息",
    category: "数据操作",
  },
  selectRows: {
    name: "selectRows",
    description: "按主键或索引扫描表行",
    category: "数据操作",
  },
  groupAggregate: {
    name: "groupAggregate",
    description: "对行进行分组聚合",
    category: "数据操作",
  },
  joinTables: {
    name: "joinTables",
    description: "对两张表进行连接查询",
    category: "数据操作",
  },
  transformRows: {
    name: "transformRows",
    description: "对行数据进行衍生字段计算",
    category: "数据操作",
  },
  joinRows: {
    name: "joinRows",
    description: "在内存中连接两组行数据",
    category: "数据操作",
  },
  execute_sql: {
    name: "execute_sql",
    description: "直接执行 SQL 语句",
    category: "数据操作",
  },
  // --- 网络与智能 ---
  fetchWebpage: {
    name: "fetchWebpage",
    description: "访问网页并获取其内容",
    category: "网络与智能",
  },
  // --- 多媒体生成 ---
  generateImage: {
    name: "generateImage",
    description: "根据文本提示生成图片",
    category: "多媒体生成",
  },
};
