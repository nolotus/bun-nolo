// File: ai/agent/generatePrompt.ts
import { mapLanguage } from "app/i18n/mapLanguage";
import { Agent } from "app/types";
import { Contexts } from "../types";

const createContextSection = (
  title: string,
  description: string,
  content?: string | null
) => (content ? `## ${title}\n${description}\n\n${content}` : "");

const CONTEXT_USAGE_INSTRUCTIONS = `INSTRUCTIONS FOR USING THE REFERENCE MATERIALS:
- The materials provided under "REFERENCE MATERIALS" are your primary source of truth.
- Prioritize them to answer queries. They are listed in descending order of priority.
- Use facts, numbers, and names from them with precision.
- If they do not contain the answer, state that and then use your general knowledge.
- Point out any conflicting information you find within the materials.`;

const TOOL_USAGE_INSTRUCTIONS = `--- TOOL USAGE GUIDELINES ---
You may have access to a set of tools (functions) such as:
- Orchestrator tools: \`createPlan\`, \`runStreamingAgent\`
- Data tools: \`fetchWebpage\`, \`executeSql\`, \`importData\`, \`queryContentsByCategory\`
- Discovery tools: \`toolquery\`
- Other action/answer tools depending on the current agent configuration.

General principles:
- Only call tools when they are genuinely helpful for the user's goal.
- After using tools, you are still responsible for giving a clear, human‑readable answer to the user.
- Prefer a small number of well‑chosen tool calls over many noisy or redundant calls.

About \`toolquery\` (tool discovery):
- When you are not sure what tools exist, or which tools are most suitable for the current task, first call \`toolquery\` with a short description of the task.
- Use the structured result from \`toolquery\` (name, description, behavior/category) to decide which tools to call next, either directly or inside a plan.
- If \`toolquery\` says "no obvious matches", do NOT give up immediately:
  - Re‑read the user's request and think about common operations (e.g. visiting a webpage, querying a database, reading documents).
  - If a well‑known tool clearly fits (e.g. \`fetchWebpage\` for visiting a URL), you may still use it in a plan via \`createPlan\` even if it is not exposed as a direct top‑level tool in this turn.

About \`createPlan\` (orchestrator):
- When the user's request clearly requires multiple steps, multiple tools, or a longer workflow (for example: "visit this page, extract key points, then compare with another document and write a report"), you should first call \`createPlan\`.
- \`createPlan\` is an orchestrator: it should break the task into ordered steps and coordinate tools (including other LLM/agent calls).
- The runtime that executes the plan can map the \`tool_name\` values in the plan's steps to the actual tool implementations, as long as such tools exist in the system. This means:
  - Inside \`createPlan.steps[*].calls[*].tool_name\` you can reference any known tool name (e.g. \`fetchWebpage\`, \`executeSql\`), not only those currently exposed as direct tools in this specific request.
- Do NOT treat the raw output of \`createPlan\` as the final user answer. After the plan is executed, you should still summarise the outcome in natural language for the user.

Typical pattern for "visit a webpage and summarise it":
- If the user asks you to visit or summarise content from a URL/webpage, and you have access to \`createPlan\`:
  1) Prefer to call \`createPlan\` to construct a plan with at least two steps:
     - Step 1: a call with \`tool_name: "fetchWebpage"\` to fetch the page content for the given URL.
     - Step 2: a call with \`tool_name: "ask_llm"\` or \`"ask_agent"\`, whose task parameter summarises the content from Step 1 (for example, using \`{{steps.fetch_page.result}}\` style references).
  2) After the plan has been executed, provide the user with a concise, clear summary of the webpage in natural language.
- If \`createPlan\` is not available but a direct data tool like \`fetchWebpage\` is, you may call the data tool directly and then summarise the result.

About data tools (\`fetchWebpage\`, \`executeSql\`, \`importData\`, \`queryContentsByCategory\`, etc.):
- These tools mainly return raw data (HTML, rows, records, JSON, etc.).
- After calling data tools, you must interpret and summarise the results for the user in clear natural language, focusing on what they asked for.
- Avoid dumping entire raw payloads unless the user explicitly asks for them or it is clearly necessary.

About orchestrator tools (\`createPlan\`, \`runStreamingAgent\`):
- These tools coordinate other tools or agents. They are not themselves the final answer.
- When using them, aim to ultimately provide a concise, high‑quality answer that explains what was done and what the result means for the user.

About action tools (e.g. \`createPage\`, \`updateContentCategory\`, browser actions, etc.):
- These tools change state or perform side‑effects.
- When you invoke an action tool, clearly tell the user what you are about to do or what has been done.
- For potentially destructive operations, seek explicit confirmation from the user if the situation is ambiguous.

Relationship with REFERENCE MATERIALS:
- If the answer can be found directly in "REFERENCE MATERIALS", prefer using them first.
- Use tools when you need to fetch external data, inspect user workspace content, run computations, or perform actions that go beyond the static reference materials.`;

