import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";
import { read } from "database/dbSlice";
import { extractCustomId } from "core/prefix";
import { selectCurrentUserId } from "auth/authSlice";
import { createDialogMessageKey } from "database/keys";
import { buildReferenceContext } from "ai/context/buildReferenceContext";
import { NoloRootState } from "app/store";
import { addMsg } from "../messageSlice";
import { generateAnthropicRequestBody } from "integrations/anthropic/generateRequestBody";
import { generateOpenAIRequestBody } from "integrations/openai/generateRequestBody";
import { requestHandlers } from "ai/llm/providers";
import { DialogInvocationMode } from "../../dialog/types";

interface CybotConfig {
  provider: string;
  model: string;
  prompt?: string;
  name?: string;
  [key: string]: any;
}

export const generateRequestBody = (
  state: NoloRootState,
  userInput: string | { type: string; data: string }[],
  cybotConfig: CybotConfig,
  context?: any
) => {
  const providerName = cybotConfig.provider.toLowerCase();

  if (providerName === "anthropic") {
    return generateAnthropicRequestBody(state, userInput, cybotConfig, context);
  }
  return generateOpenAIRequestBody(
    state,
    userInput,
    cybotConfig,
    providerName,
    context
  );
};

export const sendMessageAction = async (args, thunkApi) => {
  const { userInput } = args;
  const state = thunkApi.getState();
  const dispatch = thunkApi.dispatch;

  const dialogConfig = selectCurrentDialogConfig(state);
  const dialogKey = dialogConfig.dbKey || dialogConfig.id;
  console.log("dialogConfig", dialogConfig);
  const dialogId = extractCustomId(dialogKey);
  const userId = selectCurrentUserId(state);
  const msgKey = createDialogMessageKey(dialogId);

  const msg = {
    id: msgKey,
    dbKey: msgKey,
    role: "user",
    content: userInput,
    userId,
  };

  await dispatch(addMsg(msg));

  const mode = dialogConfig.mode; // 获取模式

  if (mode === DialogInvocationMode.PARALLEL) {
    // 现有逻辑：同时调用所有 cybot
    const cybotPromises = dialogConfig.cybots.map(async (cybotId) => {
      try {
        const cybotConfig = await dispatch(read(cybotId)).unwrap(); // 读取每个 cybot 配置
        const context = await buildReferenceContext(cybotConfig, dispatch); // 构建上下文
        const bodyData = generateRequestBody(
          state,
          userInput,
          cybotConfig,
          context
        ); // 生成请求体

        const providerName = cybotConfig.provider.toLowerCase();
        const handler = requestHandlers[providerName]; // 获取处理程序
        if (!handler) {
          throw new Error(`Unsupported provider: ${cybotConfig.provider}`);
        }

        // 调用处理程序
        await handler({
          bodyData,
          cybotConfig,
          thunkApi,
          dialogKey,
        });
      } catch (error) {
        console.error(`Error processing cybot ${cybotId}:`, error);
      }
    });

    await Promise.all(cybotPromises);
  } else if (mode === DialogInvocationMode.SEQUENTIAL) {
    // 新添加：串行处理，按顺序轮流调用 cybot
    for (const cybotId of dialogConfig.cybots) {
      try {
        const cybotConfig = await dispatch(read(cybotId)).unwrap(); // 读取 cybot 配置
        const context = await buildReferenceContext(cybotConfig, dispatch); // 构建上下文
        const bodyData = generateRequestBody(
          state,
          userInput,
          cybotConfig,
          context
        ); // 生成请求体

        const providerName = cybotConfig.provider.toLowerCase();
        const handler = requestHandlers[providerName]; // 获取处理程序
        if (!handler) {
          throw new Error(`Unsupported provider: ${cybotConfig.provider}`);
        }

        // TODO: 确保上一个 cybot 已结束，然后获取历史消息
        // 在这里添加逻辑：等待上一个处理完成（当前循环已隐式等待），然后从状态中获取上一个消息的响应
        // 例如：const previousMessages = selectPreviousMessages(state, dialogId); // 假设有一个函数获取历史消息
        // context 中可以加入历史消息，例如：context.history = previousMessages;

        await handler({
          bodyData,
          cybotConfig,
          thunkApi,
          dialogKey,
        });

        // TODO: 处理完成后，更新或获取历史消息，以便下一个 cybot 使用
        // 例如：await dispatch(fetchHistoryMessages(dialogId)); // 自定义函数来获取最新消息
      } catch (error) {
        console.error(`Error processing cybot ${cybotId}:`, error);
        // 可以继续下一个 cybot 或停止，根据需求
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
        const context = await buildReferenceContext(cybotConfig, dispatch);
        const bodyData = generateRequestBody(
          state,
          userInput,
          cybotConfig,
          context // context 中可以包含提示词，例如 context.prompt = cybotConfig.prompt
        );

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
    if (dialogConfig.cybots && dialogConfig.cybots.length > 0) {
      const cybotId = dialogConfig.cybots[0];
      const cybotConfig = await dispatch(read(cybotId)).unwrap();
      const context = await buildReferenceContext(cybotConfig, dispatch);
      const bodyData = generateRequestBody(
        state,
        userInput,
        cybotConfig,
        context
      );

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
  }
};
