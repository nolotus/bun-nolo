/*
 * ==================================================================
 *  /chat/messages/messageSlice.ts
 * ==================================================================
 */

import { RootState, AppThunkApi } from "app/store";
import {
  createSelector,
  asyncThunkCreator,
  buildCreateSlice,
  createEntityAdapter,
  EntityState,
} from "@reduxjs/toolkit";
import { DataType } from "create/types";
import { remove, write } from "database/dbSlice";
import { deleteDialogMsgsAction } from "./actions/deleteDialogMsgsAction";
import type { Message } from "./types";
import { selectCurrentServer } from "app/settings/settingSlice";
import { selectCurrentToken, selectUserId } from "auth/authSlice";
import { fetchMessages as fetchLocalMessages } from "chat/messages/fetchMessages";
import { fetchConvMsgs } from "./fetchConvMsgs";
import { SERVERS } from "database/requests";
import { createDialogMessageKeyAndId } from "database/keys";
import { extractCustomId } from "core/prefix";
import { DialogConfig } from "app/types";
import { findToolExecutor, toolDefinitionsByName } from "ai/tools/toolRegistry";
import { updateDialogTitle, updateTokens } from "chat/dialog/dialogSlice";
import { streamAgentChatTurn } from "ai/cybot/cybotSlice";

// ToolRun 打点
import {
  toolRunStarted,
  toolRunSucceeded,
  toolRunFailed,
  createToolRunId,
  toolRunSetPending, // 用于预览后标记为 pending
} from "ai/tools/toolRunSlice";

const FALLBACK_SERVERS = [SERVERS.MAIN, SERVERS.US];
const OLDER_LOAD_LIMIT = 30;

const isValidMessage = (msg: any): msg is Message =>
  msg && typeof msg === "object" && typeof msg.id === "string";

function separateThinkContent(contentBuffer: any[]) {
  let thinkContent = "";
  let normalContent = "";

  const combinedText = contentBuffer
    .filter((c) => c.type === "text" && c.text)
    .map((c) => c.text)
    .join("");

  const thinkMatches = combinedText.match(/<think\b[^>]*>(.*?)<\/think>/gis);

  if (thinkMatches) {
    thinkContent = thinkMatches
      .map((m) => m.replace(/<think\b[^>]*>|<\/think>/gi, ""))
      .join("\n\n");

    normalContent = combinedText
      .replace(/<think\b[^>]*>.*?<\/think>/gis, "")
      .trim();
  } else {
    normalContent = combinedText;
  }

  return { thinkContent, normalContent };
}

const messagesAdapter = createEntityAdapter<Message>({
  selectId: (message) => message.id,
  sortComparer: (a, b) => a.id.localeCompare(b.id),
});

export interface MessageSliceState {
  msgs: EntityState<Message>;
  firstStreamProcessed: boolean;
  isLoadingInitial: boolean;
  isLoadingOlder: boolean;
  hasMoreOlder: boolean;
  error: Error | null;
  lastStreamTimestamp: number;
}

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

const initialState: MessageSliceState = {
  msgs: messagesAdapter.getInitialState(),
  firstStreamProcessed: false,
  isLoadingInitial: false,
  isLoadingOlder: false,
  hasMoreOlder: true,
  error: null,
  lastStreamTimestamp: 0,
};

const pendingHandler =
  (loadingKey: "isLoadingInitial" | "isLoadingOlder") =>
  (state: MessageSliceState) => {
    state[loadingKey] = true;
    state.error = null;
  };

const rejectedHandler =
  (loadingKey: "isLoadingInitial" | "isLoadingOlder") =>
  (state: MessageSliceState, action: any) => {
    state[loadingKey] = false;
    state.error =
      action.error instanceof Error
        ? action.error
        : new Error(String(action.error));
    console.error(`${action.type} failed:`, action.error);
  };

interface HandleToolCallsPayload {
  accumulatedCalls: any[];
  currentContentBuffer: any[];
  cybotConfig: any;
  messageId: string;
}

