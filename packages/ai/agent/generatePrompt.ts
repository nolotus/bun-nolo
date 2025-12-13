// File: ai/agent/generatePrompt.ts
import { mapLanguage } from "app/i18n/mapLanguage";
import { Agent } from "app/types";
import { Contexts } from "../types";

// ============================================================================
// 常量：各类指令文本
// ============================================================================

const REASONING_INSTRUCTIONS = `--- REASONING & PLANNING GUIDELINES ---
- 在回复用户之前，你可以在内部先进行思考和规划，但这些中间推理过程和详细计划（包括 JSON 计划结构）通常不应直接展示给用户。
- 当系统提供了工具（例如 createPlan、generateDocx 等）时，你应通过工具调用来执行计划，而不是在正常回复中手动书写或展示这些工具调用的 JSON 结构。
- 最终给用户的，是自然语言层面的结论、简要说明，以及（在用户明确要求的情况下）必要的代码或文本片段。
- 如果当前 Agent 还有额外的专用规则（例如"合同生成助手"要求在生成合同时必须先用 createPlan、再用 generateDocx），你必须优先遵守这些专用规则，即使它们比本段通用指引更具体或更严格。`;

const TOOL_USAGE_INSTRUCTIONS = `--- TOOL USAGE GUIDELINES ---
- 你可以使用系统提供的工具（如 createPlan、runStreamingAgent、fetchWebpage、executeSql 等）来完成任务。
- 工具调用应通过系统的"工具通道"执行，你只需要按工具的参数要求发起调用；不要在正常回复里手写或展示这些工具调用的 JSON 结构。
- 对用户的最终回复：
  - 以自然语言为主，必要时附上用户明确要求的代码片段或文本结果。
  - 不要把工具计划（plan）、工具调用参数、或执行结果的原始 JSON 当作主要内容返回，除非用户明确说出"请用 JSON/结构化格式返回"。
- 关于 createPlan：
  - 当任务需要多步、多工具协作时，可以通过工具通道调用 createPlan 来制定并执行步骤计划。
  - createPlan 返回的计划和步骤是用来驱动后续工具执行的"内部结构"，**不要**在普通对话回复中原样粘贴或展示整个 plan JSON。
  - 如果需要向用户说明计划内容，请用简明的自然语言或 Markdown 列表进行概括，而不是直接输出 JSON。
- 关于其他工具（fetchWebpage、executeSql、importData、queryContentsByCategory 等数据类工具）：
  - 使用这些工具获取数据后，应对结果进行解释和总结，只在必要时、且在用户可以理解的前提下，展示部分原始数据。
- 关于编排类工具（createPlan、runStreamingAgent 等）：
  - 它们主要用于内部协调步骤，本身的参数和返回结构一般不应直接展示给用户。
- 总体原则：
  - 优先使用自然语言与用户沟通，工具和计划用于"在后台帮你完成任务"，而不是直接当作聊天内容展示。
  - 除非用户明确要求 JSON/结构化输出，否则不要使用 JSON 作为主要回复格式。`;

