import {
  PayloadAction,
  buildCreateSlice,
  asyncThunkCreator,
} from "@reduxjs/toolkit";
import { API_ENDPOINTS } from "database/config";
import { generateIdWithCustomId } from "core/generateMainKey";
import { createPromotMessage } from "ai/utils/createPromotMessage";
import { pickMessages } from "ai/utils/pickMessages";
import { pickAiRequstBody } from "ai/utils/pickAiRequstBody";
import { readChunks } from "ai/client/stream";
import { getLogger } from "utils/logger";
import { createStreamRequestBody } from "ai/utils/createStreamRequestBody";
import { noloRequest } from "utils/noloRequest";
import { ulid } from "ulid";
import { DataType } from "create/types";
import { selectCurrentUserId } from "auth/authSlice";
import {
  addToList,
  deleteData,
  read,
  selectEntitiesByIds,
  upsertOne,
} from "database/dbSlice";
import { selectCurrentServer } from "setting/settingSlice";
import { filter } from "rambda";

import { getModefromContent } from "../hooks/getModefromContent";
import { getContextFromMode } from "../hooks/getContextfromMode";

import { Message, MessageSliceState } from "./types";
import {
  selectCurrentDialogConfig,
  selectCurrentLLMConfig,
} from "../dialog/dialogSlice";
import { chatStreamRequest } from "./chatStreamRequest";
import { extractCustomId } from "core";
const chatWindowLogger = getLogger("ChatWindow");

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

