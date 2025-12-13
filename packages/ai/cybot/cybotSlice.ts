import { asyncThunkCreator, buildCreateSlice } from "@reduxjs/toolkit";
import { RootState } from "app/store";
import { read } from "database/dbSlice";
import { generateRequestBody } from "ai/llm/generateRequestBody";
import { fetchReferenceContents } from "ai/context/buildReferenceContext";
import {
  selectCurrentDialogConfig,
  selectPendingFiles,
  PendingFile,
} from "chat/dialog/dialogSlice";
import { selectAllMsgs } from "chat/messages/messageSlice";
import { filterAndCleanMessages } from "integrations/openai/filterAndCleanMessages";
import {
  getFullChatContextKeys,
  deduplicateContextKeys,
} from "ai/agent/getFullChatContextKeys";
import { Agent } from "app/types";
import { _executeModel } from "ai/agent/_executeModel";
import { isResponseAPIModel } from "ai/llm/isResponseAPIModel";

import { selectCurrentUserBalance, selectUserId } from "auth/authSlice";
import { getModelPricing, getPrices, getFinalPrice } from "ai/llm/getPricing";

import { sendOpenAICompletionsRequest } from "../chat/sendOpenAICompletionsRequest";
import { sendOpenAIResponseRequest } from "../chat/sendOpenAIResponseRequest";

// 🔹 从设置里取通用提示词
import { selectGlobalPrompt } from "app/settings/settingSlice";

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

/** Slice State 定义 */
interface CybotState {
  pubCybots: {
    loading: boolean;
    error: string | null;
    data: Agent[];
  };
}

/** runLlm 参数 */
interface RunLlmArgs {
  cybotId?: string;
  content: unknown;
  isStreaming?: boolean;
  parentMessageId?: string;
}

/** runAgent 参数 */
interface RunAgentArgs {
  cybotId: string;
  content: unknown;
  isStreaming?: boolean;
  parentMessageId?: string;
}

/** streamAgentChatTurn 参数 */
interface StreamAgentChatTurnArgs {
  cybotId: string;
  userInput: string | any[];
  parentMessageId?: string;
}

const initialState: CybotState = {
  pubCybots: {
    loading: false,
    error: null,
    data: [],
  },
};

/** 将 Map 的所有 value 拼接为一个字符串 */
const joinMapValues = (map: Map<string, string>): string =>
  Array.from(map.values()).join("");

/**
 * 根据 pendingFiles 和 currentInputMap 构造“当前输入上下文”字符串
 * 1. 如果有 pendingFiles 且 currentInputMap 有内容：按 groupId 分组，并带上 Source 边界信息
 * 2. 否则：直接拼接 currentInputMap 的 value
 */
const formatCurrentInputContext = (
  pendingFiles: PendingFile[],
  currentInputMap: Map<string, string>
): string => {
  if (pendingFiles.length === 0 || currentInputMap.size === 0) {
    return joinMapValues(currentInputMap);
  }

  // 只关心 currentInputMap 中出现过的文件
  const relevantPendingFiles = pendingFiles.filter((file) =>
    currentInputMap.has(file.pageKey)
  );

  if (relevantPendingFiles.length === 0) {
    return joinMapValues(currentInputMap);
  }

  // 按 groupId（或 id）分组
  const filesByGroup = new Map<string, PendingFile[]>();
  for (const file of relevantPendingFiles) {
    const groupKey = file.groupId || file.id;
    const group = filesByGroup.get(groupKey);
    if (group) {
      group.push(file);
    } else {
      filesByGroup.set(groupKey, [file]);
    }
  }

  let sourceCounter = 1;
  let output = "";

  filesByGroup.forEach((filesInGroup) => {
    const isGroup = filesInGroup.length > 1;
    const sourceName = isGroup
      ? filesInGroup[0].name.split(" (")[0]
      : filesInGroup[0].name;

    output += `--- Source ${sourceCounter}: "${sourceName}" ---\n`;

    filesInGroup.forEach((file) => {
      const content = currentInputMap.get(file.pageKey);
      if (!content) return;

      if (isGroup) {
        output += `### Document: "${file.name}"\n${content}\n`;
      } else {
        output += `${content}\n`;
      }
    });

    output += `--- End of Source ${sourceCounter} ---\n\n`;
    sourceCounter++;
  });

  return output;
};

