/* ==================================================================
 *  所有 Tool 的统一注册与描述 (最终版：单一事实来源)
 * ==================================================================
 *
 *  如何使用:
 *  1. 为你的工具创建一个新文件 (例如 `myNewTool.ts`)。
 *  2. 在该文件中，导出函数的 schema 和 executor 函数。
 *  3. 在下面的 `toolDefinitions` 数组中，添加一个新的对象来定义你的工具。
 *
 *  此文件会自动生成 toolRegistry, toolExecutors, toolDescriptions,
 *  以及 toolDefinitionsByName。
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

// 分类相关工具集中在 ./category 文件夹
import {
  createCategoryFunctionSchema,
  createCategoryFunc,
} from "./category/createCategoryTool";
import {
  updateContentCategoryFunctionSchema,
  updateContentCategoryFunc,
} from "./category/updateContentCategoryTool";
import {
  queryContentsByCategoryFunctionSchema,
  queryContentsByCategoryFunc,
} from "./category/queryContentsByCategoryTool";

// import { updateContentTitleFunctionSchema, updateContentTitleFunc } from "./updateContentTitleTool";

// 数据操作
import { importDataFunctionSchema, importDataFunc } from "./importDataTool";
import { executeSqlFunctionSchema, executeSqlFunc } from "./executeSqlTool";

// 网络与智能
import {
  fetchWebpageFunctionSchema,
  fetchWebpageFunc,
} from "./fetchWebpageTool";
import {
  browser_openSession_Schema,
  browser_openSession_Func,
} from "./browserTools/openSession";
import {
  browser_selectOption_Schema,
  browser_selectOption_Func,
} from "./browserTools/selectOption";

// ✅ 新增：applyDiff 工具
import { applyDiffFunctionSchema, applyDiffFunc } from "./applyDiffTool";

// ✅ 新增：generateDocx 工具（前端生成并下载 DOCX）
import {
  generateDocxFunctionSchema,
  generateDocxFunc,
} from "./generateDocxTool";

// ---------- 2. 定义工具规范接口 ----------

export type ToolBehavior = "orchestrator" | "data" | "action" | "answer";

// [新增] 交互模式：目前只需要 auto / confirm 两种
export type ToolInteraction = "auto" | "confirm";

interface ToolDefinition {
  id: string; // 唯一ID (camelCase)
  schema: any; // 提供给 LLM 的函数 Schema
  executor: (
    args: any,
    thunkApi: any,
    context?: { parentMessageId: string }
  ) => Promise<any>;
  description: {
    name: string;
    description: string;
    category: string;
  };
  behavior?: ToolBehavior; // 工具在系统中的角色

  // [新增] 工具需要的交互模式，不写时默认视为 "auto"
  interaction?: ToolInteraction;
}

/* ==================================================================
 *  2.1 toolquery 工具：帮助模型发现可用工具
 * ================================================================== */

export const toolQueryFunctionSchema = {
  name: "toolquery",
  description:
    "根据当前任务描述，列出系统中可能有用的工具。适合在不确定可用工具时先调用本函数。",
  parameters: {
    type: "object",
    properties: {
      task: {
        type: "string",
        description: "用户当前的任务或需求描述。",
      },
      top_k: {
        type: "number",
        description: "最多返回多少个候选工具（默认 5）。",
        default: 5,
      },
    },
    required: ["task"],
  },
};

