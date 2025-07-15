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

  // 1. 基础信息区 (始终存在)
  const baseInfo = [
    name ? `Your name is ${name}.` : "",
    dbKey ? `Your dbKey is ${dbKey}.` : "",
    mappedLanguage ? `Response Language: ${mappedLanguage}.` : "",
    `Current time is ${currentTime}.`,
  ]
    .filter(Boolean)
    .join("\n");

  // 2. 核心人格与任务区 (由 mainPrompt 定义)
  const corePersonaAndTask = mainPrompt
    ? `--- CORE PERSONA & TASK ---\n${mainPrompt}`
    : "";

  // 3. 上下文资料区 (动态构建)
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

  // 只有在真的有上下文时，才构建整个“参考资料”区块和其使用指令
  if (contextSections.length > 0) {
    const materials = contextSections.join("\n\n");
    referenceMaterialsBlock = [
      `--- REFERENCE MATERIALS ---`,
      materials,
      CONTEXT_USAGE_INSTRUCTIONS,
    ].join("\n\n");
  }

  // 4. 最终组装
  const finalPrompt = [baseInfo, corePersonaAndTask, referenceMaterialsBlock]
    .filter(Boolean)
    .join("\n\n");

  return finalPrompt;
};