/**
 * 校验当前用户是否有权限使用该 Agent，并且余额是否充足
 * 返回：
 *  - string：错误文案
 *  - null：校验通过
 */
const validateAccessAndBalance = (
  agentConfig: Agent,
  state: RootState
): string | null => {
  const userBalance = selectCurrentUserBalance(state);
  const currentUserId = selectUserId(state);

  if (typeof userBalance !== "number") {
    return "正在获取用户余额，请稍候...";
  }

  const isOwner =
    Boolean(currentUserId) && agentConfig.userId === currentUserId;

  // 白名单检查：只有非 owner 才需要检查
  if (!isOwner) {
    const hasWhitelist =
      Array.isArray(agentConfig.whitelist) && agentConfig.whitelist.length > 0;

    if (hasWhitelist) {
      const isUserInWhitelist =
        !!currentUserId && agentConfig.whitelist.includes(currentUserId);

      if (!isUserInWhitelist) {
        return "您不在该应用的白名单中，无法使用。";
      }
    }
  }

  // 自定义 API 不参与平台计费
  const isCustomApi = agentConfig.apiSource === "custom";
  if (isCustomApi) {
    return null;
  }

  // 平台计费：根据模型定价和 Agent 配置预估最大花费
  const serverPrices = getModelPricing(
    agentConfig.provider || "",
    agentConfig.model
  );

  if (!serverPrices) {
    return "无法获取模型定价信息，请稍后重试。";
  }

  const prices = getPrices(agentConfig, serverPrices);
  const maxPrice = getFinalPrice(prices);

  if (userBalance < maxPrice) {
    return "余额不足，请充值后再试。";
  }

  return null;
};

/**
 * 计算上下文 key，拉取引用内容，并整理成 generateRequestBody 所需要的 contexts
 * 🔹 在这里注入 globalPrompt 到 contexts.userGlobalPrompt
 */
const buildAgentContexts = async (
  state: RootState,
  dispatch: any,
  agentConfig: Agent,
  userInput: string | any[]
): Promise<{
  botInstructionsContext: string;
  currentInputContext: string | null;
  smartReadContext: string;
  historyContext: string;
  botKnowledgeContext: string;
  userGlobalPrompt: string | undefined;
}> => {
  // 1. 获取需要的上下文 key
  const keySets = await getFullChatContextKeys(
    state,
    dispatch,
    agentConfig,
    userInput
  );
  const finalKeys = deduplicateContextKeys(keySets);

  // 2. 根据 key 拉取对应内容
  const [
    botInstructionsMap,
    currentInputMap,
    smartReadMap,
    historyMap,
    botKnowledgeMap,
  ] = await Promise.all([
    fetchReferenceContents(finalKeys.botInstructionsContext, dispatch),
    fetchReferenceContents(finalKeys.currentInputContext, dispatch),
    fetchReferenceContents(finalKeys.smartReadContext, dispatch),
    fetchReferenceContents(finalKeys.historyContext, dispatch),
    fetchReferenceContents(finalKeys.botKnowledgeContext, dispatch),
  ]);

  // 3. 处理“当前输入上下文”（结合 pendingFiles）
  const pendingFiles = selectPendingFiles(state);
  const formattedCurrentInputContext = formatCurrentInputContext(
    pendingFiles,
    currentInputMap
  );

  // 4. 从设置里取用户级通用提示词
  const globalPrompt = selectGlobalPrompt(state);

  return {
    botInstructionsContext: joinMapValues(botInstructionsMap),
    currentInputContext: formattedCurrentInputContext.trim() || null,
    smartReadContext: joinMapValues(smartReadMap),
    historyContext: joinMapValues(historyMap),
    botKnowledgeContext: joinMapValues(botKnowledgeMap),
    userGlobalPrompt: globalPrompt,
  };
};

