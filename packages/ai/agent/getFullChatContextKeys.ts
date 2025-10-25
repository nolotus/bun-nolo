import * as R from "rambda";
import type { AsyncThunk } from "@reduxjs/toolkit";

import { RootState } from "app/store";
import { selectAllMsgs } from "chat/messages/messageSlice";
import { selectCurrentSpace } from "create/space/spaceSlice";
import { contextCybotId } from "core/init";

import { formatDataForApi } from "./formatDataForApi";
import { runLlm } from "../cybot/cybotSlice";

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
  if (agentConfig.smartReadEnabled === true) {
    const spaceData = selectCurrentSpace(state);
    const formattedData = formatDataForApi(spaceData, msgs);

    try {
      const outputReference = await dispatch(
        (runLlm as unknown as AsyncThunk<any, any, any>)({
          cybotId: contextCybotId,
          content: `User Input: 请提取相关内容的 contentKey ID\n\n${formattedData}`,
        })
      ).unwrap();

      const cleanedOutput = String(outputReference)
        .replace(/```json|```/g, "")
        .trim();
      if (cleanedOutput) {
        const parsed = JSON.parse(cleanedOutput);
        if (Array.isArray(parsed)) {
          for (const key of parsed) {
            if (typeof key === "string") smartReadKeys.add(key);
          }
        }
      }
    } catch (error) {
      console.error(
        "getFullChatContextKeys - Failed to parse smartRead output:",
        error
      );
    }
  }

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

  const finalCurrentInputKeys = R.difference(
    Array.from(currentInputKeys),
    finalBotInstructionKeys
  );

  const finalSmartReadKeys = R.difference(Array.from(smartReadKeys), [
    ...finalBotInstructionKeys,
    ...finalCurrentInputKeys,
  ]);

  const finalHistoryKeys = R.difference(Array.from(historyKeys), [
    ...finalBotInstructionKeys,
    ...finalCurrentInputKeys,
    ...finalSmartReadKeys,
  ]);

  const finalBotKnowledgeKeys = R.difference(Array.from(botKnowledgeKeys), [
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
