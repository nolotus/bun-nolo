// File: ai/agent/generatePrompt.ts

import { mapLanguage } from "app/i18n/mapLanguage";
import { Agent } from "app/types";
import { Contexts } from "../types";

/**
 * Create a context section with title and description.
 */
const createContextSection = (
  title: string,
  description: string,
  content: string | null | undefined
): string => {
  if (!content) return "";
  return `## ${title}\n${description}\n\n${content}`;
};

// These strict instructions should only be included when reference materials are present.
const CONTEXT_USAGE_INSTRUCTIONS = `INSTRUCTIONS FOR USING THE REFERENCE MATERIALS:
- The materials provided under "REFERENCE MATERIALS" are your primary source of truth.
- Prioritize them to answer queries. They are listed in descending order of priority.
- Use facts, numbers, and names from them with precision.
- If they do not contain the answer, state that and then use your general knowledge.
- Point out any conflicting information you find within the materials.`;

// Safe check for SSR/Node environments
const isBrowser = typeof window !== "undefined";

/**
 * Generate Prompt
 */
export const generatePrompt = (options: {
  agentConfig: Agent;
  language?: string;
  contexts?: Contexts;
  // Allow external viewport (useful for SSR/server rendering)
  viewport?: { width: number; height: number };
  // Allow custom mobile breakpoint
  mobileBreakpoint?: number;
}): string => {
  const {
    agentConfig,
    contexts = {},
    viewport,
    mobileBreakpoint = 768,
  } = options;

  // SSR-safe language retrieval
  const safeLanguage =
    options.language ??
    (typeof navigator !== "undefined" ? navigator.language : "en");

  const { name, prompt: mainPrompt, dbKey } = agentConfig;
  const mappedLanguage = mapLanguage(safeLanguage);
  const currentTime = new Date().toLocaleString("en-US", { timeZone: "UTC" });

  // 1. Base info + reply preferences
  const replyPreferences = [
    "Reply Preferences:",
    "- Use reader-friendly formatting that is optimized for quick scanning.",
    `- You may use Markdown to improve readability. Default to light formatting:
    • Use H2–H4 headings; avoid H1.
    • Prefer short paragraphs and concise bullet/numbered lists.
    • Use minimal bold/italic for emphasis.
    • Use inline code for terms; use fenced code blocks with language tags and a brief note when this helps the user.
    • Use tables when they clearly help understanding; choose an appropriate number of columns and include a one-line plain-text summary after each table.
    • Use descriptive link text; add source name/date when relevant.
    • Use images/diagrams/math when they clearly help understanding or when the user asks; provide brief alt/fallback text.`,
    "- Keep replies clear, simple, and concise; avoid unnecessary rambling.",
    "- If the content is likely to be copied by users, place it inside a fenced code block (with a language tag when appropriate).",
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

  // 2. Response guidelines (dynamic by screen size, SSR safe)
  const defaultViewport = { width: 1440, height: 900 };
  const screenWidth =
    viewport?.width ?? (isBrowser ? window.innerWidth : defaultViewport.width);
  const screenHeight =
    viewport?.height ??
    (isBrowser ? window.innerHeight : defaultViewport.height);

  let responseGuidelines = "";
  if (screenWidth < mobileBreakpoint) {
    responseGuidelines = `--- RESPONSE GUIDELINES ---
Your response will be displayed on a small screen (Dimensions: ${screenWidth}x${screenHeight}px).
In addition to the general reply preferences, optimize specifically for mobile:
- Use shorter paragraphs and very concise bullet points.
- Avoid wide tables or code blocks that would require horizontal scrolling.
- Prefer vertical layouts (lists, step-by-step instructions) over side-by-side comparisons.`;
  } else {
    responseGuidelines = `--- RESPONSE GUIDELINES ---
Your response will be displayed on a large desktop screen (Dimensions: ${screenWidth}x${screenHeight}px).
In addition to the general reply preferences, you may:
- Provide more detailed reasoning and richer structure (sections, subsections).
- Use wider elements (tables, side-by-side comparisons, longer code blocks) when they help clarity.`;
  }

  // 3. Core persona & task
  const corePersonaAndTask = mainPrompt
    ? `--- CORE PERSONA & TASK ---\n${mainPrompt}`
    : "";

  // 4. Reference materials
  const contextSections = [
    createContextSection(
      "Instructional Documents",
      "Specific rules and processes.",
      contexts.botInstructionsContext
    ),
    createContextSection(
      "Current Input Context",
      "(High priority, from the user's current input.)",
      // Renamed from currentUserContext -> currentInputContext
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

  let referenceMaterialsBlock = "";
  if (contextSections.length > 0) {
    const materials = contextSections.join("\n\n");
    referenceMaterialsBlock = [
      `--- REFERENCE MATERIALS ---`,
      materials,
      CONTEXT_USAGE_INSTRUCTIONS,
    ].join("\n\n");
  }

  // 5. Final assembly
  const finalPrompt = [
    baseInfo,
    responseGuidelines,
    corePersonaAndTask,
    referenceMaterialsBlock,
  ]
    .filter(Boolean)
    .join("\n\n")
    .trim();

  return finalPrompt;
};
