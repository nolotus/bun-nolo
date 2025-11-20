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
    `- When you output runnable UI or component demos that should be rendered as a live preview in the editor, wrap them in fenced code blocks with a language and a 'preview' meta. For example:
  \`\`\`tsx preview
  // demo code here
  \`\`\`
  - When you output code that is only meant to be read (not executed as a live preview), use a normal fenced code block with only the language, without the 'preview' meta. For example:
  \`\`\`tsx
  // read-only code here
  \`\`\``,
    `- For any React UI demo that should run in the live preview (including normal webpages/components and ReactECharts charts), follow these rules:

  1. Do NOT include \`import React from 'react';\`. React and common Hooks (such as \`useState\` and \`useEffect\`) are already provided in the execution scope.
  2. Do NOT include any \`export\` statements. The snippet is only used for preview and does not need to be exported.
  3. Component usage restrictions:
     - You MAY use standard HTML elements (e.g. \`<div>\`, \`<p>\`, \`<h1>\`, \`<span>\`, \`<button>\`, \`<input>\`, \`<img>\`, \`<ul>\`, \`<li>\`, etc.).
     - You MAY use the \`ReactECharts\` component when you need charts (it is provided in the execution scope).
     - You MUST NOT use any other custom React components (e.g. \`<Button>\`, \`<Icon>\`, \`<Modal>\`, etc.).
  4. The snippet should primarily define a single React function component. You may also define small helper functions or variables either inside or outside the component.
  5. Do NOT call \`render()\` and do NOT end the snippet with a JSX usage of the component (e.g. do NOT put \`<MyComponent />\` at the end). The platform will handle rendering; the snippet should end at the function component definition.
  6. If the component accepts props, define them clearly in the function signature (for example, \`function MyComponent({ title, count = 0 })\`) and demonstrate how these props are used in the JSX.
  7. Make sure the entire snippet is valid JavaScript/JSX code.
  8. Always wrap live-preview React code in a Markdown fenced code block with the \`tsx preview\` language/meta, for example:
  \`\`\`tsx preview
  // React component code here
  \`\`\``,
    `- When the user wants to build a webpage or UI with React, apply the above rules and generate a React function component using only standard HTML elements (no custom UI libraries).`,
    `- When the user explicitly asks for a chart example, apply the same rules but additionally:
  1. Use the \`ReactECharts\` component for rendering charts.
  2. Provide sensible default/mock data in the ECharts \`option\` object so that the chart renders even without external data.
  3. Expose chart size via props (for example, \`chartWidth\` and \`chartHeight\`) with reasonable default values.
  4. Add brief comments explaining key parts of the chart configuration and important props.`,
    `- For three.js / @react-three/fiber previews, the scope already provides \`THREE\`, \`Canvas\`, \`useFrame\`, \`useThree\`, and \`OrbitControls\`. Apply the same React preview rules and give the 3D container a responsive height (e.g. \`style={{ minHeight: '70vh' }}\` or \`flex: 1\`) when fullscreen rendering is expected.`,
    `- React Flow previews are supported via \`ReactFlow\`, \`Background\`, \`Controls\`, \`MiniMap\`, \`useNodesState\`, \`useEdgesState\`, and \`addEdge\` (from @xyflow/react). Use them for流程图、依赖关系、DAG/节点编辑等场景，并提供默认的 nodes/edges 以便示例直接渲染，同时遵守上述 React 预览规则。`,
    "- Adaptive wording: Match the user's language level and tone; use plain, easy-to-understand phrasing. If the user is casual or chatty, reply in simple, conversational sentences.",
    "- Jargon handling: When technical terms appear, add a one-sentence plain-language explanation; include a relatable example or analogy when helpful.",
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
    corePersonaAndTask,
    referenceMaterialsBlock,
  ]
    .filter(Boolean)
    .join("\n\n")
    .trim();
};