const initialState: MessageSliceState = {
  messageListId: null,
  ids: null,
  isStopped: false,
  isMessageStreaming: false,
  tempMessage: null,
  requestFailed: false,
  messageLoading: false,
  messageListFailed: false,
};
export const messageSlice = createSliceWithThunks({
  name: "message",
  initialState,
  reducers: (create) => ({
    initMessages: create.asyncThunk(
      async (args, thunkApi) => {
        const { messageListId, source } = args;
        if (!messageListId) {
          throw new Error("messageListId not exist");
        }
        const { dispatch } = thunkApi;
        const action = await dispatch(read({ id: messageListId, source }));
        if (action.error) {
          throw new Error(action.error);
        }
        return action.payload;
      },
      {
        pending: (state) => {
          state.messageLoading = true;
        },
        rejected: (state) => {
          state.messageListFailed = true;
          state.messageLoading = false;
        },
        fulfilled: (state, action) => {
          state.messageListFailed = false;
          state.ids = action.payload.array;
          state.messageLoading = false;
        },
      },
    ),
    messageStreamEnd: create.asyncThunk(
      async (message, thunkApi) => {
        const { dispatch } = thunkApi;
        dispatch(upsertOne(message));
        dispatch(addMessageToUI(message.id));
        const action = await dispatch(addMessageToServer(message));

        return action.payload;
      },
      {
        rejected: (state, action) => {
          // state.error = action.payload ?? action.error;
          console.log("action", action);
        },
        fulfilled: (state, action) => {
          state.tempMessage = { role: "assistant", content: "", id: ulid() };
          state.isMessageStreaming = false;
        },
      },
    ),
    startSendingMessage: create.reducer((state, action) => {
      const message = action.payload;
      state.requestFailed = false;
      state.ids.push(message.id);
      state.tempMessage = {
        role: "assistant",
        content: "loading",
        id: ulid(),
      };
      state.isMessageStreaming = true;
    }),
    sendMessage: create.asyncThunk(
      async (message, thunkApi) => {
        const dispatch = thunkApi.dispatch;
        dispatch(upsertOne(message));
        dispatch(startSendingMessage(message));

        const actionResult = await dispatch(addMessageToServer(message));
        return actionResult.payload;
      },
      {
        pending: () => {},
        rejected: (state, action) => {},
        fulfilled: (state, action) => {
          state.ids = action.payload.array;
        },
      },
    ),
    //todo
    receiveMessage: create.reducer((state, action) => {
      state.ids.push(action.payload.id);
      state.tempMessage = null;
    }),

    messageStreaming: create.reducer<Message>((state, action) => {
      state.tempMessage = action.payload;
      state.isMessageStreaming = true;
    }),
    addMessageToUI: create.reducer((state, action: PayloadAction<string>) => {
      state.ids.push(action.payload);
    }),
    addMessageToServer: create.asyncThunk(
      async (message, thunkApi) => {
        console.log("message", message);
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
        console.log("saveMessage", saveMessage);
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
          // console.log("action", action);
        },
        fulfilled: (state, action) => {
          // state.tempMessage = { role: "assistant", content: "", id: ulid() };
          // state.isMessageStreaming = false;
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
        console.log("deleteMessageFromList", deleteMessageFromList);

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
        console.log("deleteMessageFromList", deleteMessageFromList);
      },

      {
        pending: () => {},
        fulfilled: () => {},
      },
    ),
    //todo

    messagesReachedMax: create.reducer((state, action) => {
      state.isStopped = true;
    }),
    handleSendMessage: create.asyncThunk(
      async ({ content, abortControllerRef }, thunkApi) => {
        let textContent;
        const state = thunkApi.getState();
        const config = selectCurrentLLMConfig(state);
        const originMessages = selectEntitiesByIds(state, state.message.ids);
        const messages = filter(
          (x) => x !== null && x !== undefined,
          originMessages,
        );
        const userId = selectCurrentUserId(state);
        const token = state.auth.currentToken;
        const currentDialogConfig = selectCurrentDialogConfig(state);
        const id = generateIdWithCustomId(userId, ulid(), { isJSON: true });

        if (typeof content === "string") {
          textContent = content;
        }
        const message = {
          id,
          role: "user",
          content,
          belongs: [currentDialogConfig.messageListId],
          userId,
        };

        thunkApi.dispatch(sendMessage(message));

        const mode = getModefromContent(textContent, message);
        const context = await getContextFromMode(mode, textContent);
        if (mode === "stream") {
          //   const staticData = {
          //     dialogType: "send",
          //     model: currentDialogConfig?.model,
          //     length: newMessage.length,
          //     userId: auth?.user?.userId,
          //     username: auth?.user?.username,
          //     date: new Date(),
          //   };
          //   tokenStatic(staticData, auth, writeHashData);
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }
          abortControllerRef.current = new AbortController();
          let temp: string;

          const streamChat = async (textContent) => {
            const handleStreamData = (text: string) => {
              const id = generateIdWithCustomId(userId, ulid(), {
                isJSON: true,
              });
              if (
                config.model === "llama3" ||
                config.model === "qwen2" ||
                config.model === "gemma2"
              ) {
                let rawJSON = {};
                try {
                  rawJSON = JSON.parse(text);
                } catch (error) {
                  console.log("json parse text", text);
                  console.log("json parse error", error);
                }
                console.log("rawJSON", rawJSON);
                const { done_reason, done } = rawJSON;
                temp = (temp || "") + (rawJSON.message.content || "");

                const message = {
                  role: "assistant",
                  id,
                  content: temp,
                  llmId: currentDialogConfig.llmId,
                };
                console.log("message", message);
                if (done) {
                  thunkApi.dispatch(messageStreamEnd(message));
                } else {
                  thunkApi.dispatch(messageStreaming(message));
                }
              } else {
                console.log("text", text);
                const lines = text.trim().split("\n");
                for (const line of lines) {
                  // 使用正则表达式匹配 "data:" 后面的内容
                  const match = line.match(/data: (done|{.*}|)/);

                  if (match && match[1] !== undefined) {
                    const statusOrJson: string = match[1];

                    if (statusOrJson === "" || statusOrJson === "done") {
                    } else {
                      try {
                        const json = JSON.parse(statusOrJson);
                        // 自然停止
                        const finishReason: string =
                          json.choices[0].finish_reason;
                        if (finishReason === "stop") {
                          const message = {
                            role: "assistant",
                            content: temp,
                            id,
                            llmId: currentDialogConfig.llmId,
                          };
                          thunkApi.dispatch(messageStreamEnd(message));
                          //这里应该使用更精准的token计算方式 需要考虑各家token价格不一致
                          // const staticData = {
                          //   dialogType: "receive",
                          //   model: json.model,
                          //   length: tokenCount,
                          //   chatId: json.id,
                          //   chatCreated: json.created,
                          //   userId: auth.user?.userId,
                          //   username: auth.user?.username,
                          // };
                          // tokenStatic(staticData, auth, writeHashData);

                          // tokenCount = 0; // 重置计数器
                        } else if (
                          finishReason === "length" ||
                          finishReason === "content_filter"
                        ) {
                          thunkApi.dispatch(messagesReachedMax());
                        } else if (finishReason === "function_call") {
                          // nerver use just sign it
                        } else {
                          //逐渐相加
                          temp =
                            (temp || "") +
                            (json.choices[0]?.delta?.content || "");
                          const message = {
                            role: "assistant",
                            id,
                            content: temp,
                          };
                          thunkApi.dispatch(messageStreaming(message));
                        }
                        // if (json.choices[0]?.delta?.content) {
                        //   tokenCount++; // 单次计数
                        // }
                      } catch (e) {
                        chatWindowLogger.error(
                          { error: e },
                          "Error parsing JSON",
                        );
                      }
                    }
                  }
                }
              }
            };

            const currentServer = selectCurrentServer(state);
            const requestBody = createStreamRequestBody(
              {
                ...config,
                responseLanguage: navigator.language,
              },
              textContent,
              messages,
            );

            try {
              const response = await chatStreamRequest({
                currentServer,
                requestBody,
                abortControllerRef,
                token,
              });

              if (!response.ok) {
                // 处理错误
                return {
                  error: {
                    status: response.status,
                    data: await response.text(),
                  },
                };
              }

              const reader = response.body.getReader();
              await readChunks(reader, handleStreamData);
            } catch (error) {
              // 处理错误
              return { error: { status: "FETCH_ERROR", data: error.message } };
            }
          };
          const result = await streamChat(textContent);
          console.log("stream", result);
        }

        if (mode === "image") {
          thunkApi.dispatch(
            receiveMessage({
              role: "assistant",
              content: "Here is your generated image:",
              image: context.image,
            }),
          );
        }
        if (mode === "surf") {
          thunkApi.dispatch(
            receiveMessage({
              role: "assistant",
              content: context.content,
            }),
          );
        }

        try {
          if (mode === "vision") {
            const createRequestBody = (config) => {
              const model = config.model;
              const promotMessage = createPromotMessage(config);
              const body = {
                type: "vision",
                model,
                messages: pickMessages([promotMessage, ...messages, message]),
                temperature: config.temperature || 0.8,
                max_tokens: config.max_tokens || 4096,
                top_p: config.top_p || 0.9,
                frequency_penalty: config.frequency_penalty || 0,
                presence_penalty: config.presence_penalty || 0,
              };
              return {
                ...pickAiRequstBody(body),
                messages: pickMessages(body.messages),
              };
            };
            const currentDialogConfig = selectCurrentDialogConfig(state);
            const requestBody = createRequestBody({
              ...currentDialogConfig,
              responseLanguage: navigator.language,
            });
            const visionChat = (body) => {
              return fetch(`${API_ENDPOINTS.AI}/chat`, {
                method: "POST",
                body,
              });
            };
            const result = await visionChat(requestBody).json();
            const content = result.choices[0].message;

            thunkApi.dispatch(receiveMessage(content));
          }
        } catch (error) {
          // setRequestFailed(true);
        }
      },
      {
        rejected: (state, action) => {
          console.log("action", action);
        },
        fulfilled: (state, action) => {
          state.isMessageStreaming = false;
        },
      },
    ),
    clearMessages: create.reducer((state, action) => {
      state.ids = null;
    }),
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
  startSendingMessage,
  removeMessageFromUI,
  deleteNotFound,
  addMessageToUI,
  handleSendMessage,
  clearMessages,
  addMessageToServer,
} = messageSlice.actions;

export default messageSlice.reducer;