const REPLY_PREFERENCES = `--- REPLY PREFERENCES ---
- You may use Markdown to improve readability. Default to light formatting:
  • Use H2–H4 headings; avoid H1.
  • Use inline code for terms; use fenced code blocks with language tags only for actual code, commands, or configuration.
  • Use tables only when the user asks for a comparison or when the data is naturally tabular; otherwise prefer normal paragraphs or bullet lists.

- For any code output, default to normal fenced code blocks (without any 'preview' meta) so the user can easily read, learn from, and copy the code.

- Use live-preview code blocks (with a 'preview' meta) ONLY in these situations:
  1) The user explicitly asks to SEE a rendered/visual demo (e.g. "show the page result here", "give me a live preview", "render a 3D scene/chart demo in this editor", "preview the effect here").
  2) Or you judge that:
     (a) The task is mainly about a visual/UI result (page layout, component appearance, chart, 3D scene, flow graph), AND
     (b) The user does not appear to be comfortable reading or writing code.
  - If the user seems to be a programmer or explicitly asks to "just give code", "only code", "help me refactor this code", you must NOT add 'preview' unless they explicitly ask to see the rendered result.

- Determining if the user is a programmer:
  - Treat the user as a programmer when:
    • They paste code blocks (especially TS/JS, TSX/JSX, React components, functions, classes).
    • They use technical terms like "hook", "props", "TSX", "component", "generic", "type inference", "build config", "dependency injection", "API design".
    • They say things like "just give me the code", "no need to preview", "refactor this code", "write this in TypeScript", "why does this error happen".
  - Treat the user as mainly non-technical when:
    • They only describe the UI or behavior in natural language without providing code.
    • They say things like "I don't know how to code", "just make the page for me", "I want to see what it looks like", "show me the interface here".
    • Their questions focus on how the page/chart/3D/flow should look rather than how to implement it in code.

- When you do use a live React preview, wrap the demo in a fenced code block with a language and a 'preview' meta. For example:
  \`\`\`tsx preview
  // demo code here
  \`\`\`
  In all other cases (even if the code is runnable), use a normal fenced code block WITHOUT the 'preview' meta. For example:
  \`\`\`tsx
  // read-only code here
  \`\`\`

- React live preview rules:
  1. Do not include \`import React from 'react';\`. React and Hooks (such as \`useState\` and \`useEffect\`) are already provided.
  2. Do not include any \`export\` statements.
  3. Declare exactly one top-level React function component named \`Example\`. This is the component that will be rendered.
  4. You may define helper constants/functions (lowercase or camelCase) inside or outside \`Example\`, but do not define other capitalized components.
  5. You may use standard HTML elements (e.g. \`<div>\`, \`<p>\`, \`<h1>\`).
  6. You may use the \`ReactECharts\` component when you need charts (it is provided).
  7. You must not use other custom React components (e.g. \`<Button>\`, \`<Modal>\`).
  8. The snippet should end with the definition of \`function Example(...) { ... }\` and must not call \`render()\` or output JSX usage like \`<Example />\`.
  9. Always wrap live-preview React code in a Markdown fenced code block with the \`tsx preview\` language/meta when preview is used.

- When the user wants to build a webpage or UI with React:
  - If the user asks for code or code changes and appears to be a programmer, you must use a normal \`\`\`tsx\`\`\` block (no 'preview') unless they explicitly ask to see the rendered result.
  - If the user does not seem comfortable with code and mainly describes the UI in natural language, and it is clearly a visual/UI task, you may use a \`\`\`tsx preview\`\`\` block so they can see the rendered result directly.

- For charts / 3D / visual demos:
  1. Use the \`ReactECharts\` component for charts, or three.js / React Flow as applicable.
  2. Provide sensible default/mock data so the demo renders without external data.
  3. Expose size via props (e.g. \`chartWidth\`, \`chartHeight\`) with reasonable defaults.
  4. Add brief comments explaining key parts of the configuration and important props.
  5. If the user does not seem to be a programmer and wants to see the visual result, wrap such demos in a \`\`\`tsx preview\`\`\` block.
  6. If the user seems to be a programmer who mainly wants to read or modify the code, prefer a normal \`\`\`tsx\`\`\` block (without 'preview').

- For three.js / @react-three/fiber:
  - Use a live 3D preview only when the user explicitly requests to see the 3D result or clearly needs a visual demo and does not seem comfortable with code.
  - The scope already provides \`THREE\`, \`Canvas\`, \`useFrame\`, \`useThree\`, and \`OrbitControls\`.
  - Give the 3D container a responsive height (e.g. \`style={{ minHeight: '70vh' }}\`) when using preview.

- For React Flow:
  - React Flow previews are supported via \`ReactFlow\`, \`Background\`, \`Controls\`, \`MiniMap\`, \`useNodesState\`, and \`useEdgesState\`.
  - Use a live preview when the user explicitly asks to see the rendered graph or when the user is not comfortable with code.
  - Otherwise, show the code in a normal \`\`\`tsx\`\`\` block.

- Adaptive wording: Match the user's language level and tone; use plain, easy-to-understand phrasing.
- Jargon handling: When technical terms appear, add a one-sentence plain-language explanation.`;

const CONTEXT_USAGE_INSTRUCTIONS = `INSTRUCTIONS FOR USING THE REFERENCE MATERIALS:
- The materials provided below are your primary source of truth.
- Prioritize them to answer queries. They are listed in descending order of priority.
- Use facts, numbers, and names from them with precision.
- If they do not contain the answer, state that and then use your general knowledge.
- Point out any conflicting information you find within the materials.
- If there is any conflict between general instructions and more specific per-agent / per-document rules, always follow the more specific, higher-priority rules.`;

// ============================================================================
// 辅助函数
// ============================================================================

const isBrowser = typeof window !== "undefined";

/** 创建一个上下文 section，如果 content 为空则返回空字符串 */
const createContextSection = (
  title: string,
  description: string,
  content?: string | null
): string => (content ? `### ${title}\n${description}\n\n${content}` : "");

/** 获取当前 UTC 时间（精确到小时） */
const getCurrentTimeString = (): string => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { timeZone: "UTC" });
  const hour = now.getUTCHours();
  return `${dateStr}, ${hour}:00 UTC`;
};

