// 文件路径: ai/tools/createPlanTool.ts

import { setPlan, setSteps, Step } from "chat/dialog/dialogSlice";
import { toolRegistry } from "./toolRegistry"; // 导入本身没问题

/**
 * @interface StepBlueprint
 * @description LLM 创建计划时提供的单个步骤的蓝图。
 */
interface StepBlueprint {
  id: string;
  title: string;
  tool_name: string;
  parameters: Record<string, any>;
}

// Tool 定义，新增了 planDescription 字段，并要求 LLM 详细描述计划
export const createPlanTool = {
  type: "function",
  function: {
    name: "create_plan",
    description:
      "用于处理需要多个步骤才能完成的复杂任务。你需要首先描述整个计划的目标和策略，然后提供一个详细的、有序的工具调用（tool_call）步骤列表。后续步骤可以通过'{{steps.step_id.result}}'语法来引用前面步骤的输出结果。",
    parameters: {
      type: "object",
      properties: {
        planTitle: {
          type: "string",
          description: "整个计划的总体目标或标题。",
        },
        planDescription: {
          type: "string",
          description:
            "对整个计划的详细描述。解释你为什么制定这个计划，以及每个步骤的作用是什么，最终要达成什么效果。",
        },
        steps: {
          type: "array",
          description: "构成计划的一系列有序步骤。",
          items: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "步骤的唯一标识符，例如 'step_1'，用于后续引用。",
              },
              title: {
                type: "string",
                description: "对该步骤的人类可读的简短描述。",
              },
              // ✅ *** 关键修复 ***
              // 使用 getter 延迟 Object.keys 的执行，从而打破循环依赖
              tool_name: {
                type: "string",
                description:
                  "要调用的工具的名称。注意：不能调用 'create_plan' 工具本身。",
                get enum() {
                  // 通过 getter，这行代码只会在 enum 属性被访问时执行
                  // 此时 toolRegistry 已经加载完毕
                  return Object.keys(toolRegistry).filter(
                    (name) => name !== "createPlan"
                  );
                },
              },
              parameters: {
                type: "object",
                description:
                  "一个包含工具所需参数的对象。可以使用 '{{steps.step_id.result}}' 来引用先前步骤的结果。",
              },
            },
            required: ["id", "title", "tool_name"],
          },
        },
      },
      required: ["planTitle", "planDescription", "steps"],
    },
  },
};

/**
 * 将参数对象转换为人类可读的字符串，用于在 Markdown 中显示。
 * @param params - 参数对象
 * @returns 格式化后的字符串
 */
function formatParameters(params: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) {
    return "无";
  }
  return Object.entries(params)
    .map(([key, value]) => `  - \`${key}\`: \`${JSON.stringify(value)}\``)
    .join("\n");
}

/**
 * 接收 LLM 生成的计划，将其设置到 dialog state 中，并返回一个详细的 Markdown 描述。
 * @param {{ planTitle: string, planDescription: string, steps: StepBlueprint[] }} args
 * @param {{ dispatch: Function }} thunkApi
 * @returns {Promise<string>} 返回一个 Markdown 格式的计划详情字符串。
 */
export async function createPlanFunc(
  args: any,
  thunkApi: any
): Promise<string> {
  const { dispatch } = thunkApi;
  const { planTitle, planDescription, steps: stepBlueprints } = args;

  if (
    !planTitle ||
    !planDescription ||
    !Array.isArray(stepBlueprints) ||
    stepBlueprints.length === 0
  ) {
    throw new Error("必须提供计划标题、详细描述和至少一个步骤。");
  }

  const processedSteps: Step[] = stepBlueprints.map(
    (blueprint: StepBlueprint) => ({
      id: blueprint.id,
      title: blueprint.title,
      status: "pending",
      call: {
        tool_name: blueprint.tool_name,
        parameters: blueprint.parameters || {},
      },
      result: null,
    })
  );

  dispatch(setPlan({ planDetails: planDescription }));
  dispatch(setSteps(processedSteps));

  const markdownResult = `
### 计划已创建：${planTitle}

**目标与策略:**
${planDescription}

---

**执行步骤 (${processedSteps.length}步):**

${processedSteps
  .map(
    (step, index) => `
**${index + 1}. ${step.title}** (\`ID: ${step.id}\`)
- **工具:** \`${step.call.tool_name}\`
- **参数:**
${formatParameters(step.call.parameters)}
`
  )
  .join("\n---\n")}
`;

  return markdownResult;
}
