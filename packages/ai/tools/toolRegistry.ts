/* ==================================================================
 *  所有 Tool 的统一注册与描述 (最终版：单一事实来源)
 * ==================================================================
 *
 *  如何使用:
 *  1. 为你的工具创建一个新文件 (例如 `myNewTool.ts`)。
 *  2. 在该文件中，导出函数的 schema 和 executor 函数。
 *  3. 在下面的 `toolDefinitions` 数组中，添加一个新的对象来定义你的工具。
 *
 *  此文件会自动生成 toolRegistry, toolExecutors, 和 toolDescriptions。
 *
 * ================================================================== */

// ---------- 1. 导入所有工具的 Schema 和 Executor ----------
// 计划与编排
import {
  createPlanFunctionSchema,
  createPlanAndOrchestrateFunc,
} from "./createPlanTool";
import {
  runStreamingAgentFunctionSchema,
  runStreamingAgentFunc,
} from "./runStreamingAgentTool";

// 内容管理
import { createPageFunctionSchema, createPageFunc } from "./createPageTool";
// import {
//   createCategoryFunctionSchema,
//   createCategoryFunc,
// } from "./createCategoryTool";
// import {
//   updateContentTitleFunctionSchema,
//   updateContentTitleFunc,
// } from "./updateContentTitleTool";
// import {
//   updateContentCategoryFunctionSchema,
//   updateContentCategoryFunc,
// } from "./updateContentCategoryTool";
// import {
//   queryContentsByCategoryFunctionSchema,
//   queryContentsByCategoryFunc,
// } from "./queryContentsByCategoryTool";

// 数据操作
// import {
//   generateTableFunctionSchema,
//   generateTableFunc,
// } from "./generateTableTool";
import { executeSqlFunctionSchema, executeSqlFunc } from "./executeSqlTool";

// 网络与智能
import {
  fetchWebpageFunctionSchema,
  fetchWebpageFunc,
} from "./fetchWebpageTool";

// 多媒体生成
// import {
//   generateImageFunctionSchema,
//   generateImageFunc,
// } from "./generateImageTool";

// 数据库工具
// import { createTableFunctionSchema } from "database/tools/createTableTool";
// import { listTablesFunctionSchema } from "database/tools/listTablesTool";
// import { describeTableFunctionSchema } from "./describeTableTool";
// import { selectRowsFunctionSchema } from "./selectRowsTool";
// import { groupAggregateFunctionSchema } from "./groupAggregateTool";
// import { joinTablesFunctionSchema } from "./joinTablesTool";
// import { transformRowsFunctionSchema } from "./transformRowsTool";
// import { joinRowsFunctionSchema } from "./joinRowsTool";

// (假设数据库工具的执行器也已导出，如果未导出，请在对应文件中导出)
// import { createTableFunc } from "database/tools/createTableTool";
// import { listTablesFunc } from "database/tools/listTablesTool";
// import { describeTableFunc } from "./describeTableTool";
// import { selectRowsFunc } from "./selectRowsTool";
// import { groupAggregateFunc } from "./groupAggregateTool";
// import { joinTablesFunc } from "./joinTablesTool";
// import { transformRowsFunc } from "./transformRowsTool";
// import { joinRowsFunc } from "./joinRowsTool";

// ---------- 2. 定义工具规范接口 ----------
interface ToolDefinition {
  id: string; // 唯一ID (camelCase), 这是我们的单一事实来源
  schema: any; // 提供给 LLM 的函数 Schema (不含 "type: 'function'")
  executor: (
    args: any,
    thunkApi: any,
    context?: { parentMessageId: string }
  ) => Promise<any>;
  description: {
    // 提供给前端UI的描述
    name: string;
    description: string;
    category: string;
  };
}

/* ==================================================================
 *  3. [核心] 单一事实来源：在此处定义所有工具
 * ================================================================== */