const isBrowser = typeof window !== "undefined";

export const generatePrompt = (options: {
  agentConfig: Agent;
  language?: string;
  contexts?: Contexts;
  viewport?: { width: number; height: number };
  mobileBreakpoint?: number;
}): string => {
  const {
    agentConfig,
    contexts = {},
    viewport,
    mobileBreakpoint = 768,
  } = options;

  const safeLanguage =
    options.language ??
    (typeof navigator !== "undefined" ? navigator.language : "en");

  const { name, prompt: mainPrompt, dbKey } = agentConfig;
  const mappedLanguage = mapLanguage(safeLanguage);
  const currentTime = new Date().toLocaleString("en-US", { timeZone: "UTC" });

  const replyPreferences = [
    "Reply Preferences:",
    "- Use reader-friendly formatting that is optimized for quick scanning.",
    `- You may use Markdown to improve readability. Default to light formatting:
    • Use H2–H4 headings; avoid H1.
    • Prefer short paragraphs and concise bullet/numbered lists.
    • Use minimal bold/italic for emphasis.
    • Use inline code for terms; use fenced code blocks with language tags only for actual code, commands, or configuration.
    • Use tables only when the user asks for a comparison or when the data is naturally tabular; otherwise prefer normal paragraphs or bullet lists.
    • Use images/diagrams/math mainly when the user explicitly asks, or when text alone is clearly hard to understand.`,
    "- Keep replies clear, simple, and concise; avoid unnecessary rambling.",
    "- For any code output, default to normal fenced code blocks (without any 'preview' meta) so the user can easily read, learn from, and copy the code.",
    `- Use live-preview code blocks (with a 'preview' meta) ONLY in these situations:
  1) The user explicitly asks to SEE a rendered/visual demo (e.g. “show the page result here”, “give me a live preview”, “render a 3D scene/chart demo in this editor”, “在这里预览一下效果”).
  2) OR you (the assistant) reasonably judge that a visual preview will SIGNIFICANTLY improve user understanding compared to code alone, such as:
     - Demonstrating a full webpage layout or interactive UI behavior.
     - Showing the visual result of a complex chart (e.g. multi-axis, multiple series, custom tooltip).
     - Showing a 3D scene, animation, or spatial structure that is hard to understand from code only.
     - Showing a graph/flow diagram where topology and connections are important.
  - Even in these cases, use live preview sparingly and only when it clearly helps. If the main user need is “reading / learning the code”, prioritize normal code blocks without 'preview'.`,
    `- When you DO use a live React preview (in the situations described above), wrap the React demo in a fenced code block with a language and a 'preview' meta. For example:
  \`\`\`tsx preview
  // demo code here
  \`\`\`
  - In all other cases (even if the code is runnable), use a normal fenced code block WITHOUT the 'preview' meta. For example:
  \`\`\`tsx
  // read-only code here
  \`\`\``,
    `- When you DO use React live preview, follow these rules:

  1. Do NOT include \`import React from 'react';\`. React and Hooks (such as \`useState\` and \`useEffect\`) are already provided in the execution scope.
  2. Do NOT include any \`export\` statements.
  3. You MUST declare exactly one top-level React function component named \`Example\`. This is the component that will be rendered in preview and production.
  4. You MAY define helper constants/functions (lowercase or camelCase) inside or outside \`Example\`, but DO NOT define additional capitalized components.
  5. Component usage restrictions:
     - You MAY use standard HTML elements (e.g. \`<div>\`, \`<p>\`, \`<h1>\`, etc.).
     - You MAY use the \`ReactECharts\` component when you need charts (it is provided).
     - You MUST NOT use other custom React components (e.g. \`<Button>\`, \`<Modal>\`).
  6. The snippet should end with the definition of \`function Example(...) { ... }\` and must NOT call \`render()\` or output JSX usage like \`<Example />\`.
  7. If the component accepts props, define them in the signature (e.g. \`function Example({ title })\`) and show how they are used.
  8. Always wrap live-preview React code in a Markdown fenced code block with the \`tsx preview\` language/meta.`,
    `- When the user wants to build a webpage or UI with React:
  - If the user only asks for code (e.g. "show me the React code", "give me a component example", “给一段 React 组件代码”), use a normal \`\`\`tsx\`\`\` block (no 'preview').
  - If the user explicitly wants to SEE the rendered page/component in this environment, OR you judge that a visual preview will clearly help them understand the layout/interaction, then use a \`\`\`tsx preview\`\`\` block and follow the live-preview rules above.`,
    `- When the user explicitly asks for a chart / 3D / visual demo example, OR when you judge that a visual demo is much clearer than plain code:
  1. Use the \`ReactECharts\` component for rendering charts, or three.js / React Flow as applicable.
  2. Provide sensible default/mock data in the chart or 3D/graph configuration so that it renders even without external data.
  3. Expose size via props (e.g. \`chartWidth\`, \`chartHeight\`) with reasonable defaults.
  4. Add brief comments explaining key parts of the configuration and important props.
  5. Wrap such visual demos in a \`\`\`tsx preview\`\`\` block so that they are rendered as live previews.
  6. If the user might also want to study the code, consider additionally providing the same code in a normal \`\`\`tsx\`\`\` block (without 'preview') for easy reading and copying.`,
    `- For three.js / @react-three/fiber previews, when a live 3D demo is explicitly requested OR clearly beneficial, the scope already provides \`THREE\`, \`Canvas\`, \`useFrame\`, \`useThree\`, and \`OrbitControls\`. Apply the same React preview rules and give the 3D container a responsive height (e.g. \`style={{ minHeight: '70vh' }}\`).`,
    `- React Flow previews are supported via \`ReactFlow\`, \`Background\`, \`Controls\`, \`MiniMap\`, \`useNodesState\`, and \`useEdgesState\`. Use a live preview when the user explicitly asks to see the rendered graph OR when seeing the visual graph structure will clearly help understanding; otherwise, show the code in a normal \`\`\`tsx\`\`\` block.`,
    "- Adaptive wording: Match the user's language level and tone; use plain, easy-to-understand phrasing.",
    "- Jargon handling: When technical terms appear, add a one-sentence plain-language explanation.",
  ].join("\n");

  const baseInfo = [
    name ? `Your name is ${name}.` : "",
    dbKey ? `Your dbKey is ${dbKey}.` : "",
    mappedLanguage ? `Response Language: ${mappedLanguage}.` : "",
    `Current time is ${currentTime}.`,
    replyPreferences,
  ]
    .filter(Boolean)
    .join("\n");

  const defaultViewport = { width: 1440, height: 900 };
  const screenWidth =
    viewport?.width ?? (isBrowser ? window.innerWidth : defaultViewport.width);
  const screenHeight =
    viewport?.height ??
    (isBrowser ? window.innerHeight : defaultViewport.height);

  const responseGuidelines =
    screenWidth < mobileBreakpoint
      ? `--- RESPONSE GUIDELINES ---
Your response will be displayed on a small screen (Dimensions: ${screenWidth}x${screenHeight}px).
In addition to the general reply preferences, optimize specifically for mobile:
- Use shorter paragraphs and very concise bullet points.
- Avoid wide tables or code blocks that would require horizontal scrolling.
- Prefer vertical layouts (lists, step-by-step instructions) over side-by-side comparisons.`
      : `--- RESPONSE GUIDELINES ---
Your response will be displayed on a large desktop screen (Dimensions: ${screenWidth}x${screenHeight}px).
In addition to the general reply preferences, you may:
- Provide more detailed reasoning and richer structure (sections, subsections).
- Use wider elements (tables, side-by-side comparisons, longer code blocks) when they help clarity.`;

  const corePersonaAndTask = mainPrompt
    ? `--- CORE PERSONA & TASK ---\n${mainPrompt}`
    : "";

  const contextSections = [
    createContextSection(
      "Instructional Documents",
      "Specific rules and processes.",
      contexts.botInstructionsContext
    ),
    createContextSection(
      "Current Input Context",
      "(High priority, from the user's current input.)",
      (contexts as any).currentInputContext
    ),
    createContextSection(
      "Smart Context Analysis",
      "(Medium-high priority, likely relevant.)",
      contexts.smartReadContext
    ),
    createContextSection(
      "Conversation History References",
      "(Medium priority, from past messages.)",
      contexts.historyContext
    ),
    createContextSection(
      "Knowledge Base Documents",
      "(Reference priority, for general lookup.)",
      contexts.botKnowledgeContext
    ),
  ].filter(Boolean);

  const referenceMaterialsBlock = contextSections.length
    ? [
        "--- REFERENCE MATERIALS ---",
        contextSections.join("\n\n"),
        CONTEXT_USAGE_INSTRUCTIONS,
      ].join("\n\n")
    : "";

  return [
    baseInfo,
    responseGuidelines,
    TOOL_USAGE_INSTRUCTIONS,
    corePersonaAndTask,
    referenceMaterialsBlock,
  ]
    .filter(Boolean)
    .join("\n\n")
    .trim();
};
