import { mapLanguage } from "i18n/mapLanguage";

// 接口定义保持不变
interface Contexts {
  botInstructionsContext?: string | null;
  currentUserContext?: string | null;
  smartReadContext?: string | null;
  historyContext?: string | null;
  botKnowledgeContext?: string | null;
}

interface GeneratePromptOptions {
  mainPrompt?: string;
  name?: string;
  language?: string;
  contexts?: Contexts;
}

// 辅助函数保持不变，其设计非常稳健
const createContextSection = (
  title: string,
  description: string,
  content: string | null | undefined
): string => {
  if (!content) return "";
  return `## ${title}\n${description}\n\n${content}`;
};

// [关键优化 1] 这些严格的指令只应在有上下文时使用
const CONTEXT_USAGE_INSTRUCTIONS = `INSTRUCTIONS FOR USING THE REFERENCE MATERIALS:
- The materials provided under "REFERENCE MATERIALS" are your primary source of truth.
- Prioritize them to answer queries. They are listed in descending order of priority.
- Use facts, numbers, and names from them with precision.
- If they do not contain the answer, state that and then use your general knowledge.
- Point out any conflicting information you find within the materials.`;

export const generatePrompt = (options: GeneratePromptOptions = {}): string => {
  const {
    mainPrompt = "",
    name = "",
    language = navigator.language,
    contexts = {},
  } = options;
  const mappedLanguage = mapLanguage(language);
  const currentTime = new Date().toLocaleString("en-US", { timeZone: "UTC" });

  // --- 1. 基础信息区 (始终存在) ---
  const baseInfo = [
    name ? `Your name is ${name}.` : "",
    mappedLanguage ? `Response Language: ${mappedLanguage}.` : "",
    `Current time is ${currentTime}.`,
  ]
    .filter(Boolean)
    .join("\n");

  // --- 2. 核心人格与任务区 (由 mainPrompt 定义) ---
  // 这是最灵活的部分，调用者可以定义任何任务，从“你是法律顾问”到“你是莎士比亚”
  const corePersonaAndTask = mainPrompt
    ? `--- CORE PERSONA & TASK ---\n${mainPrompt}`
    : "";

  // --- 3. 上下文资料区 (动态构建) ---
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

  // [关键优化 2] 只有在真的有上下文时，才构建整个“参考资料”区块和其使用指令
  if (contextSections.length > 0) {
    const materials = contextSections.join("\n\n");
    referenceMaterialsBlock = [
      `--- REFERENCE MATERIALS ---`,
      materials,
      CONTEXT_USAGE_INSTRUCTIONS, // 指令紧跟在资料之后，逻辑清晰
    ].join("\n\n");
  }

  // --- 4. 最终组装 ---
  // 结构变为：基础信息 -> 核心人格 -> [可选的参考资料及指令]
  const finalPrompt = [
    baseInfo,
    corePersonaAndTask,
    referenceMaterialsBlock, // 如果没有上下文，此项为空字符串，会被 filter 掉
    // 移除结尾的通用指令，因为它可能与创意任务冲突。格式化要求可以放在 mainPrompt 里。
  ]
    .filter(Boolean)
    .join("\n\n");

  return finalPrompt;
};
