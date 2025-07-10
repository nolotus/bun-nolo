import { fetchReferenceContents } from "ai/context/buildReferenceContext";

export interface AgentContexts {
  botInstructionsContext: string[];
  botKnowledgeContext: string[];
}

/** 根据 agentConfig.references 拉取 instruction / knowledge */
export async function fetchAgentContexts(
  references: { dbKey: string; type: string }[] | undefined,
  dispatch: any
): Promise<AgentContexts> {
  if (!Array.isArray(references)) {
    return { botInstructionsContext: [], botKnowledgeContext: [] };
  }
  const instructionKeys = new Set<string>();
  const knowledgeKeys = new Set<string>();
  references.forEach((ref) => {
    if (!ref.dbKey) return;
    ref.type === "instruction"
      ? instructionKeys.add(ref.dbKey)
      : knowledgeKeys.add(ref.dbKey);
  });
  const [botInstructionsContext, botKnowledgeContext] = await Promise.all([
    fetchReferenceContents(Array.from(instructionKeys), dispatch),
    fetchReferenceContents(Array.from(knowledgeKeys), dispatch),
  ]);
  return { botInstructionsContext, botKnowledgeContext };
}
