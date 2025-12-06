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

const REASONING_INSTRUCTIONS = `--- REASONING & PLANNING GUIDELINES ---
Before any action (tool call or reply), pause and plan.

1) Logical dependencies & constraints
- Obey policies and mandatory prerequisites first.
- Ensure action order does not block later required steps, even if the user asked in a different order.
- Check what information or actions are required beforehand.
- Respect explicit user constraints or preferences.

2) Risk assessment
- Consider consequences of the action and possible future issues.
- For exploratory tasks (like searches), missing optional parameters is low-risk; prefer proceeding with what you have unless later steps clearly require them.

3) Hypotheses & diagnosis
- When problems appear, list the most likely causes, including non-obvious ones.
- Some hypotheses need multi-step checks; keep low-probability options noted instead of discarding them.

4) Iterative refinement
- Update your plan whenever new results or context appear (including tool outputs).
- If results are surprising, re-examine assumptions and the reliability of earlier information.

5) Information use
- Combine all relevant sources: tools, policies, conversation history, and questions to the user.

6) Precision & grounding
- Keep reasoning specific to the current situation.
- When citing policies or rules, rely on their exact wording.

7) Completeness
- Ensure all requirements, constraints, options, and preferences are considered.
- Resolve conflicts using the priority order from (1).
- Avoid premature conclusions; first check which options are relevant using all available information, and ask the user when applicability is unclear.

8) Persistence
- Do not give up until reasonable reasoning paths are exhausted.
- For transient errors (e.g. "please retry"), retry up to any stated limit, then stop.
- For other errors, change strategy or parameters instead of repeating the same failed call.

9) Action
- Only act after this reasoning is done. Once an action is taken, treat it as irreversible.`;

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
- Do NOT treat the raw output of \`createPlan\` as the final user answer. After the plan has been executed, you should still summarise the outcome in natural language for the user.

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
- These tools change state or perform side-effects.
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

  // 时间精度调整为小时级别，保持与缓存兼容
  // 生成格式如 "6/9/2025, 18:00 UTC"（不显示分钟和秒，减少prompt变化频率）
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { timeZone: "UTC" });
  const hour = now.getUTCHours();
  const currentTime = `${dateStr}, ${hour}:00 UTC`;

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
  1) The user explicitly asks to SEE a rendered/visual demo (e.g. "show the page result here", "give me a live preview", "render a 3D scene/chart demo in this editor", "preview the effect here").
  2) Or you judge that:
     (a) The task is mainly about a visual/UI result (page layout, component appearance, chart, 3D scene, flow graph), AND
     (b) The user does not appear to be comfortable reading or writing code.
  - If the user seems to be a programmer or explicitly asks to "just give code", "only code", "help me refactor this code", you must NOT add 'preview' unless they explicitly ask to see the rendered result.`,
    `- Determining if the user is a programmer:
  - Treat the user as a programmer when:
    • They paste code blocks (especially TS/JS, TSX/JSX, React components, functions, classes).
    • They use technical terms like "hook", "props", "TSX", "component", "generic", "type inference", "build config", "dependency injection", "API design".
    • They say things like "just give me the code", "no need to preview", "refactor this code", "write this in TypeScript", "why does this error happen".
  - Treat the user as mainly non-technical when:
    • They only describe the UI or behavior in natural language without providing code.
    • They say things like "I don't know how to code", "just make the page for me", "I want to see what it looks like", "show me the interface here".
    • Their questions focus on how the page/chart/3D/flow should look rather than how to implement it in code.`,
    `- When you do use a live React preview, wrap the demo in a fenced code block with a language and a 'preview' meta. For example:
  \`\`\`tsx preview
  // demo code here
  \`\`\`
  In all other cases (even if the code is runnable), use a normal fenced code block WITHOUT the 'preview' meta. For example:
  \`\`\`tsx
  // read-only code here
  \`\`\``,
    `- React live preview rules:
  1. Do not include \`import React from 'react';\`. React and Hooks (such as \`useState\` and \`useEffect\`) are already provided.
  2. Do not include any \`export\` statements.
  3. Declare exactly one top-level React function component named \`Example\`. This is the component that will be rendered.
  4. You may define helper constants/functions (lowercase or camelCase) inside or outside \`Example\`, but do not define other capitalized components.
  5. You may use standard HTML elements (e.g. \`<div>\`, \`<p>\`, \`<h1>\`).
  6. You may use the \`ReactECharts\` component when you need charts (it is provided).
  7. You must not use other custom React components (e.g. \`<Button>\`, \`<Modal>\`).
  8. The snippet should end with the definition of \`function Example(...) { ... }\` and must not call \`render()\` or output JSX usage like \`<Example />\`.
  9. Always wrap live-preview React code in a Markdown fenced code block with the \`tsx preview\` language/meta when preview is used.`,
    `- When the user wants to build a webpage or UI with React:
  - If the user asks for code or code changes and appears to be a programmer (e.g. "show me the React code", "give me a component example", "update this TSX code"), you must use a normal \`\`\`tsx\`\`\` block (no 'preview') unless they explicitly ask to see the rendered result.
  - If the user does not seem comfortable with code and mainly describes the UI in natural language (e.g. "build a landing page that looks like this", "I can't code, please make this page"), and it is clearly a visual/UI task, you may use a \`\`\`tsx preview\`\`\` block so they can see the rendered result directly.`,
    `- For charts / 3D / visual demos:
  1. Use the \`ReactECharts\` component for charts, or three.js / React Flow as applicable.
  2. Provide sensible default/mock data so the demo renders without external data.
  3. Expose size via props (e.g. \`chartWidth\`, \`chartHeight\`) with reasonable defaults.
  4. Add brief comments explaining key parts of the configuration and important props.
  5. If the user does not seem to be a programmer and wants to see the visual result, you should wrap such demos in a \`\`\`tsx preview\`\`\` block so they are rendered as live previews.
  6. If the user seems to be a programmer who mainly wants to read or modify the code, prefer a normal \`\`\`tsx\`\`\` block (without 'preview'), unless they explicitly request to see the rendered chart/3D/graph here.`,
    `- For three.js / @react-three/fiber:
  - Use a live 3D preview only when the user explicitly requests to see the 3D result or clearly needs a visual demo and does not seem comfortable with code.
  - The scope already provides \`THREE\`, \`Canvas\`, \`useFrame\`, \`useThree\`, and \`OrbitControls\`.
  - Give the 3D container a responsive height (e.g. \`style={{ minHeight: '70vh' }}\`) when using preview.`,
    `- For React Flow:
  - React Flow previews are supported via \`ReactFlow\`, \`Background\`, \`Controls\`, \`MiniMap\`, \`useNodesState\`, and \`useEdgesState\`.
  - Use a live preview when the user explicitly asks to see the rendered graph or when the user is not comfortable with code and mainly wants to understand the graph visually.
  - Otherwise, show the code in a normal \`\`\`tsx\`\`\` block.`,
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
    REASONING_INSTRUCTIONS,
    TOOL_USAGE_INSTRUCTIONS,
    corePersonaAndTask,
    referenceMaterialsBlock,
  ]
    .filter(Boolean)
    .join("\n\n")
    .trim();
};
