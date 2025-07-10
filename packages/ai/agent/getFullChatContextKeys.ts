import * as R from "rambda";

import { RootState } from "app/store";
import { selectAllMsgs } from "chat/messages/messageSlice";
import { selectCurrentSpace } from "create/space/spaceSlice";
import { contextCybotId } from "core/init";

import { formatDataForApi } from "./formatDataForApi";
import { runLlm } from "../cybot/cybotSlice";

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
    agentConfig.references.forEach((ref: { dbKey: string; type: string }) => {
      if (ref?.dbKey) {
        if (ref.type === "instruction") botInstructionKeys.add(ref.dbKey);
        else botKnowledgeKeys.add(ref.dbKey);
      }
    });
  }
  const currentUserKeys = new Set<string>();
  if (Array.isArray(userInput)) {
    userInput.forEach(
      (part: any) => part?.pageKey && currentUserKeys.add(part.pageKey)
    );
  }
  const smartReadKeys = new Set<string>();
  if (agentConfig.smartReadEnabled === true) {
    const spaceData = selectCurrentSpace(state);
    const formattedData = formatDataForApi(spaceData, msgs);
    try {
      const outputReference = await dispatch(
        (runLlm as AsyncThunk<any, any, any>)({
          cybotId: contextCybotId,
          content: `User Input: 请提取相关内容的 contentKey ID\n\n${formattedData}`,
        })
      ).unwrap();
      const cleanedOutput = outputReference.replace(/```json|```/g, "").trim();
      if (cleanedOutput) {
        const parsedKeys = JSON.parse(cleanedOutput);
        if (Array.isArray(parsedKeys)) {
          parsedKeys.forEach(
            (key) => typeof key === "string" && smartReadKeys.add(key)
          );
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
  msgs.forEach((msg: any) => {
    const content = Array.isArray(msg.content) ? msg.content : [msg.content];
    content.forEach(
      (part: any) => part?.pageKey && historyKeys.add(part.pageKey)
    );
  });
  return {
    botInstructionKeys,
    currentUserKeys,
    smartReadKeys,
    historyKeys,
    botKnowledgeKeys,
  };
};
export const deduplicateContextKeys = (
  keys: Record<string, Set<string>>
): Record<string, string[]> => {
  const {
    botInstructionKeys,
    currentUserKeys,
    smartReadKeys,
    historyKeys,
    botKnowledgeKeys,
  } = keys;
  const finalBotInstructionKeys = Array.from(botInstructionKeys);
  const finalCurrentUserKeys = R.difference(
    Array.from(currentUserKeys),
    finalBotInstructionKeys
  );
  const finalSmartReadKeys = R.difference(Array.from(smartReadKeys), [
    ...finalBotInstructionKeys,
    ...finalCurrentUserKeys,
  ]);
  const finalHistoryKeys = R.difference(Array.from(historyKeys), [
    ...finalBotInstructionKeys,
    ...finalCurrentUserKeys,
    ...finalSmartReadKeys,
  ]);
  const finalBotKnowledgeKeys = R.difference(Array.from(botKnowledgeKeys), [
    ...finalBotInstructionKeys,
    ...finalCurrentUserKeys,
    ...finalSmartReadKeys,
    ...finalHistoryKeys,
  ]);
  return {
    botInstructionsContext: finalBotInstructionKeys,
    currentUserContext: finalCurrentUserKeys,
    smartReadContext: finalSmartReadKeys,
    historyContext: finalHistoryKeys,
    botKnowledgeContext: finalBotKnowledgeKeys,
  };
};
