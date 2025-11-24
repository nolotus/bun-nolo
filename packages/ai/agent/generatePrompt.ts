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
    // === 代码块 / preview 相关规则（已按你需求调整） ===
    "- For any code output, default to normal fenced code blocks (without any 'preview' meta) so the user can easily read, learn from, and copy the code.",
    `- Use live-preview code blocks (with a 'preview' meta) ONLY in these situations:
  1) The user explicitly asks to SEE a rendered/visual demo (e.g. “show the page result here”, “give me a live preview”, “render a 3D scene/chart demo in this editor”, “在这里预览一下效果”).
  2) OR you (the assistant) reasonably judge that a visual preview would SIGNIFICANTLY improve user understanding compared to code alone, such as:
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
    corePersonaAndTask,
    referenceMaterialsBlock,
  ]
    .filter(Boolean)
    .join("\n\n")
    .trim();
};
