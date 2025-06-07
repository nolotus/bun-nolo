import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";
import { read } from "database/dbSlice";
import { extractCustomId } from "core/prefix";
import { selectCurrentUserId } from "auth/authSlice";
import { createDialogMessageKeyAndId } from "database/keys";
import { addMsg } from "../messageSlice";
import { requestHandlers } from "ai/llm/providers";
import { DialogInvocationMode } from "../../dialog/types";
import { streamCybotId } from "ai/cybot/cybotSlice";

export const sendMessageAction = async (args, thunkApi) => {
  const { userInput } = args;
  const state = thunkApi.getState();
  const dispatch = thunkApi.dispatch;

  const dialogConfig = selectCurrentDialogConfig(state);
  const dialogKey = dialogConfig.dbKey || dialogConfig.id;
  const dialogId = extractCustomId(dialogKey);
  const userId = selectCurrentUserId(state);
  const { key, messageId } = createDialogMessageKeyAndId(dialogId);

  const msg = {
    id: messageId,
    dbKey: key,
    role: "user",
    content: userInput,
    userId,
  };

  await dispatch(addMsg(msg));
  const mode = dialogConfig?.mode; // 获取模式
  if (mode === DialogInvocationMode.PARALLEL) {
    // 现有逻辑：同时调用所有 cybot
    const cybotPromises = dialogConfig?.cybots.map(async (cybotId) => {
      try {
        dispatch(streamCybotId({ cybotId, userInput })).unwrap();
      } catch (error) {
        console.error(`Error processing cybot ${cybotId}:`, error);
      }
    });

    await Promise.all(cybotPromises);
  } else if (mode === DialogInvocationMode.SEQUENTIAL) {
    // 串行处理，按顺序轮流调用 cybot，确保等待上一个完成
    for (const cybotId of dialogConfig?.cybots) {
      try {
        await dispatch(streamCybotId({ cybotId, userInput })).unwrap();
      } catch (error) {
        console.error(`Error processing cybot ${cybotId}:`, error);
        // 可以选择继续下一个 cybot 或停止，根据需求
      }
    }
  } else if (mode === DialogInvocationMode.ORCHESTRATED) {
    // 新添加：编排处理，使用提示词和 AI 决定调用哪个 cybot
    try {
      // TODO: 使用提示词和 AI 逻辑决定调用哪个 cybot
      // 例如：先调用一个 AI 服务来分析 userInput 和 cybot 配置，生成决策
      // const decision = await decideCybotToCall(state, userInput, dialogConfig.cybots); // 假设有一个函数
      // decision 可能返回一个 cybotId 或列表
      //
      // 然后，根据决策处理 cybot
      // 例如：for (const cybotId of decision) { ... }
      //
      // 在下一个 cybot 前，使用提示词决定：context 中加入提示词，例如 cybotConfig.prompt
      // 具体实现：生成一个请求体，询问 AI "基于上一个响应，选择下一个 cybot"

      const selectedCybots = []; // 这里模拟决策结果，实际需要实现
      // 示例：selectedCybots = await someAI decision logic...

      for (const cybotId of selectedCybots) {
        // 基于决策的 cybot 列表
        const cybotConfig = await dispatch(read(cybotId)).unwrap();
        // const context = await buildReferenceContext(cybotConfig, dispatch);
        const bodyData = {};

        const providerName = cybotConfig.provider.toLowerCase();
        const handler = requestHandlers[providerName];
        if (!handler) {
          throw new Error(`Unsupported provider: ${cybotConfig.provider}`);
        }

        await handler({
          bodyData,
          cybotConfig,
          thunkApi,
          dialogKey,
        });
      }
    } catch (error) {
      console.error(`Error in ORCHESTRATED mode:`, error);
    }
  } else {
    // 默认或 FIRST 模式：总是调用列表中的第一个 cybot
    if (dialogConfig?.cybots && dialogConfig.cybots.length > 0) {
      const cybotId = dialogConfig.cybots[0];
      dispatch(streamCybotId({ cybotId, userInput }));
    }
  }
};