export const cybotSlice = createSliceWithThunks({
  name: "cybot",
  initialState,
  reducers: (create) => ({
    /**
     * 通用 LLM 调用（不带 Agent 上下文 / 历史），isStreaming 控制是否流式
     */
    runLlm: create.asyncThunk((args: RunLlmArgs, thunkApi) =>
      _executeModel(
        {
          isStreaming: args.isStreaming ?? false,
          withAgentContext: false,
          withChatHistory: false,
        },
        args,
        thunkApi
      )
    ),

    /**
     * 通用 Agent 调用（带 Agent 上下文，不带聊天历史），isStreaming 控制是否流式
     */
    runAgent: create.asyncThunk((args: RunAgentArgs, thunkApi) =>
      _executeModel(
        {
          isStreaming: args.isStreaming ?? false,
          withAgentContext: true,
          withChatHistory: false,
        },
        args,
        thunkApi
      )
    ),

    /**
     * 真正用于“聊天轮次”的流式 Agent 调用：
     * - 检查权限 & 余额
     * - 计算引用上下文 key
     * - 拉取所有引用内容并格式化
     * - 拼装 messages + contexts => LLM 请求体
     * - 根据模型类型发送到不同的 OpenAI 接口
     */
    streamAgentChatTurn: create.asyncThunk(
      async (args: StreamAgentChatTurnArgs, thunkApi) => {
        const { cybotId, userInput, parentMessageId } = args;
        const { getState, dispatch, rejectWithValue } = thunkApi;
        const state = getState() as RootState;

        try {
          // 1. 读取 Agent 配置
          const agentConfig = await dispatch(read(cybotId)).unwrap();
          if (!agentConfig) {
            return rejectWithValue(`Agent config not found for ID: ${cybotId}`);
          }

          // 2. 权限 & 余额校验（抽成独立函数）
          const accessError = validateAccessAndBalance(agentConfig, state);
          if (accessError) {
            return rejectWithValue(accessError);
          }

          // 3. 构建所有上下文（包含 userGlobalPrompt）
          const contexts = await buildAgentContexts(
            state,
            dispatch,
            agentConfig,
            userInput
          );

          // 4. 准备消息 & 请求体
          const messages = filterAndCleanMessages(selectAllMsgs(state));

          const bodyData = generateRequestBody({
            agentConfig,
            messages,
            // 注意：GenerateRequestBodyArgs 里有 userInput 字段，
            // 如果你暂时不用，可以传个空字符串或者在类型里删掉这个字段。
            userInput: typeof userInput === "string" ? userInput : "",
            contexts,
          });

          // 5. 获取当前对话的 dialogKey
          const currentDialog = selectCurrentDialogConfig(state);
          const dialogKey = currentDialog?.dbKey;

          if (!dialogKey) {
            return rejectWithValue("当前对话不存在，无法发送消息。");
          }

          // 6. 根据模型类型发送请求
          if (isResponseAPIModel(agentConfig)) {
            // Response-style 模型
            const logsText = await sendOpenAIResponseRequest({
              bodyData,
              agentConfig,
              thunkApi,
              dialogKey,
              parentMessageId,
            });

            console.log("=== 全量日志 ===\n", logsText);
          } else {
            // Completions-style 模型
            await sendOpenAICompletionsRequest({
              bodyData,
              cybotConfig: agentConfig,
              thunkApi,
              dialogKey,
              parentMessageId,
            });
          }
        } catch (error: any) {
          console.error(
            `Error in streamAgentChatTurn for [${args.cybotId}]:`,
            error
          );

          return rejectWithValue(
            error?.message ||
              "An unexpected error occurred in streamAgentChatTurn."
          );
        }
      }
    ),
  }),
});

export const { runLlm, runAgent, streamAgentChatTurn } = cybotSlice.actions;

export default cybotSlice.reducer;
