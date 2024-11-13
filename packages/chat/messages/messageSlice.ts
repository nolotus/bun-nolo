import { Message, MessageSliceState } from "./types";
import { selectCurrentDialogConfig } from "../dialog/dialogSlice";
import {
  PayloadAction,
  buildCreateSlice,
  asyncThunkCreator,
} from "@reduxjs/toolkit";
import { extractCustomId } from "core";

import { API_ENDPOINTS } from "database/config";
import { generateIdWithCustomId } from "core/generateMainKey";
import { readChunks } from "ai/client/stream";
import { getLogger } from "utils/logger";
import { createStreamRequestBody } from "ai/chat/createStreamRequestBody";
import { createPromptMessage } from "ai/prompt/createPromptMessage";
import { noloRequest } from "utils/noloRequest";
import { ulid } from "ulid";
import { DataType } from "create/types";
import { selectCurrentUserId } from "auth/authSlice";
import {
  addToList,
  deleteData,
  read,
  setOne,
  upsertOne,
} from "database/dbSlice";
import { selectCurrentServer } from "setting/settingSlice";
import { filter, reverse } from "rambda";
import { prepareMsgs } from "ai/messages/prepareMsgs";

import { ollamaModelNames } from "integrations/ollama/models";
import { geminiModelNames } from "integrations/google/ai/models";

import { sendGeminiModelRequest } from "ai/chat/sendGeminiModelRequest";
import { sendOpenAIRequest } from "ai/chat/sendOpenAIRequest";
import { sendClaudeRequest } from "ai/chat/sendClaudeRequest";
import { handleOllamaResponse } from "ai/chat/handleOllamaResponse";

import { getFilteredMessages } from "./utils";
import { sendNoloChatRequest } from "./chatStreamRequest";

import { claudeModels } from "integrations/anthropic/models";
import { isModelInList } from "ai/llm/isModelInList";
import { getWeather } from "ai/tools/getWeather";
import { prepareTools } from "ai/tools/prepareTools";
import { makeAppointment } from "ai/tools/appointment";
const chatWindowLogger = getLogger("ChatWindow");

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