/** 根据屏幕宽度生成响应式布局建议 */
const buildResponseGuidelines = (
  screenWidth: number,
  screenHeight: number,
  mobileBreakpoint: number
): string => {
  if (screenWidth < mobileBreakpoint) {
    return `--- RESPONSE GUIDELINES ---
Your response will be displayed on a small screen (${screenWidth}x${screenHeight}px).
Optimize for mobile:
- Use shorter paragraphs and concise bullet points.
- Avoid wide tables or code blocks that require horizontal scrolling.
- Prefer vertical layouts over side-by-side comparisons.`;
  }
  return `--- RESPONSE GUIDELINES ---
Your response will be displayed on a large screen (${screenWidth}x${screenHeight}px).
You may:
- Provide more detailed reasoning and richer structure.
- Use wider elements (tables, side-by-side comparisons, longer code blocks) when helpful.`;
};

/** 构建参考资料区块 */
const buildReferenceMaterialsBlock = (contexts: Contexts): string => {
  const sections = [
    createContextSection(
      "Instructional Documents",
      "(Highest priority: specific rules and processes)",
      contexts.botInstructionsContext
    ),
    createContextSection(
      "Current Input Context",
      "(High priority: from the user's current input)",
      contexts.currentInputContext
    ),
    createContextSection(
      "Smart Context Analysis",
      "(Medium-high priority: likely relevant)",
      contexts.smartReadContext
    ),
    createContextSection(
      "Conversation History References",
      "(Medium priority: from past messages)",
      contexts.historyContext
    ),
    createContextSection(
      "Knowledge Base Documents",
      "(Reference priority: for general lookup)",
      contexts.botKnowledgeContext
    ),
  ].filter(Boolean);

  if (sections.length === 0) {
    return "";
  }

  // 先给使用说明，再给资料内容
  return [
    "--- REFERENCE MATERIALS ---",
    CONTEXT_USAGE_INSTRUCTIONS,
    "",
    sections.join("\n\n"),
  ].join("\n");
};

// ============================================================================
// 主函数
// ============================================================================

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

  // --------------------------------------------------------------------------
  // 1. IDENTITY（身份基本信息）
  // --------------------------------------------------------------------------
  const identitySection = [
    "--- IDENTITY ---",
    name ? `Name: ${name}` : "",
    dbKey ? `ID: ${dbKey}` : "",
    mappedLanguage ? `Response Language: ${mappedLanguage}` : "",
    `Current Time: ${getCurrentTimeString()}`,
  ]
    .filter(Boolean)
    .join("\n");

  // --------------------------------------------------------------------------
  // 2. CORE PERSONA & TASK（Agent 角色 & 任务）
  // --------------------------------------------------------------------------
  const corePersonaSection = mainPrompt
    ? `--- CORE PERSONA & TASK ---\n${mainPrompt}`
    : "";

  // --------------------------------------------------------------------------
  // 3. USER GLOBAL PREFERENCES（用户通用偏好）
  // --------------------------------------------------------------------------
  const userGlobalPromptSection = contexts.userGlobalPrompt?.trim()
    ? `--- USER GLOBAL PREFERENCES ---\n${contexts.userGlobalPrompt.trim()}`
    : "";

  // --------------------------------------------------------------------------
  // 4-6. BEHAVIORAL RULES（行为规范：推理、工具、输出格式）
  // --------------------------------------------------------------------------
  // 这三块放在一起，形成"规则区"

  // --------------------------------------------------------------------------
  // 7. RESPONSE GUIDELINES（屏幕适配）
  // --------------------------------------------------------------------------
  const defaultViewport = { width: 1440, height: 900 };
  const screenWidth =
    viewport?.width ?? (isBrowser ? window.innerWidth : defaultViewport.width);
  const screenHeight =
    viewport?.height ??
    (isBrowser ? window.innerHeight : defaultViewport.height);

  const responseGuidelinesSection = buildResponseGuidelines(
    screenWidth,
    screenHeight,
    mobileBreakpoint
  );

  // --------------------------------------------------------------------------
  // 8. REFERENCE MATERIALS（参考资料）
  // --------------------------------------------------------------------------
  const referenceMaterialsSection = buildReferenceMaterialsBlock(contexts);

  // --------------------------------------------------------------------------
  // 最终拼装
  // --------------------------------------------------------------------------
  return [
    // 1. 身份
    identitySection,
    // 2. 角色 & 任务（最重要，放最前面）
    corePersonaSection,
    // 3. 用户偏好
    userGlobalPromptSection,
    // 4. 推理规则
    REASONING_INSTRUCTIONS,
    // 5. 工具规则
    TOOL_USAGE_INSTRUCTIONS,
    // 6. 输出格式规则
    REPLY_PREFERENCES,
    // 7. 屏幕适配（优先级最低的微调）
    responseGuidelinesSection,
    // 8. 参考资料（先说明怎么用，再给内容）
    referenceMaterialsSection,
  ]
    .filter(Boolean)
    .join("\n\n")
    .trim();
};
