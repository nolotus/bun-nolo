import type { AsyncThunk } from "@reduxjs/toolkit";

import { RootState } from "app/store";
import { selectAllMsgs } from "chat/messages/messageSlice";

/** 简单的数组差集工具：返回 arrA 中不在 arrB 里的元素 */
const difference = <T>(arrA: T[], arrB: T[]): T[] => {
  if (!arrA.length) return [];
  if (!arrB.length) [...arrA];

  const exclude = new Set(arrB);
  return arrA.filter((item) => !exclude.has(item));
};

/**
 * Collect all possible reference keys for this chat turn:
 * - botInstructionKeys: keys from agentConfig.references of type "instruction"
 * - botKnowledgeKeys: keys from agentConfig.references (non-instruction)
 * - currentInputKeys: keys referenced directly by the user's current input (array parts with pageKey)
 * - smartReadKeys: keys inferred by smart read when enabled
 * - historyKeys: keys from all previous messages' content parts
 */
export const getFullChatContextKeys = async (
  state: RootState,
  dispatch: any,
  agentConfig: any,
  userInput: string | any[]
): Promise<Record<string, Set<string>>> => {
  const msgs = selectAllMsgs(state);

  const botInstructionKeys = new Set<string>();
  const botKnowledgeKeys = new Set<string>();

  if (Array.isArray(agentConfig.references)) {
    for (const ref of agentConfig.references as Array<{
      dbKey: string;
      type: string;
    }>) {
      if (!ref?.dbKey) continue;
      if (ref.type === "instruction") {
        botInstructionKeys.add(ref.dbKey);
      } else {
        botKnowledgeKeys.add(ref.dbKey);
      }
    }
  }

  const currentInputKeys = new Set<string>();
  if (Array.isArray(userInput)) {
    for (const part of userInput) {
      if (part?.pageKey) currentInputKeys.add(part.pageKey);
    }
  }

  const smartReadKeys = new Set<string>();

  const historyKeys = new Set<string>();
  for (const msg of msgs as any[]) {
    const contentParts = Array.isArray(msg.content)
      ? msg.content
      : [msg.content];
    for (const part of contentParts) {
      if (part?.pageKey) historyKeys.add(part.pageKey);
    }
  }

  return {
    botInstructionKeys,
    currentInputKeys,
    smartReadKeys,
    historyKeys,
    botKnowledgeKeys,
  };
};

/**
 * Deduplicate keys across priority levels.
 * Priority order (high -> low):
 * 1) botInstructionKeys
 * 2) currentInputKeys
 * 3) smartReadKeys
 * 4) historyKeys
 * 5) botKnowledgeKeys
 *
 * Return field names match context block identifiers expected downstream.
 */
export const deduplicateContextKeys = (
  keys: Record<string, Set<string>>
): Record<string, string[]> => {
  const {
    botInstructionKeys,
    currentInputKeys,
    smartReadKeys,
    historyKeys,
    botKnowledgeKeys,
  } = keys;

  const finalBotInstructionKeys = Array.from(botInstructionKeys);

  const finalCurrentInputKeys = difference(
    Array.from(currentInputKeys),
    finalBotInstructionKeys
  );

  const finalSmartReadKeys = difference(Array.from(smartReadKeys), [
    ...finalBotInstructionKeys,
    ...finalCurrentInputKeys,
  ]);

  const finalHistoryKeys = difference(Array.from(historyKeys), [
    ...finalBotInstructionKeys,
    ...finalCurrentInputKeys,
    ...finalSmartReadKeys,
  ]);

  const finalBotKnowledgeKeys = difference(Array.from(botKnowledgeKeys), [
    ...finalBotInstructionKeys,
    ...finalCurrentInputKeys,
    ...finalSmartReadKeys,
    ...finalHistoryKeys,
  ]);

  return {
    botInstructionsContext: finalBotInstructionKeys,
    currentInputContext: finalCurrentInputKeys,
    smartReadContext: finalSmartReadKeys,
    historyContext: finalHistoryKeys,
    botKnowledgeContext: finalBotKnowledgeKeys,
  };
};
