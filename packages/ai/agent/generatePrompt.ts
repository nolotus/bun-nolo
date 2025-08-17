// 文件: ai/agent/generatePrompt.ts

import { mapLanguage } from "app/i18n/mapLanguage";
import { Agent } from "app/types";

import { Contexts } from "../types";

/**
 * 创建带有标题和描述的上下文部分。
 */
const createContextSection = (
  title: string,
  description: string,
  content: string | null | undefined
): string => {
  if (!content) return "";
  return `## ${title}\n${description}\n\n${content}`;
};

// 这些严格的指令只应在有上下文时使用
const CONTEXT_USAGE_INSTRUCTIONS = `INSTRUCTIONS FOR USING THE REFERENCE MATERIALS:
- The materials provided under "REFERENCE MATERIALS" are your primary source of truth.
- Prioritize them to answer queries. They are listed in descending order of priority.
- Use facts, numbers, and names from them with precision.
- If they do not contain the answer, state that and then use your general knowledge.
- Point out any conflicting information you find within the materials.`;

export const generatePrompt = (options: {
  agentConfig: Agent;
  language?: string;
  contexts?: Contexts;
}): string => {
  const { agentConfig, language = navigator.language, contexts = {} } = options;
  const { name, prompt: mainPrompt, id, dbKey } = agentConfig;
  const mappedLanguage = mapLanguage(language);
  const currentTime = new Date().toLocaleString("en-US", { timeZone: "UTC" });

  // 1. 基础信息区
  const baseInfo = [
    name ? `Your name is ${name}.` : "",
    dbKey ? `Your dbKey is ${dbKey}.` : "",
    mappedLanguage ? `Response Language: ${mappedLanguage}.` : "",
    `Current time is ${currentTime}.`,
  ]
    .filter(Boolean)
    .join("\n");

  // *** 新增代码开始 ***
  // 2. 响应指南区 (根据屏幕尺寸动态生成)
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const mobileBreakpoint = 768; // 常用的移动端/平板断点

  let responseGuidelines = "";
  if (screenWidth < mobileBreakpoint) {
    responseGuidelines = `--- RESPONSE GUIDELINES ---
Your response will be displayed on a small screen (Dimensions: ${screenWidth}x${screenHeight}px).
- Keep your answers concise and to the point.
- Use shorter paragraphs.
- Use bullet points or numbered lists for easier reading on mobile.
- Avoid wide tables or code blocks that might require horizontal scrolling.`;
  } else {
    // （可选）为桌面端也提供上下文，让AI知道它有更多空间发挥
    responseGuidelines = `--- RESPONSE GUIDELINES ---
Your response will be displayed on a large desktop screen (Dimensions: ${screenWidth}x${screenHeight}px). You can provide more detailed and well-formatted responses.`;
  }
  // *** 新增代码结束 ***

  // 3. 核心人格与任务区
  const corePersonaAndTask = mainPrompt
    ? `--- CORE PERSONA & TASK ---\n${mainPrompt}`
    : "";

  // 4. 上下文资料区
  const contextSections = [
    createContextSection(
      "Instructional Documents",
      "Specific rules and processes.",
      contexts.botInstructionsContext
    ),
    createContextSection(
      "User's Current References",
      "(High priority, from user for this request.)",
      contexts.currentUserContext
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

  // 5. 最终组装 (已更新)
  const finalPrompt = [
    baseInfo,
    responseGuidelines, // 将新创建的响应指南加入
    corePersonaAndTask,
    referenceMaterialsBlock,
  ]
    .filter(Boolean)
    .join("\n\n");

  return finalPrompt;
};
