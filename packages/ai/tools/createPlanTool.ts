import { setPlan, setSteps, Step, runPlanSteps } from "ai/llm/planSlice";
import type { RootState } from "app/store";

// Schema 保持不变...
export const createPlanFunctionSchema = {
  name: "createPlan",
  description:
    "When a task requires multiple structured steps or sequential AI thinking to complete, use this tool to formulate and execute a detailed plan. Do not use for simple, single-step tasks.",
  parameters: {
    type: "object",
    properties: {
      planTitle: {
        type: "string",
        description:
          "A clear and concise title for the overall goal of the plan.",
      },
      strategy: {
        type: "string",
        description:
          "[Crucially Important] Detail the overall strategy and thought process for creating this plan. Explain why you chose these steps and how you expect them to work together to achieve the final goal. This ensures the plan's logic and correctness.",
      },
      steps: {
        type: "array",
        description:
          "An ordered sequence of steps that make up the plan. Subsequent steps can reference the output of previous steps using the '{{steps.step_id.result}}' syntax.",
        items: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description:
                "A unique identifier for the step (e.g., 'step_1'), used for referencing in subsequent steps.",
            },
            title: {
              type: "string",
              description:
                "A short, human-readable description of the step's objective.",
            },
            tool_name: {
              type: "string",
              description:
                "The name of the tool to be called. Includes a special 'ask_ai_assistant' tool for open-ended tasks requiring language understanding, generation, summarization, or transformation.",
            },
            parameters: {
              type: "object",
              description: `Provides the necessary parameters for the selected tool. If tool_name is 'ask_ai_assistant', the parameters must include 'task'. You can use '{{steps.step_id.result}}' to reference results from previous steps.`,
            },
          },
          required: ["id", "title", "tool_name", "parameters"],
        },
      },
    },
    required: ["planTitle", "strategy", "steps"],
  },
};

function formatParameters(params: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) return "None";
  return Object.entries(params)
    .map(([key, value]) => `  - \`${key}\`: \`${JSON.stringify(value)}\``)
    .join("\n");
}

/**
 * [CORRECTED FOR REAL-TIME FEEDBACK]
 * Creates a plan, displays it, and then dispatches the execution thunk to run in the background,
 * allowing it to post real-time updates to the UI.
 */
export async function createPlanAndOrchestrateFunc(
  args: any,
  thunkApi: any
): Promise<{ rawData: string; displayData: string }> {
  const { dispatch, getState } = thunkApi;
  const { planTitle, strategy, steps: stepBlueprints } = args;

  if (
    !planTitle ||
    !strategy ||
    !Array.isArray(stepBlueprints) ||
    stepBlueprints.length === 0
  ) {
    throw new Error(
      "Plan title, strategy, and at least one step are required."
    );
  }

  // 1. Prepare and store the plan in Redux state
  const processedSteps: Step[] = stepBlueprints.map((blueprint: any) => ({
    id: blueprint.id,
    title: blueprint.title,
    status: "pending",
    call: {
      tool_name: blueprint.tool_name,
      parameters: blueprint.parameters || {},
    },
    result: null,
  }));

  dispatch(setPlan({ planDetails: strategy, currentProgress: 0 }));
  dispatch(setSteps(processedSteps));

  // 2. Dispatch the plan execution thunk but DO NOT await it.
  // This lets it run in the background and create its own messages.
  const state = getState() as RootState;
  const dialogKey = state.dialog.currentDialogKey;

  if (dialogKey) {
    dispatch(runPlanSteps({ dialogKey })); // Fire-and-forget
  } else {
    // This error is critical and should be part of the returned message.
    console.error(
      "Cannot execute plan: Could not retrieve currentDialogKey. The plan will not be executed."
    );
    const errorMarkdown = `\n\n**CRITICAL ERROR:** Could not find the current dialog. The plan was created but **will not be executed.**`;
    return {
      rawData: errorMarkdown,
      displayData: errorMarkdown,
    };
  }

  // 3. Immediately return the initial plan overview message to the user.
  const markdownResult = `
### Plan Created: ${planTitle}

**Strategy:**
${strategy}

---

**Execution Steps (${processedSteps.length}):**

${processedSteps
  .map(
    (step, index) => `
**${index + 1}. ${step.title}** (\`ID: ${step.id}\`)
- **Tool:** \`${step.call.tool_name}\`
- **Parameters:**
${formatParameters(step.call.parameters)}
`
  )
  .join("\n---\n")}

---
**Plan execution has started automatically...**
`;

  return {
    rawData: markdownResult,
    displayData: markdownResult,
  };
}