const toolDefinitions: ToolDefinition[] = [
  // --- 计划与编排 ---
  {
    id: "createPlan",
    schema: createPlanFunctionSchema,
    executor: createPlanAndOrchestrateFunc,
    description: {
      name: "createPlan",
      description: "为复杂任务制定一个多步骤的执行计划",
      category: "计划与编排",
    },
  },
  {
    id: "runStreamingAgent",
    schema: runStreamingAgentFunctionSchema,
    executor: runStreamingAgentFunc,
    description: {
      name: "runStreamingAgent",
      description: "调用指定的 Agent (智能代理) 来处理特定任务",
      category: "计划与编排",
    },
  },
  // --- 内容管理 ---
  {
    id: "createPage",
    schema: createPageFunctionSchema,
    executor: createPageFunc,
    description: {
      name: "createPage",
      description: "在当前空间中创建新页面",
      category: "内容管理",
    },
  },
  // {
  //   id: "createCategory",
  //   schema: createCategoryFunctionSchema,
  //   executor: createCategoryFunc,
  //   description: {
  //     name: "createCategory",
  //     description: "在当前空间中创建新分类",
  //     category: "内容管理",
  //   },
  // },
  // {
  //   id: "updateContentTitle",
  //   schema: updateContentTitleFunctionSchema,
  //   executor: updateContentTitleFunc,
  //   description: {
  //     name: "updateContentTitle",
  //     description: "更新内容的标题",
  //     category: "内容管理",
  //   },
  // },
  // {
  //   id: "updateContentCategory",
  //   schema: updateContentCategoryFunctionSchema,
  //   executor: updateContentCategoryFunc,
  //   description: {
  //     name: "updateContentCategory",
  //     description: "更新内容的分类",
  //     category: "内容管理",
  //   },
  // },
  // {
  //   id: "queryContentsByCategory",
  //   schema: queryContentsByCategoryFunctionSchema,
  //   executor: queryContentsByCategoryFunc,
  //   description: {
  //     name: "queryContentsByCategory",
  //     description: "查询分类下的所有内容",
  //     category: "内容管理",
  //   },
  // },
  // // --- 数据操作 ---
  // {
  //   id: "generateTable",
  //   schema: generateTableFunctionSchema,
  //   executor: generateTableFunc,
  //   description: {
  //     name: "generateTable",
  //     description: "根据 JSON 数据生成 Excel 表格",
  //     category: "数据操作",
  //   },
  // },
  // {
  //   id: "createTable",
  //   schema: createTableFunctionSchema,
  //   executor: createTableFunc,
  //   description: {
  //     name: "createTable",
  //     description: "注册一张新表",
  //     category: "数据操作",
  //   },
  // },
  // {
  //   id: "listTables",
  //   schema: listTablesFunctionSchema,
  //   executor: listTablesFunc,
  //   description: {
  //     name: "listTables",
  //     description: "列出所有可用的表",
  //     category: "数据操作",
  //   },
  // },
  // {
  //   id: "describeTable",
  //   schema: describeTableFunctionSchema,
  //   executor: describeTableFunc,
  //   description: {
  //     name: "describeTable",
  //     description: "读取表的元数据信息",
  //     category: "数据操作",
  //   },
  // },
  // {
  //   id: "selectRows",
  //   schema: selectRowsFunctionSchema,
  //   executor: selectRowsFunc,
  //   description: {
  //     name: "selectRows",
  //     description: "按主键或索引扫描表行",
  //     category: "数据操作",
  //   },
  // },
  // {
  //   id: "groupAggregate",
  //   schema: groupAggregateFunctionSchema,
  //   executor: groupAggregateFunc,
  //   description: {
  //     name: "groupAggregate",
  //     description: "对行进行分组聚合",
  //     category: "数据操作",
  //   },
  // },
  // {
  //   id: "joinTables",
  //   schema: joinTablesFunctionSchema,
  //   executor: joinTablesFunc,
  //   description: {
  //     name: "joinTables",
  //     description: "对两张表进行连接查询",
  //     category: "数据操作",
  //   },
  // },
  // {
  //   id: "transformRows",
  //   schema: transformRowsFunctionSchema,
  //   executor: transformRowsFunc,
  //   description: {
  //     name: "transformRows",
  //     description: "对行数据进行衍生字段计算",
  //     category: "数据操作",
  //   },
  // },
  // {
  //   id: "joinRows",
  //   schema: joinRowsFunctionSchema,
  //   executor: joinRowsFunc,
  //   description: {
  //     name: "joinRows",
  //     description: "在内存中连接两组行数据",
  //     category: "数据操作",
  //   },
  // },
  {
    id: "executeSql",
    schema: executeSqlFunctionSchema,
    executor: executeSqlFunc,
    description: {
      name: "execute_sql", // 保持与旧版一致，或者统一为 executeSql
      description: "直接执行 SQL 语句",
      category: "数据操作",
    },
  },
  // // --- 网络与智能 ---
  {
    id: "fetchWebpage",
    schema: fetchWebpageFunctionSchema,
    executor: fetchWebpageFunc,
    description: {
      name: "fetchWebpage",
      description: "访问网页并获取其内容",
      category: "网络与智能",
    },
  },
  // // --- 多媒体生成 ---
  // {
  //   id: "generateImage",
  //   schema: generateImageFunctionSchema,
  //   executor: generateImageFunc,
  //   description: {
  //     name: "generateImage",
  //     description: "根据文本提示生成图片",
  //     category: "多媒体生成",
  //   },
  // },
];

/* ==================================================================
 *  4. 程序化生成所需的各个对象 (无需修改)
 * ================================================================== */

// 4.1 生成给 LLM 的工具注册表
export const toolRegistry: Record<string, any> = toolDefinitions.reduce(
  (acc, tool) => {
    acc[tool.id] = { type: "function", function: tool.schema };
    return acc;
  },
  {} as Record<string, any>
);

// 4.2 生成工具执行器映射
export const toolExecutors: Record<string, ToolDefinition["executor"]> =
  toolDefinitions.reduce(
    (acc, tool) => {
      acc[tool.id] = tool.executor;
      return acc;
    },
    {} as Record<string, ToolDefinition["executor"]>
  );

// 4.3 生成给前端 UI 的工具描述
export const toolDescriptions: Record<string, ToolDefinition["description"]> =
  toolDefinitions.reduce(
    (acc, tool) => {
      acc[tool.id] = tool.description;
      return acc;
    },
    {} as Record<string, ToolDefinition["description"]>
  );

/* ==================================================================
 *  5. 健壮的工具查找辅助函数 (无需修改)
 * ================================================================== */
const normalizeToolName = (name: string): string =>
  name.replace(/[-_]/g, "").toLowerCase();

export const findToolExecutor = (
  rawName: string
): {
  executor: ToolDefinition["executor"];
  canonicalName: string;
} => {
  const normalizedRawName = normalizeToolName(rawName);
  const canonicalName = Object.keys(toolExecutors).find(
    (key) => normalizeToolName(key) === normalizedRawName
  );

  if (canonicalName && toolExecutors[canonicalName]) {
    return {
      executor: toolExecutors[canonicalName],
      canonicalName: canonicalName,
    };
  }
  throw new Error(`执行器未找到：未知工具 "${rawName}"`);
};
