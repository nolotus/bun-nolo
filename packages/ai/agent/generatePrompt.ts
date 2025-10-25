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
    "- Reader-friendly formatting, optimized for quick scanning.",
    "- You may use Markdown (headings, lists, code blocks) to improve readability.",
    "- By default, keep answers short; if more detail may help, ask the user before expanding.",
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
- Keep your answers concise and to the point.
- Use shorter paragraphs.
- Use bullet points or numbered lists for easier reading on mobile.
- Avoid wide tables or code blocks that might require horizontal scrolling.`;
  } else {
    responseGuidelines = `--- RESPONSE GUIDELINES ---
Your response will be displayed on a large desktop screen (Dimensions: ${screenWidth}x${screenHeight}px). You can provide more detailed and well-formatted responses.`;
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
