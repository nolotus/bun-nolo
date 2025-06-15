/* ============================================================
 *  所有 Tool 的统一注册与描述（新版）
 *  ------------------------------------------------------------
 *  ① 业务侧（已有）    : 10 个
 *  ② 数据查询/存储侧（新增）: 9 个  <-- 从 8 个变为 9 个
 *  总计                : 19 个  <-- 从 18 个变为 19 个
 * ========================================================== */

import { runCybotTool } from "./runCybot";
import { generateTableTool } from "./generateTableTool";
import { createPageTool } from "./createPageTool";
import { generateImageTool } from "./generateImageTool";
import { createCategoryTool } from "./createCategoryTool";
import { updateContentTitleTool } from "./updateContentTitleTool";
import { updateContentCategoryTool } from "./updateContentCategoryTool";
import { queryContentsByCategoryTool } from "./queryContentsByCategoryTool";
import { fetchWebpageTool } from "./fetchWebpageTool";

/* ---------- 新增数据查询/存储工具 ---------- */
// 确保这些导入路径正确，特别是 executeSqlTool 的路径
import { createTableTool } from "database/tools/createTableTool";
import { listTablesTool } from "database/tools/listTablesTool";
import { describeTableTool } from "./describeTableTool";
import { selectRowsTool } from "./selectRowsTool";
import { groupAggregateTool } from "./groupAggregateTool";
import { joinTablesTool } from "./joinTablesTool";
import { transformRowsTool } from "./transformRowsTool";
import { joinRowsTool } from "./joinRowsTool";
import { executeSqlTool } from "./executeSqlTool"; // **新增：导入 executeSqlTool**

/* ============================================================
 *  1. 工具注册表 —— 大模型实际调用时依赖的映射
 * ========================================================== */
export const toolRegistry: Record<string, any> = {
  /* ----------- 业务侧（已存在） ----------- */
  runCybot: runCybotTool,
  generateTable: generateTableTool,
  createPage: createPageTool,
  generateImage: generateImageTool,
  createCategory: createCategoryTool,
  updateContentTitle: updateContentTitleTool,
  updateContentCategory: updateContentCategoryTool,
  queryContentsByCategory: queryContentsByCategoryTool,
  fetchWebpage: fetchWebpageTool,

  /* ----------- 数据查询 / 存储侧（新增） ----------- */
  createTable: createTableTool,
  listTables: listTablesTool,
  describeTable: describeTableTool,
  selectRows: selectRowsTool,
  groupAggregate: groupAggregateTool,
  joinTables: joinTablesTool,
  transformRows: transformRowsTool,
  joinRows: joinRowsTool,
  executeSql: executeSqlTool, // **新增：注册 executeSqlTool**
};

/* ============================================================
 *  2. 工具描述 —— 用于前端 ToolSelector / 调试 UI
 * ========================================================== */
export const toolDescriptions: Record<
  string,
  { name: string; description: string }
> = {
  /* ----------- 业务侧（已存在） ----------- */
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

  /* ----------- 数据查询 / 存储侧（新增） ----------- */
  createTable: {
    name: "createTable",
    description:
      "为指定租户注册一张新表：写入表结构元数据（meta-{tenantId}-{tableId}），包含表名、列定义、索引定义和创建时间",
  },
  listTables: {
    name: "listTables",
    description:
      "列出指定租户下的所有表：扫描 meta 前缀 (meta-{tenantId}-*)，可选择仅返回表 ID 或同时返回元信息",
  },
  describeTable: {
    name: "describeTable",
    description:
      "读取指定表的元数据（表名、列定义、索引定义、创建时间）；可选返回行数和索引大小统计",
  },
  selectRows: {
    name: "selectRows",
    description:
      "按主键或二级索引扫描表行，支持多条件过滤、排序和游标分页，返回符合条件的行数组",
  },
  groupAggregate: {
    name: "groupAggregate",
    description:
      "对满足条件的行执行分组聚合，一次返回多种聚合指标（COUNT/SUM/AVG/MIN/MAX）",
  },
  joinTables: {
    name: "joinTables",
    description:
      "对两张表做等值内联 JOIN，返回扁平合并后的行，字段冲突时用表名作前缀区分",
  },
  transformRows: {
    name: "transformRows",
    description:
      "对输入行数组按 JSON-Logic 规则做衍生字段计算、投影或条件映射，返回新行数组",
  },
  joinRows: {
    name: "joinRows",
    description: "在内存中对两组任意行数组做等值内/左连接，返回合并后的行数组",
  },
  executeSql: {
    // **新增：注册 executeSql 的描述**
    name: "execute_sql",
    description:
      "直接在 SQLite 数据库中执行任意 SQL 语句，包括数据查询、修改和表结构操作。请确保SQL语句的正确性。",
  },
};