export async function toolQueryFunc(args: any): Promise<{
  rawData: any;
  displayData: string;
}> {
  const { task, top_k } = args || {};
  const query = String(task || "").trim();
  const topK = typeof top_k === "number" && top_k > 0 && top_k < 50 ? top_k : 5;

  if (!query) {
    const msg = "toolquery 需要提供 task 描述，比如：'分析数据库相关的工具'。";
    return { rawData: [], displayData: msg };
  }

  const lowered = query.toLowerCase();

  const candidates = toolDefinitions
    .filter((tool) => tool.id !== "toolquery")
    .map((tool) => {
      const { description, behavior } = tool;
      const haystack =
        `${description.name} ${description.description} ${description.category} ${behavior || ""}`.toLowerCase();
      const score = haystack.includes(lowered) ? 1 : 0;
      return { tool, score };
    })
    .filter((item) => item.score > 0)
    .slice(0, topK);

  const rawData = candidates.map(({ tool }) => ({
    name: tool.schema.name,
    id: tool.id,
    description: tool.description.description,
    category: tool.description.category,
    behavior: tool.behavior ?? null,
  }));

  let displayData: string;

  if (rawData.length === 0) {
    displayData =
      `根据当前描述暂时没有找到明显匹配的工具。\n` +
      `你可以尝试：\n` +
      `- 换一种更具体的说法描述任务\n` +
      `- 直接选择你认为合适的工具调用`;
  } else {
    displayData =
      `根据你的任务描述，我找到了 ${rawData.length} 个可能有用的工具：\n\n` +
      rawData
        .map((t: any, idx: number) => {
          const behaviorLabel = t.behavior ? `，类型：${t.behavior}` : "";
          return `${idx + 1}. \`${t.name}\`（${t.category}${behaviorLabel}）\n   - ${
            t.description
          }`;
        })
        .join("\n");
  }

  return { rawData, displayData };
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
    behavior: "orchestrator",
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
    behavior: "orchestrator",
  },
  {
    id: "toolquery",
    schema: toolQueryFunctionSchema,
    executor: toolQueryFunc,
    description: {
      name: "toolquery",
      description: "根据任务描述列出可能有用的工具，帮助你选择合适的工具链。",
      category: "计划与编排",
    },
    behavior: "answer",
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
    behavior: "action",
  },
  {
    id: "createCategory",
    schema: createCategoryFunctionSchema,
    executor: createCategoryFunc,
    description: {
      name: "createCategory",
      description: "在当前空间中创建新分类",
      category: "内容管理",
    },
    behavior: "action",
  },
  {
    id: "updateContentCategory",
    schema: updateContentCategoryFunctionSchema,
    executor: updateContentCategoryFunc,
    description: {
      name: "updateContentCategory",
      description: "更新内容的分类",
      category: "内容管理",
    },
    behavior: "action",
  },
  {
    id: "queryContentsByCategory",
    schema: queryContentsByCategoryFunctionSchema,
    executor: queryContentsByCategoryFunc,
    description: {
      name: "queryContentsByCategory",
      description: "查询分类下的所有内容",
      category: "内容管理",
    },
    behavior: "data",
  },

  // --- 数据操作 ---
  {
    id: "importData",
    schema: importDataFunctionSchema,
    executor: importDataFunc,
    description: {
      name: "importData",
      description: "将用户上传的文件数据导入数据库表",
      category: "数据操作",
    },
    behavior: "data",
  },
  {
    id: "executeSql",
    schema: executeSqlFunctionSchema,
    executor: executeSqlFunc,
    description: {
      name: "executeSql",
      description: "直接执行 SQL 语句",
      category: "数据操作",
    },
    behavior: "data",
  },

  // --- 网络与智能 ---
  {
    id: "fetchWebpage",
    schema: fetchWebpageFunctionSchema,
    executor: fetchWebpageFunc,
    description: {
      name: "fetchWebpage",
      description: "访问网页并获取其内容",
      category: "网络与智能",
    },
    behavior: "data",
  },
  {
    id: "browserOpenSession",
    schema: browser_openSession_Schema,
    executor: browser_openSession_Func,
    description: {
      name: "browser_openSession",
      description: "打开一个新的浏览器会话并导航到 URL，返回会话ID",
      category: "网络与智能",
    },
    behavior: "action",
  },
  {
    id: "browserSelectOption",
    schema: browser_selectOption_Schema,
    executor: browser_selectOption_Func,
    description: {
      name: "browser_selectOption",
      description: "在浏览器会话中选择一个下拉框选项",
      category: "网络与智能",
    },
    behavior: "action",
  },

  // ✅ applyDiff：高危工具 → 行为=action + 交互=confirm
  {
    id: "applyDiff",
    schema: applyDiffFunctionSchema,
    executor: applyDiffFunc,
    description: {
      name: "applyDiff",
      description:
        "将给定的 unified/git diff 补丁应用到指定的项目文件，用于在代码库中执行精确修改。",
      category: "网络与智能", // 也可以换成 "代码编辑"
    },
    behavior: "action",
    interaction: "confirm", // [新增] 标记为需要确认
  },

  // --- 多媒体生成 / 文档生成 ---
  {
    id: "generateDocx",
    schema: generateDocxFunctionSchema,
    executor: generateDocxFunc,
    description: {
      name: "generateDocx",
      description:
        "在浏览器端根据指定 DOCX 模板 URL 和变量生成文档，并触发下载。",
      category: "文档生成",
    },
    behavior: "action",
  },
];

/* ==================================================================
 *  4. 程序化生成所需的各个对象
 * ================================================================== */

export const toolRegistry: Record<string, any> = toolDefinitions.reduce(
  (acc, tool) => {
    acc[tool.schema.name] = { type: "function", function: tool.schema };
    return acc;
  },
  {} as Record<string, any>
);

export const toolExecutors: Record<string, ToolDefinition["executor"]> =
  toolDefinitions.reduce(
    (acc, tool) => {
      acc[tool.schema.name] = tool.executor;
      return acc;
    },
    {} as Record<string, ToolDefinition["executor"]>
  );

export const toolDescriptions: Record<string, ToolDefinition["description"]> =
  toolDefinitions.reduce(
    (acc, tool) => {
      acc[tool.schema.name] = tool.description;
      return acc;
    },
    {} as Record<string, ToolDefinition["description"]>
  );

export const toolDefinitionsByName: Record<string, ToolDefinition> =
  toolDefinitions.reduce(
    (acc, tool) => {
      acc[tool.schema.name] = tool;
      return acc;
    },
    {} as Record<string, ToolDefinition>
  );

/* ==================================================================
 *  5. 工具查找辅助函数
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
      canonicalName,
    };
  }
  throw new Error(`执行器未找到：未知工具 "${rawName}"`);
};
