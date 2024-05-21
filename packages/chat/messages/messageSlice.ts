import {
  PayloadAction,
  nanoid,
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
import { noloReadRequest } from "database/client/readRequest";
import { ulid } from "ulid";
import { DataType } from "create/types";
import { selectCurrentUserId } from "auth/authSlice";
import { upsertOne } from "database/dbSlice";
import { selectCurrentServer } from "setting/settingSlice";

import { getModefromContent } from "../hooks/getModefromContent";
import { getContextFromMode } from "../hooks/getContextfromMode";

import { Message, MessageSliceState } from "./types";
import {
  selectCurrentDialogConfig,
  selectCurrentLLMConfig,
} from "../dialog/dialogSlice";
const chatUrl = `${API_ENDPOINTS.AI}/chat`;
const chatWindowLogger = getLogger("ChatWindow");

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

const initialState: MessageSliceState = {
  messageListId: null,
  ids: [],
  messages: [],
  isStopped: false,
  isMessageStreaming: false,
  tempMessage: null,
  requestFailed: false,
};
export const messageSlice = createSliceWithThunks({
  name: "message",
  initialState,
  reducers: (create) => ({
    initMessages: create.asyncThunk(
      async (messageListId, thunkApi) => {
        const state = thunkApi.getState();
        if (!messageListId) {
          throw new Error("messageListId not exist");
        }
        const res = await noloReadRequest(state, messageListId);
        return await res.json();
      },

      {
        pending: (state) => {
          state.ids = [];
        },
        rejected: (state) => {
          state.ids = [];
        },
        fulfilled: (state, action) => {
          state.ids = action.payload.array;
        },
      },
    ),
    messageStreamEnd: create.asyncThunk(
      async (message, thunkApi) => {
        thunkApi.dispatch(upsertOne(message));
        thunkApi.dispatch(addMessageToUI(message.id));
        thunkApi.dispatch(addMessage(message));

        const state = thunkApi.getState();
        const userId = selectCurrentUserId(state);
        const token = state.auth.currentToken;
        const dialogConfig = selectCurrentDialogConfig(state);
        const currentServer = selectCurrentServer(state);

        const fetchConfig = {
          url: `${API_ENDPOINTS.DATABASE}/write/`,
          method: "POST",
          body: JSON.stringify({
            data: { type: DataType.Message, ...message },
            flags: { isJSON: true },
            customId: ulid(),
            userId,
          }),
        };
        const writeMessage = await noloRequest(state, fetchConfig);
        const saveMessage = await writeMessage.json();

        const updateId = dialogConfig.messageListId;
        const writeMessageToList = await fetch(
          `${currentServer}${API_ENDPOINTS.DATABASE}/update/${updateId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              id: saveMessage.noloId,
            }),
          },
        );

        return await writeMessageToList.json();
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
        thunkApi.dispatch(upsertOne(message));
        thunkApi.dispatch(startSendingMessage(message));
        //   state.messages.push(message);
        const state = thunkApi.getState();
        const token = state.auth.currentToken;
        const userId = selectCurrentUserId(state);
        const currentServer = selectCurrentServer(state);
        try {
          const writeMessage = await fetch(
            `${currentServer}${API_ENDPOINTS.DATABASE}/write/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                data: { type: DataType.Message, ...message },
                flags: { isJSON: true },
                customId: ulid(),
                userId,
              }),
            },
          );
          const saveMessage = await writeMessage.json();
          const dialogConfig = selectCurrentDialogConfig(state);
          const updateId = dialogConfig.messageListId;

          const writeMessageToList = await fetch(
            `${currentServer}${API_ENDPOINTS.DATABASE}/update/${updateId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                id: saveMessage.noloId,
              }),
            },
          );
          const result = await writeMessageToList.json();
          console.log("result", result);
          return result;
        } catch (error) {
          console.log("error", error);
          return error;
        }
      },
      {
        pending: () => {},
        rejected: (state, action) => {
          // state.error = action.payload ?? action.error;
          console.log("action", action);
        },
        fulfilled: (state, action) => {
          state.ids = action.payload.array;
        },
      },
    ),
    receiveMessage: create.reducer((state, action) => {
      state.messages.push(action.payload);
      state.tempMessage = null;
    }),
    retry: create.reducer<Message>((state, action) => {
      state.tempMessage = { role: "assistant", content: "", id: nanoid() };
      state.messages.pop();
    }),
    messageStreaming: create.reducer<Message>((state, action) => {
      state.tempMessage = action.payload;
      state.isMessageStreaming = true;
    }),
    addMessageToUI: create.reducer((state, action: PayloadAction<string>) => {
      state.ids.push(action.payload);
    }),
    addMessage: create.reducer((state, action: PayloadAction<Message>) => {
      if (!state.messages.some((message) => message.id === action.payload.id)) {
        state.messages.push(action.payload);
      }
    }),
    removeMessageFromUI: create.reducer(
      (state, action: PayloadAction<string>) => {
        state.ids = state.ids.filter((id) => id !== action.payload);
      },
    ),
    deleteMessage: create.asyncThunk(
      async (messageId: string, thunkApi) => {
        thunkApi.dispatch(removeMessageFromUI(messageId));
        // thunkApi.dispatch(removeOne(messageId));
        const state = thunkApi.getState();
        const token = state.auth.currentToken;
        const dialogConfig = selectCurrentDialogConfig(state);
        const currentServer = selectCurrentServer(state);

        const deleteMessage = await fetch(
          `${currentServer}${API_ENDPOINTS.DATABASE}/delete/${messageId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({}),
          },
        );
        const deleteMessageFromList = await fetch(
          `${currentServer}${API_ENDPOINTS.DATABASE}/update/${dialogConfig.messageListId}`,
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
    deleteNotFound: create.asyncThunk(
      async (messageId: string, thunkApi) => {
        thunkApi.dispatch(removeMessageFromUI(messageId));
        // thunkApi.dispatch(removeOne(messageId));
        const state = thunkApi.getState();
        const token = state.auth.currentToken;
        const dialogConfig = selectCurrentDialogConfig(state);
        const currentServer = selectCurrentServer(state);

        const deleteMessageFromList = await fetch(
          `${currentServer}${API_ENDPOINTS.DATABASE}/update/${dialogConfig.messageListId}`,
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
    continueMessage: create.reducer((state, action) => {
      state.isStopped = false;
      state.messages.push(action.payload);
    }),
    messagesReachedMax: create.reducer((state, action) => {
      state.isStopped = true;
    }),
    handleSendMessage: create.asyncThunk(
      async ({ content, abortControllerRef }, thunkApi) => {
        let textContent;
        const state = thunkApi.getState();
        const config = selectCurrentLLMConfig(state);
        const messages = state.message.messages;
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

          const handleStreamData = (data) => {
            const text = new TextDecoder("utf-8").decode(data);
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
                    const finishReason: string = json.choices[0].finish_reason;
                    if (finishReason === "stop") {
                      const id = generateIdWithCustomId(userId, ulid(), {
                        isJSON: true,
                      });
                      console.log("");
                      const message = {
                        role: "assistant",
                        content: temp,
                        id,
                        userId,
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
                        (temp || "") + (json.choices[0]?.delta?.content || "");
                      console.log("stream temp", temp);
                      const message = {
                        role: "assistant",
                        id: json.id,
                        content: temp,
                      };
                      thunkApi.dispatch(messageStreaming(message));
                    }
                    // if (json.choices[0]?.delta?.content) {
                    //   tokenCount++; // 单次计数
                    // }
                  } catch (e) {
                    chatWindowLogger.error({ error: e }, "Error parsing JSON");
                  }
                }
              }
            }
          };

          const streamChat = async ({ onStreamData, textContent }) => {
            const requestBody = createStreamRequestBody(
              {
                ...config,
                responseLanguage: navigator.language,
              },
              textContent,
              messages,
            );

            const currentServer = selectCurrentServer(state);
            const url = `${currentServer}${chatUrl}`;

            try {
              const response = await fetch(url, {
                method: "POST",
                body: JSON.stringify(requestBody),
                signal: abortControllerRef.current.signal,
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
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

              await readChunks(reader, onStreamData);
            } catch (error) {
              // 处理错误
              return { error: { status: "FETCH_ERROR", data: error.message } };
            }
          };
          await streamChat({
            onStreamData: handleStreamData,
            textContent,
          });
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
  }),
});

export const {
  sendMessage,
  receiveMessage,
  retry,
  messageStreamEnd,
  messageStreaming,
  messagesReachedMax,
  continueMessage,
  deleteMessage,
  initMessages,
  startSendingMessage,
  removeMessageFromUI,
  deleteNotFound,
  addMessageToUI,
  handleSendMessage,
  addMessage,
} = messageSlice.actions;

export default messageSlice.reducer;