interface ProcessToolDataPayload {
  toolCall: any;
  parentMessageId: string;
}

interface FinalizeStreamPayload {
  finalContentBuffer: any[];
  totalUsage: any;
  msgKey: string;
  cybotConfig: any;
  dialogId: string;
  dialogKey: string;
  messageId: string;
  reasoningBuffer: string;
}

export const messageSlice = createSliceWithThunks({
  name: "message",
  initialState,
  reducers: (create) => ({
    addUserMessage: create.reducer<Message>((state, action) => {
      messagesAdapter.upsertOne(state.msgs, {
        ...action.payload,
        isStreaming: false,
      });
    }),

    messageStreaming: create.reducer<Partial<Message> & { id: string }>(
      (state, action) => {
        messagesAdapter.upsertOne(state.msgs, {
          isStreaming: true,
          content: "",
          thinkContent: "",
          ...action.payload,
        });
        state.firstStreamProcessed = true;
        state.lastStreamTimestamp = Date.now();
      }
    ),

    resetMsgs: create.reducer((state) => {
      messagesAdapter.removeAll(state.msgs);
      Object.assign(state, initialState);
    }),

    // 为所有工具统一创建 role: "tool" 的消息（只存在于前端内存）
    addToolMessage: create.reducer<{
      parentMessageId: string;
      toolName: string;
      content: any[]; // 和 messageStreaming 的 content 结构一致
    }>((state, action) => {
      const { parentMessageId, toolName, content } = action.payload;
      const parentMsg = state.msgs.entities[parentMessageId];

      const id = `${parentMessageId}_tool_${Date.now().toString(36)}`;

      const toolMsg: any = {
        id,
        dbKey: id,
        role: "tool",
        content,
        thinkContent: "",
        cybotKey: parentMsg?.cybotKey,
        isStreaming: false,
      };

      toolMsg.toolName = toolName;
      toolMsg.parentMessageId = parentMessageId;

      messagesAdapter.addOne(state.msgs, toolMsg);
    }),

    // ================= [START] prepareAndPersistMessage =================
    prepareAndPersistMessage: create.asyncThunk(
      async (
        args: {
          message: Omit<Message, "id" | "dbKey" | "userId">;
          dialogConfig: DialogConfig;
        },
        thunkApi
      ) => {
        const { message, dialogConfig } = args;
        const { getState, dispatch, rejectWithValue } = thunkApi;
        const state = getState() as RootState;

        if (!dialogConfig) {
          return rejectWithValue("Missing dialogConfig");
        }

        const dialogKey = dialogConfig.dbKey || dialogConfig.id;
        const dialogId = extractCustomId(dialogKey);
        const userId = selectUserId(state);

        const { key: messageDbKey, messageId } =
          createDialogMessageKeyAndId(dialogId);

        const fullMessage: Message = {
          ...message,
          id: messageId,
          dbKey: messageDbKey,
          userId,
        };

        dispatch(messageSlice.actions.addUserMessage(fullMessage));

        const { controller, ...messageToWrite } = fullMessage;
        dispatch(
          write({
            data: { ...messageToWrite, type: DataType.MSG },
            customKey: fullMessage.dbKey,
          })
        );

        return fullMessage;
      }
    ),
    // ================= [END] prepareAndPersistMessage =================

    prepareAndPersistUserMessage: create.asyncThunk(
      async (
        args: { userInput: string; dialogConfig: DialogConfig },
        thunkApi
      ) => {
        const { userInput, dialogConfig } = args;
        const { dispatch } = thunkApi;

        return dispatch(
          messageSlice.actions.prepareAndPersistMessage({
            message: {
              role: "user",
              content: userInput,
            },
            dialogConfig,
          })
        ).unwrap();
      }
    ),

    initMsgs: create.asyncThunk(
      async (
        { dialogId, limit },
        thunkApi: AppThunkApi
      ): Promise<Message[]> => {
        const { db } = thunkApi.extra;
        const { getState } = thunkApi;

        const state = getState() as RootState;
        const server = selectCurrentServer(state);
        const token = selectCurrentToken(state);

        const fetchLocalPromise = fetchLocalMessages(db, dialogId, {
          limit,
          throwOnError: false,
        }).catch(() => []);

        const fetchRemotePromise = (async () => {
          if (!server || !token) return [];
          const uniqueServers = Array.from(
            new Set([server, ...FALLBACK_SERVERS])
          ).filter(Boolean) as string[];

          if (uniqueServers.length === 0) return [];

          const results = await Promise.all(
            uniqueServers.map((srv) =>
              fetchConvMsgs(srv, token, { dialogId, limit }).catch(() => [])
            )
          );

          return results.flat();
        })();

        const [localMessages, remoteMessages] = await Promise.all([
          fetchLocalPromise,
          fetchRemotePromise,
        ]);

        const allMessages = [...localMessages, ...remoteMessages].filter(
          isValidMessage
        );
        const uniqueMessagesMap = new Map<string, Message>();
        allMessages.forEach((msg) => uniqueMessagesMap.set(msg.id, msg));

        return Array.from(uniqueMessagesMap.values());
      },
      {
        pending: (state) => {
          messagesAdapter.removeAll(state.msgs);
          Object.assign(state, { ...initialState, isLoadingInitial: true });
        },
        fulfilled: (state, action) => {
          state.isLoadingInitial = false;
          messagesAdapter.upsertMany(state.msgs, action.payload);
        },
        rejected: rejectedHandler("isLoadingInitial"),
      }
    ),

    loadOlderMessages: create.asyncThunk(
      async (
        { dialogId, beforeKey, limit = OLDER_LOAD_LIMIT },
        thunkApi: AppThunkApi
      ): Promise<{ messages: Message[]; limit: number }> => {
        const { getState, extra } = thunkApi;
        const { db } = extra;

        const state = getState() as RootState;
        const server = selectCurrentServer(state);
        const token = selectCurrentToken(state);

        const fetchLocalPromise = fetchLocalMessages(db, dialogId, {
          limit,
          beforeKey,
          throwOnError: false,
        }).catch(() => []);

        const fetchRemotePromise = (async () => {
          if (!server || !token) return [];
          const uniqueServers = Array.from(
            new Set([server, ...FALLBACK_SERVERS])
          ).filter(Boolean) as string[];

          if (uniqueServers.length === 0) return [];

          const results = await Promise.all(
            uniqueServers.map((srv) =>
              fetchConvMsgs(srv, token, { dialogId, limit, beforeKey }).catch(
                () => []
              )
            )
          );

          return results.flat();
        })();

        const [localMessages, remoteMessages] = await Promise.all([
          fetchLocalPromise,
          fetchRemotePromise,
        ]);

        const allMessages = [...localMessages, ...remoteMessages].filter(
          isValidMessage
        );
        const uniqueMessagesMap = new Map<string, Message>();
        allMessages.forEach((msg) => uniqueMessagesMap.set(msg.id, msg));

        return { messages: Array.from(uniqueMessagesMap.values()), limit };
      },
      {
        pending: pendingHandler("isLoadingOlder"),
        fulfilled: (state, action) => {
          state.isLoadingOlder = false;
          const { messages, limit } = action.payload;

          if (messages.length > 0) {
            messagesAdapter.upsertMany(state.msgs, messages);
          }
          if (messages.length < limit) {
            state.hasMoreOlder = false;
          }
        },
        rejected: rejectedHandler("isLoadingOlder"),
      }
    ),

    // ================= [START] processToolData with ToolRun =================
    processToolData: create.asyncThunk(
      async (args: ProcessToolDataPayload, thunkApi) => {
        const { toolCall, parentMessageId } = args;
        const { dispatch, rejectWithValue } = thunkApi;

        const func = toolCall.function;
        if (!func || !func.name) {
          throw new Error(
            "Invalid tool call data: missing function or function.name"
          );
        }

        const rawToolName = func.name;
        let toolArgs = func.arguments;

        const { executor: handler, canonicalName } =
          findToolExecutor(rawToolName);

        if (typeof toolArgs === "string") {
          try {
            toolArgs = JSON.parse(toolArgs);
          } catch (e) {
            throw new Error(`Failed to parse tool arguments JSON: ${e}`);
          }
        }

        const toolRunId = createToolRunId();
        const def = toolDefinitionsByName[canonicalName];
        const behavior = def?.behavior;
        const interaction = def?.interaction ?? "auto";
        const inputSummary = JSON.stringify(toolArgs).slice(0, 400);

        dispatch(
          toolRunStarted({
            id: toolRunId,
            messageId: parentMessageId,
            toolName: canonicalName,
            behavior,
            inputSummary,
            interaction,
            input: toolArgs,
          })
        );

        // ===== applyDiff 的安全预览分支（特殊逻辑，但依然返回通用字段） =====
        if (canonicalName === "applyDiff") {
          try {
            const filePath = toolArgs?.filePath || "(未提供文件路径)";
            const diffText =
              typeof toolArgs?.diff === "string" ? toolArgs.diff : "";
            const maxLen = 400;
            const preview =
              diffText.length > maxLen
                ? diffText.slice(0, maxLen) +
                  "\n...（已截断，仅展示前部分补丁内容）"
                : diffText;

            const textLines = [
              `你请求对文件 \`${filePath}\` 应用以下 diff：`,
              "",
              "```diff",
              preview,
              "```",
              "",
              "当前处于安全预览模式，本次不会真正应用补丁。",
              '请检查上面的 diff 是否正确，稍后可以点击 "应用这个补丁" 来真正执行。',
            ];
            const text = textLines.join("\n");

            const displayContent = {
              type: "text",
              text: `\n[applyDiff 预览]\n${text}\n`,
            };

            // 预览阶段：标记为 pending，等待用户确认执行
            dispatch(
              toolRunSetPending({
                id: toolRunId,
              })
            );

            return {
              displayContent,
              rawResult: {
                previewOnly: true,
                filePath,
                diffPreview: preview,
                toolRunId,
              },
              hasHandedOff: false,
              toolName: canonicalName,
              toolRunId,
            };
          } catch (e: any) {
            const errorMessage =
              e.message || "Unknown error in applyDiff preview";
            const errorContent = {
              type: "text",
              text: `\n[Tool Execution Error: ${rawToolName} (preview)] ${errorMessage}\n`,
            };

            dispatch(
              toolRunFailed({
                id: toolRunId,
                error: errorMessage,
              })
            );

            return rejectWithValue({
              displayContent: errorContent,
              rawResult: { error: errorMessage },
              toolName: canonicalName,
              toolRunId,
            });
          }
        }
        // ================= [END] applyDiff 分支 =================

        try {
          // runStreamingAgent：交给子 Agent，当前对话停止继续输出
          if (canonicalName === "runStreamingAgent") {
            try {
              await dispatch(
                streamAgentChatTurn({
                  cybotId: toolArgs.agentKey,
                  userInput: toolArgs.userInput,
                  parentMessageId,
                })
              ).unwrap();

              dispatch(
                toolRunSucceeded({
                  id: toolRunId,
                  outputSummary:
                    "[runStreamingAgent handed off to another agent]",
                })
              );

              return { hasHandedOff: true, toolName: canonicalName, toolRunId };
            } catch (e: any) {
              const errorContent = {
                type: "text",
                text: `\n[Agent Failed to Start] ${e.message}\n`,
              };

              dispatch(
                toolRunFailed({
                  id: toolRunId,
                  error: e.message || "Unknown error in runStreamingAgent",
                })
              );

              return rejectWithValue({
                displayContent: errorContent,
                toolName: canonicalName,
                toolRunId,
              });
            }
          }

          const toolResult = await handler(toolArgs, thunkApi, {
            parentMessageId,
          });

          let displayContent;
          const displayData = toolResult?.displayData;

          if (canonicalName === "createPlan") {
            displayContent = {
              type: "text",
              text:
                displayData || "[Plan executed, but no report was generated.]",
            };
          } else {
            const text =
              displayData ||
              `${canonicalName.replace(/_/g, " ")} executed successfully.`;
            displayContent = {
              type: "text",
              text: `\n[Tool Result: ${text}]\n`,
            };
          }

          dispatch(
            toolRunSucceeded({
              id: toolRunId,
              outputSummary: displayData || "",
            })
          );

          return {
            displayContent,
            rawResult: toolResult.rawData,
            hasHandedOff: false,
            toolName: canonicalName,
            toolRunId,
          };
        } catch (e: any) {
          const errorMessage = e.message || "Unknown error";
          const errorContent = {
            type: "text",
            text: `\n[Tool Execution Error: ${rawToolName}] ${errorMessage}\n`,
          };

          dispatch(
            toolRunFailed({
              id: toolRunId,
              error: errorMessage,
            })
          );

          return rejectWithValue({
            displayContent: errorContent,
            rawResult: { error: errorMessage },
            toolName: canonicalName,
            toolRunId,
          });
        }
      }
    ),
    // ================= [END] processToolData =================

    handleToolCalls: create.asyncThunk(
      async (args: HandleToolCallsPayload, thunkApi) => {
        const {
          accumulatedCalls,
          currentContentBuffer,
          cybotConfig,
          messageId,
        } = args;
        const { dispatch } = thunkApi;

        let updatedContentBuffer = [...currentContentBuffer];
        let hasHandedOff = false;

        for (const toolCall of accumulatedCalls) {
          if (!toolCall.function?.name) continue;

          try {
            const result = await dispatch(
              messageSlice.actions.processToolData({
                toolCall,
                parentMessageId: messageId,
              })
            ).unwrap();

            if (result.hasHandedOff) {
              hasHandedOff = true;
              break;
            }

            if (result.displayContent) {
              // 1) 仍然把工具输出塞进当前 assistant 消息（兼容旧行为）
              updatedContentBuffer.push(result.displayContent);

              // 2) 统一：为所有工具生成一条 role: "tool" 的消息
              if (result.toolName) {
                dispatch(
                  messageSlice.actions.addToolMessage({
                    parentMessageId: messageId,
                    toolName: result.toolName,
                    content: [result.displayContent],
                  })
                );
              }
            }
          } catch (rejectedValue: any) {
            if (rejectedValue.displayContent) {
              updatedContentBuffer.push(rejectedValue.displayContent);
            }
          }

          if (!hasHandedOff) {
            dispatch(
              messageSlice.actions.messageStreaming({
                id: messageId,
                content: updatedContentBuffer,
                role: "assistant",
                cybotKey: cybotConfig.dbKey,
              })
            );
          }
        }

        return { finalContentBuffer: updatedContentBuffer, hasHandedOff };
      }
    ),

    messageStreamEnd: create.asyncThunk(
      async (payload: FinalizeStreamPayload, { dispatch }) => {
        const {
          finalContentBuffer,
          totalUsage,
          msgKey,
          cybotConfig,
          dialogId,
          dialogKey,
          messageId,
          reasoningBuffer,
        } = payload;

        const { thinkContent: tagThink, normalContent } =
          separateThinkContent(finalContentBuffer);

        const thinkContent = (tagThink + reasoningBuffer).trim();

        const finalUsageData =
          totalUsage && totalUsage.completion_tokens != null
            ? { completion_tokens: totalUsage.completion_tokens }
            : undefined;

        const finalMessage: Message = {
          id: messageId,
          dbKey: msgKey,
          content: normalContent || "",
          thinkContent,
          role: "assistant",
          cybotKey: cybotConfig.dbKey,
          usage: finalUsageData,
          isStreaming: false,
        };

        const { controller, ...messageToWrite } = finalMessage;

        await dispatch(
          write({
            data: { ...messageToWrite, type: DataType.MSG },
            customKey: msgKey,
          })
        );

        if (totalUsage) {
          dispatch(updateTokens({ dialogId, usage: totalUsage, cybotConfig }));
        }

        if ((normalContent || "").trim() !== "") {
          dispatch(updateDialogTitle({ dialogKey, cybotConfig }));
        }

        return {
          id: messageId,
          content: finalMessage.content,
          thinkContent: finalMessage.thinkContent,
          usage: finalMessage.usage,
          cybotKey: finalMessage.cybotKey,
        };
      },
      {
        fulfilled: (state, action) => {
          messagesAdapter.updateOne(state.msgs, {
            id: action.payload.id,
            changes: {
              isStreaming: false,
              content: action.payload.content,
              thinkContent: action.payload.thinkContent,
              usage: action.payload.usage,
              cybotKey: action.payload.cybotKey,
            },
          });
        },
        rejected: (state, action) => {
          console.error("messageStreamEnd failed:", action.error);
          const messageId = (action.meta?.arg as FinalizeStreamPayload)
            ?.messageId;
          if (messageId) {
            messagesAdapter.updateOne(state.msgs, {
              id: messageId,
              changes: {
                isStreaming: false,
                content:
                  (state.msgs.entities[messageId]?.content || "") +
                  "\n[Failed to save message]",
              },
            });
          }
        },
      }
    ),

    deleteMessage: create.asyncThunk(
      async (dbKey: string, { dispatch, getState }) => {
        const state = getState() as RootState;
        const msgId = Object.values(state.message.msgs.entities).find(
          (msg) => msg?.dbKey === dbKey
        )?.id;

        await dispatch(remove(dbKey));

        return { id: msgId };
      },
      {
        fulfilled: (state, action) => {
          if (action.payload.id) {
            messagesAdapter.removeOne(state.msgs, action.payload.id);
          }
        },
      }
    ),

    deleteDialogMsgs: create.asyncThunk(deleteDialogMsgsAction),
  }),
  selectors: {
    selectMsgsState: (state) => state.msgs,
    selectFirstStreamProcessed: (state) => state.firstStreamProcessed,
    selectIsLoadingInitial: (state) => state.isLoadingInitial,
    selectIsLoadingOlder: (state) => state.isLoadingOlder,
    selectHasMoreOlder: (state) => state.hasMoreOlder,
    selectMessageError: (state) => state.error,
    selectLastStreamTimestamp: (state) => state.lastStreamTimestamp,
  },
});