const initialState: MessageSliceState = {
  ids: null,
  isStopped: false,
  streamMessages: [],
};
export const messageSlice = createSliceWithThunks({
  name: "message",
  initialState: initialState as MessageSliceState,
  reducers: (create) => ({
    initMessages: create.reducer((state, action) => {
      state.ids = action.payload;
    }),
    messageStreamEnd: create.asyncThunk(
      async ({ id, content, cybotId }, thunkApi) => {
        const { dispatch } = thunkApi;
        const message = {
          id,
          content,
          cybotId,
        };
        const action = await dispatch(addAIMessage(message));
        const { array } = action.payload;
        return { array, id };
      },
      {
        rejected: (state, action) => {},
        fulfilled: (state, action) => {
          const { id, array } = action.payload;
          state.ids = reverse(array);
          state.streamMessages = filter(
            (msg) => msg.id !== id,
            state.streamMessages,
          );
        },
      },
    ),
    receiveMessage: create.reducer((state, action) => {
      if (!state.ids.includes(action.payload)) {
        state.ids.unshift(action.payload);
      }
    }),

    messageStreaming: create.reducer<Message>((state, action) => {
      const message = action.payload;
      const index = state.streamMessages.findIndex(
        (msg) => msg.id === message.id,
      );
      if (index !== -1) {
        state.streamMessages[index] = message;
      } else {
        state.streamMessages.unshift(message);
      }
    }),

    addMessageToUI: create.reducer((state, action: PayloadAction<string>) => {
      if (!state.ids.includes(action.payload)) {
        state.ids.unshift(action.payload);
      }
    }),
    addMessageToServer: create.asyncThunk(
      async (message, thunkApi) => {
        const state = thunkApi.getState();
        const dispatch = thunkApi.dispatch;
        const userId = selectCurrentUserId(state);
        const customId = extractCustomId(message.id);
        const config = {
          url: `${API_ENDPOINTS.DATABASE}/write/`,
          method: "POST",
          body: JSON.stringify({
            data: { type: DataType.Message, ...message },
            flags: { isJSON: true },
            customId,
            userId,
          }),
        };
        const writeMessage = await noloRequest(state, config);
        const saveMessage = await writeMessage.json();
        const dialogConfig = selectCurrentDialogConfig(state);
        const updateId = dialogConfig.messageListId;

        const actionResult = await dispatch(
          addToList({ willAddId: saveMessage.id, updateId }),
        );
        return actionResult.payload;
      },
      {
        rejected: (state, action) => {
          // state.error = action.payload ?? action.error;
        },
        fulfilled: (state, action) => {
          state.ids = reverse(action.payload.array);
        },
      },
    ),
    removeMessageFromUI: create.reducer(
      (state, action: PayloadAction<string>) => {
        state.ids = state.ids.filter((id) => id !== action.payload);
      },
    ),
    deleteMessage: create.asyncThunk(
      async (messageId: string, thunkApi) => {
        thunkApi.dispatch(removeMessageFromUI(messageId));
        const state = thunkApi.getState();
        const token = state.auth.currentToken;
        const dialogConfig = selectCurrentDialogConfig(state);
        const currentServer = selectCurrentServer(state);
        const deleteMessageFromList = await fetch(
          `${currentServer}${API_ENDPOINTS.PUT}/${dialogConfig.messageListId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              id: messageId,
              action: "remove",
            }),
          },
        );

        thunkApi.dispatch(deleteData({ id: messageId }));
      },

      {
        pending: () => {},
        fulfilled: () => {},
      },
    ),
    deleteNotFound: create.asyncThunk(
      async (messageId: string, thunkApi) => {
        thunkApi.dispatch(removeMessageFromUI(messageId));
        const state = thunkApi.getState();
        const token = state.auth.currentToken;
        const dialogConfig = selectCurrentDialogConfig(state);
        const currentServer = selectCurrentServer(state);

        const deleteMessageFromList = await fetch(
          `${currentServer}${API_ENDPOINTS.PUT}/${dialogConfig.messageListId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              id: messageId,
              action: "remove",
            }),
          },
        );
      },

      {
        pending: () => {},
        fulfilled: () => {},
      },
    ),

    messagesReachedMax: create.reducer((state, action) => {
      state.isStopped = true;
    }),
    handleSendMessage: create.asyncThunk(
      async (args, thunkApi) => {
        let textContent;
        const { content } = args;
        const state = thunkApi.getState();
        const dispatch = thunkApi.dispatch;
        thunkApi.dispatch(addUserMessage({ content }));
        // after addUserMessage maybe multi cybot
        let prevMsgs = getFilteredMessages(state);
        const dialogConfig = selectCurrentDialogConfig(state);
        const cybotId = dialogConfig.cybots
          ? dialogConfig.cybots[0]
          : dialogConfig.llmId;
        const readAction = await dispatch(read({ id: cybotId }));
        const cybotConfig = readAction.payload;
        const model = cybotConfig.model;
        if (model === "o1-mini" || model === "o1-preview") {
          sendOpenAIRequest(cybotId, content, thunkApi);
          return;
        }
        if (isModelInList(model, claudeModels)) {
          sendClaudeRequest(cybotId, content, thunkApi);
          return;
        }

        /// todo multi cybot could reply multi msg
        //for now just one

        // move to inside
        if (typeof content === "string") {
          textContent = content;
        }

        if (model && geminiModelNames.includes(model)) {
          sendGeminiModelRequest(dialogConfig, content, thunkApi);
          return;
        }

        if (cybotConfig.llmId) {
          await dispatch(streamLLmId({ cybotConfig, prevMsgs, content }));
          return;
        }
        const mode = "stream";
        if (mode === "stream") {
          const userId = selectCurrentUserId(state);
          const streamChat = async (content) => {
            const id = generateIdWithCustomId(userId, ulid(), {
              isJSON: true,
            });
            let temp: string;

            let functionTemp = "";
            let argumentsStr = "";
            let hasFunction = false;

            const controller = new AbortController();
            const signal = controller.signal;
            try {
              const action = await dispatch(
                streamRequest({
                  content,
                  prevMsgs,
                  cybotConfig,
                  signal,
                  id,
                }),
              );
              const { reader } = action.payload;

              const handleStreamData = async (id: string, text: string) => {
                const lines = text.trim().split("\n");
                for (const line of lines) {
                  const match = line.match(/data: (done|{.*}|)/);
                  if (match && match[1] !== undefined) {
                    const statusOrJson: string = match[1];
                    if (statusOrJson === "" || statusOrJson === "done") {
                    } else {
                      try {
                        const json = JSON.parse(statusOrJson);
                        if (json.choices) {
                          const delta = json.choices[0].delta;
                          if (delta.tool_calls) {
                            const callTools = delta.tool_calls[0];

                            // 处理function调用
                            if (callTools.function && callTools.function.name) {
                              hasFunction = true;
                              functionTemp = {
                                index: callTools.index,
                                id: callTools.id,
                                type: callTools.type,
                                function: {
                                  name: callTools.function.name,
                                  arguments: "",
                                },
                              };

                              // 显示思考状态
                              const message = {
                                id,
                                content: "思考中...",
                                cybotId,
                              };
                              thunkApi.dispatch(setOne(message));
                              thunkApi.dispatch(
                                messageStreaming({ ...message, controller }),
                              );
                            }

                            // 累积arguments
                            if (
                              callTools.function &&
                              callTools.function.arguments
                            ) {
                              argumentsStr += callTools.function.arguments;

                              try {
                                JSON.parse(argumentsStr); // 验证是完整的JSON
                                // 参数接收完整,可以执行function
                                functionTemp.function.arguments = argumentsStr;

                                // 这里执行function调用
                                const functionName = functionTemp.function.name;
                                const functionArgs = JSON.parse(
                                  functionTemp.function.arguments,
                                );

                                // 方式1: 直接执行
                                if (functionName === "get_current_weather") {
                                  const result = await getWeather(functionArgs);
                                  const message = {
                                    content: result,
                                    id,
                                    cybotId,
                                  };
                                  console.log("function message", message);
                                  thunkApi.dispatch(messageStreamEnd(message));
                                }

                                // 方式2: 通过dispatch触发
                                // thunkApi.dispatch(
                                //   executeFunctionCall({
                                //     name: functionName,
                                //     arguments: functionArgs,
                                //   }),
                                // );

                                // 清理状态
                                functionTemp = "";
                                argumentsStr = "";
                                hasFunction = false;
                              } catch (e) {
                                // 参数未接收完,继续等待
                              }
                            }
                          }

                          const finishReason: string =
                            json.choices[0].finish_reason;
                          if (finishReason === "stop") {
                            // 只有在没有执行过function的情况下,才发送stop消息
                            if (!hasFunction) {
                              const message = {
                                content: temp,
                                id,
                                cybotId,
                              };
                              thunkApi.dispatch(messageStreamEnd(message));
                            }
                          } else if (
                            finishReason === "length" ||
                            finishReason === "content_filter"
                          ) {
                            thunkApi.dispatch(messagesReachedMax());
                          } else if (finishReason === "function_call") {
                            // function_call完成
                          } else if (!hasFunction) {
                            // 只在非function调用时更新消息
                            temp =
                              (temp || "") +
                              (json.choices[0]?.delta?.content || "");
                            const message = {
                              role: "assistant",
                              id,
                              content: temp,
                              cybotId,
                            };
                            thunkApi.dispatch(setOne(message));
                            thunkApi.dispatch(
                              messageStreaming({ ...message, controller }),
                            );
                          }
                        }
                      } catch (e) {
                        chatWindowLogger.error(
                          { error: e },
                          "Error parsing JSON",
                        );
                      }
                    }
                  }
                }
              };
              await readChunks({ reader, id }, handleStreamData);
            } catch (error) {
              // 处理错误
              return { error: { status: "FETCH_ERROR", data: error.message } };
            }
          };
          await streamChat(content);
        }
      },
      {
        rejected: (state, action) => {},
        fulfilled: (state, action) => {},
      },
    ),
    clearMessages: create.reducer((state, action) => {
      state.ids = null;
      state.streamMessages = [];
    }),
    addUserMessage: create.asyncThunk(
      async ({ content, isSaveToServer = true }, thunkApi) => {
        const state = thunkApi.getState();
        const userId = selectCurrentUserId(state);
        const id = generateIdWithCustomId(userId, ulid(), { isJSON: true });
        const dispatch = thunkApi.dispatch;
        const currentDialogConfig = selectCurrentDialogConfig(state);
        const message = {
          id,
          role: "user",
          content,
          belongs: [currentDialogConfig.messageListId],
          userId,
        };
        dispatch(upsertOne(message));
        dispatch(addMessageToUI(message.id));
        if (isSaveToServer) {
          const actionResult = await dispatch(addMessageToServer(message));
          return actionResult.payload;
        }
      },
      {
        pending: () => {},
        rejected: (state, action) => {},
        fulfilled: (state, action) => {
          if (action.payload) {
            state.ids = reverse(action.payload.array);
          }
        },
      },
    ),
    addAIMessage: create.asyncThunk(
      async ({ content, id, isSaveToServer = true, cybotId }, thunkApi) => {
        const state = thunkApi.getState();
        const dispatch = thunkApi.dispatch;

        const currentDialogConfig = selectCurrentDialogConfig(state);

        const message = {
          role: "assistant",
          id,
          content,
          belongs: [currentDialogConfig.messageListId],
          cybotId,
        };
        dispatch(upsertOne(message));
        dispatch(addMessageToUI(message.id));
        if (isSaveToServer) {
          const actionResult = await dispatch(addMessageToServer(message));
          return actionResult.payload;
        }
      },
      {
        pending: () => {},
        rejected: (state, action) => {},
        fulfilled: (state, action) => {
          if (action.payload) {
            state.ids = reverse(action.payload.array);
          }
        },
      },
    ),

    streamRequest: create.asyncThunk(
      async ({ content, prevMsgs, cybotConfig, signal, id }, thunkApi) => {
        const dispatch = thunkApi.dispatch;
        const state = thunkApi.getState();
        const token = state.auth.currentToken;
        const currentServer = selectCurrentServer(state);
        const cybotId = cybotConfig.id;

        await dispatch(
          addAIMessage({
            content: "loading ...",
            id,
            isSaveToServer: false,
            cybotId,
          }),
        );

        const config = {
          ...cybotConfig,
          responseLanguage: navigator.language,
        };

        const requestBody = createStreamRequestBody(config, content, prevMsgs);
        console.log("requestBody", requestBody);
        const response = await sendNoloChatRequest({
          currentServer,
          requestBody: { ...requestBody },
          signal,
          token,
        });
        const reader = response.body.getReader();
        return { reader, id };
      },
      {},
    ),
    //for now only use in ollama
    streamLLmId: create.asyncThunk(
      async ({ cybotConfig, prevMsgs, content }, thunkApi) => {
        const dispatch = thunkApi.dispatch;
        const state = thunkApi.getState();
        const controller = new AbortController();
        const signal = controller.signal;
        const cybotId = cybotConfig.id;
        const userId = selectCurrentUserId(state);

        const id = generateIdWithCustomId(userId, ulid(), {
          isJSON: true,
        });
        console.log("cybotConfig", cybotConfig);
        const readLLMAction = await dispatch(read({ id: cybotConfig.llmId }));
        console.log("readLLMAction", readLLMAction);
        const llmConfig = readLLMAction.payload;
        const { api, apiStyle } = llmConfig;
        const model = llmConfig.model;
        const config = {
          ...cybotConfig,
          responseLanguage: navigator.language,
        };
        const promotMessage = createPromptMessage(model, config.prompt);
        const prepareMsgConfig = { model, promotMessage, prevMsgs, content };
        const messages = prepareMsgs(prepareMsgConfig);
        const tools = prepareTools(cybotConfig.tools);
        const isStream = true;
        const bodyData = {
          model: model,
          messages,
          tools,
          stream: isStream,
        };
        console.log("bodyData", bodyData);

        const body = JSON.stringify(bodyData);
        const result = await fetch(api, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body,
          signal,
        });

        if (result.ok) {
          await handleOllamaResponse(
            id,
            cybotId,
            result,
            thunkApi,
            controller,
            isStream,
            prevMsgs,
            content,
          );
        } else {
          console.error("HTTP-Error:", result.status);
        }
      },
      {},
    ),
    //for tool call cybot
    runCybotId: create.asyncThunk(
      async ({ cybotId, prevMsgs, userInput }, thunkApi) => {
        console.log("runCybotId cybotID", cybotId);
        const state = thunkApi.getState();

        const dispatch = thunkApi.dispatch;
        const readAction = await dispatch(read({ id: cybotId }));
        console.log("runCybotId readAction", readAction);
        const cybotConfig = readAction.payload;
        console.log("runCybotId cybotConfig", cybotConfig);
        const readLLMAction = await dispatch(read({ id: cybotConfig.llmId }));
        const llmConfig = readLLMAction.payload;
        console.log("runCybotId llmConfig", llmConfig);
        if (ollamaModelNames.includes(llmConfig.model)) {
          const model = llmConfig.model;
          const promotMessage = createPromptMessage(model, cybotConfig.prompt);

          const prepareMsgConfig = {
            model,
            promotMessage,
            prevMsgs,
            content: userInput,
          };
          const messages = prepareMsgs(prepareMsgConfig);
          const tools = prepareTools(cybotConfig.tools);

          const bodyData = {
            model: model,
            messages,
            tools,
            stream: false,
          };
          const body = JSON.stringify(bodyData);
          const { api, apiStyle } = llmConfig;
          const result = await fetch(api, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body,
            // signal,
          });
          const json = await result.json();
          const message = json.message;
          const cybotTools = message.tool_calls;
          console.log("message", message);
          console.log("cybotTools", cybotTools);
          if (!cybotTools) {
            console.log("direct return");
            return message;
          } else {
            const tool = cybotTools[0].function;
            const toolName = tool.name;
            if (toolName === "make_appointment") {
              const currentUserId = selectCurrentUserId(state);
              console.log("handle tool currentUserId", currentUserId);
              const result = await makeAppointment(
                tool.arguments,
                thunkApi,
                currentUserId,
              );
              console.log("handle tool result", result);
              const message = { content: result };
              return message;
            }
          }
        }
      },
      {},
    ),
    sendWithMessageId: create.asyncThunk(async (messageId, thunkApi) => {
      console.log("messageId", messageId);
      const state = thunkApi.getState();
    }, {}),
  }),
});

export const {
  sendMessage,
  receiveMessage,
  messageStreamEnd,
  messageStreaming,
  messagesReachedMax,
  deleteMessage,
  initMessages,
  removeMessageFromUI,
  deleteNotFound,
  addMessageToUI,
  handleSendMessage,
  clearMessages,
  addMessageToServer,
  addAIMessage,
  addUserMessage,
  streamRequest,
  streamLLmId,
  sendWithMessageId,
  runCybotId,
} = messageSlice.actions;

export default messageSlice.reducer;
