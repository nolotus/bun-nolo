// /ai/tools/toolRegistry.ts (完整、最终版本)

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

// ---------- 工具执行函数导入 ----------
import { createPageFunc } from "./createPageTool";
import { createCategoryFunc } from "./createCategoryTool";
import { generateTable } from "./generateTableTool";
import { fetchWebpage } from "./fetchWebpageTool";
import { executeSql } from "./executeSqlTool";
import { runStreamingAgentFunc } from "./runStreamingAgentTool";
import { selectCurrentUserId } from "auth/authSlice";

/* ============================================================
 *  1. 工具注册表 (给 LLM)
 * ========================================================== */
export const toolRegistry: Record<string, any> = {
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
  // ✨ 关键：更新函数签名以接受可选的第三个参数 `context`
  (
    args: any,
    thunkApi: any,
    context?: { parentMessageId: string }
  ) => Promise<any>
> = {
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

  // --- runStreamingAgent 的执行器现在与新签名匹配 ---
  run_streaming_agent: runStreamingAgentFunc,
};

/* ============================================================
 *  3. 工具描述 (给 前端 UI)
 * ========================================================== */
export const toolDescriptions: Record<
  string,
  { name: string; description: string }
> = {
  generateTable: {
    name: "generateTable",
    description: "根据 JSON 数据生成 Excel 表格",
  },
  createPage: { name: "createPage", description: "在当前空间中创建新页面" },
  generateImage: { name: "generateImage", description: "根据提示生成图片" },
  createCategory: {
    name: "createCategory",
    description: "在当前空间中创建新分类",
  },
  updateContentTitle: {
    name: "updateContentTitle",
    description: "更新当前空间中某个内容的标题",
  },
  updateContentCategory: {
    name: "updateContentCategory",
    description: "更新当前空间中某个内容的分类",
  },
  queryContentsByCategory: {
    name: "queryContentsByCategory",
    description: "查询当前空间中某个分类下的所有内容",
  },
  fetchWebpage: {
    name: "fetchWebpage",
    description: "访问指定网页并获取其内容",
  },
  runStreamingAgent: {
    name: "run_streaming_agent",
    description:
      "调用一个指定的 Agent (智能代理)，并以流式方式处理用户输入，与其进行交互。",
  },
  createTable: { name: "createTable", description: "为指定租户注册一张新表" },
  listTables: { name: "listTables", description: "列出指定租户下的所有表" },
  describeTable: { name: "describeTable", description: "读取指定表的元数据" },
  selectRows: { name: "selectRows", description: "按主键或二级索引扫描表行" },
  groupAggregate: {
    name: "groupAggregate",
    description: "对满足条件的行执行分组聚合",
  },
  joinTables: { name: "joinTables", description: "对两张表做等值内联 JOIN" },
  transformRows: {
    name: "transformRows",
    description: "对输入行数组按规则做衍生字段计算",
  },
  joinRows: { name: "joinRows", description: "在内存中对两组任意行数组做连接" },
  execute_sql: {
    name: "execute_sql",
    description: "直接在 SQLite 数据库中执行任意 SQL 语句",
  },
};