const baseSelectors = messagesAdapter.getSelectors<RootState>(
  (state) => state.message.msgs
);

export const selectAllMsgs = baseSelectors.selectAll;
export const selectMsgById = baseSelectors.selectById;
export const selectTotalMsgs = baseSelectors.selectTotal;

export const {
  selectFirstStreamProcessed,
  selectIsLoadingInitial,
  selectIsLoadingOlder,
  selectHasMoreOlder,
  selectMessageError,
  selectLastStreamTimestamp,
} = messageSlice.selectors;

export const selectMessagesLoadingState = createSelector(
  [
    selectIsLoadingInitial,
    selectIsLoadingOlder,
    selectHasMoreOlder,
    selectMessageError,
  ],
  (isLoadingInitial, isLoadingOlder, hasMoreOlder, error) => ({
    isLoadingInitial,
    isLoadingOlder,
    hasMoreOlder,
    error,
  })
);

export const {
  addUserMessage,
  messageStreaming,
  resetMsgs,
  prepareAndPersistMessage,
  prepareAndPersistUserMessage,
  initMsgs,
  loadOlderMessages,
  messageStreamEnd,
  deleteMessage,
  deleteDialogMsgs,
  handleToolCalls,
  processToolData,
  addToolMessage,
} = messageSlice.actions;

export default messageSlice.reducer;
