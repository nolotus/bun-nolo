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
import {
  createPromotMessage,
  createStreamRequestBody,
} from "ai/utils/createStreamRequestBody";
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

import { getModefromContent } from "../hooks/getModefromContent";
import { getContextFromMode } from "../hooks/getContextfromMode";

import { Message, MessageSliceState } from "./types";
import { selectCurrentDialogConfig } from "../dialog/dialogSlice";
import { chatStreamRequest } from "./chatStreamRequest";
import { getFilteredMessages } from "./utils";
import { ollamaModelNames } from "integrations/ollama/models";

const chatWindowLogger = getLogger("ChatWindow");

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});
function parseMultipleJson(text) {
  console.log("text", text);

  let buffer = "";
  const separator = "}{";
  const results = [];

  for (let char of text) {
    buffer += char;
    try {
      // 尝试解析缓冲区内容
      if (buffer.trim()) {
        const json = JSON.parse(buffer);
        results.push(json);
        buffer = ""; // 清空缓冲区，准备解析下一个对象
      }
    } catch (e) {
      // 当前缓冲区内容不是完整的JSON对象，继续累积字符
      if (buffer.endsWith(separator)) {
        // 如果缓冲区以 '}{' 结束，说明一个对象可能已经完成，前一个已正确解析，切割并尝试下一部分
        const parts = buffer.split(separator);
        for (const part of parts.slice(0, -1)) {
          if (part.trim()) {
            try {
              const completeJson = JSON.parse(part + "}");
              results.push(completeJson);
            } catch (error) {
              console.error("Invalid JSON:", part + "}");
            }
          }
        }
        buffer = "{" + parts.slice(-1);
      }
    }
  }

  // 检查缓冲区中剩余的内容
  if (buffer.trim()) {
    try {
      const finalJson = JSON.parse(buffer);
      console.log("json", finalJson);
      results.push(finalJson);
    } catch (e) {
      console.error("Remaining data could not be parsed:", buffer);
    }
  }

  // 如果只解析出了一个结果，直接返回这个结果（单个JSON对象）
  // 否则返回解析出的所有JSON对象（数组）
  return results.length === 1 ? results[0] : results;
}
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

        /// todo multi cybot could reply multi msg
        //for now just one

        // move to inside
        if (typeof content === "string") {
          textContent = content;
        }

        const mode = getModefromContent(textContent, content);
        const context = await getContextFromMode(mode, textContent);

        if (mode === "stream") {
          // const staticData = {
          //   dialogType: "send",
          //   model: config?.model,
          //   length: newMessage.length,
          //   userId: auth?.user?.userId,
          //   username: auth?.user?.username,
          //   date: new Date(),
          // };

          const streamChat = async (content) => {
            const userId = selectCurrentUserId(state);
            const id = generateIdWithCustomId(userId, ulid(), {
              isJSON: true,
            });
            let temp: string;
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
                if (cybotConfig.model.includes("claude")) {
                  const jsonResults = parseMultipleJson(text);
                  console.log("raw json xxx", jsonResults);
                  const jsonArray = Array.isArray(jsonResults)
                    ? jsonResults
                    : [jsonResults];

                  jsonArray.forEach((json) => {
                    switch (json.type) {
                      case "message_stop":
                        thunkApi.dispatch(
                          messageStreamEnd({
                            id,
                            content: temp,
                            cybotId,
                          }),
                        );
                        break; // 不要遗漏 `break`

                      case "content_block_delta":
                        console.log("json xxx", json);
                        temp = (temp || "") + (json.delta?.text || "");
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
                        break;

                      default:
                        break;
                    }
                  });
                }

                if (ollamaModelNames.includes(model)) {
                  let rawJSON = {};
                  try {
                    rawJSON = JSON.parse(text);
                  } catch (error) {}
                  const { done_reason, done } = rawJSON;
                  temp = (temp || "") + (rawJSON.message.content || "");

                  if (done) {
                    thunkApi.dispatch(
                      messageStreamEnd({
                        id,
                        content: temp,
                        cybotId,
                      }),
                    );
                  } else {
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
                } else {
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
                          const finishReason: string =
                            json.choices[0].finish_reason;
                          if (finishReason === "stop") {
                            const message = {
                              content: temp,
                              id,
                              cybotId,
                            };

                            thunkApi.dispatch(messageStreamEnd(message));
                            //这里应该使用更精准的token计算方式 需要考虑各家token价格不一致
                            // const staticData = {
                            //   dialogType: "receive",
                            //   model: json.model,
                            //   length: tokenCount,
                            //   chatId: json.id,
                            //   userId: auth.user?.userId,
                            //   username: auth.user?.username,
                            // };

                            // tokenCount = 0; // 重置计数器
                          } else if (
                            finishReason === "length" ||
                            finishReason === "content_filter"
                          ) {
                            thunkApi.dispatch(messagesReachedMax());
                          } else if (finishReason === "function_call") {
                            // nerver use just sign it
                          } else {
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
              await readChunks({ reader, id }, handleStreamData);
            } catch (error) {
              // 处理错误
              return { error: { status: "FETCH_ERROR", data: error.message } };
            }
          };
          await streamChat(content);
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
        const cybotId = cybotConfig.id;

        await dispatch(
          addAIMessage({
            content: "loading ...",
            id,
            isSaveToServer: false,
            cybotId,
          }),
        );

        const currentServer = selectCurrentServer(state);
        const token = state.auth.currentToken;

        const config = {
          ...cybotConfig,
          responseLanguage: navigator.language,
        };
        const requestBody = createStreamRequestBody(config, content, prevMsgs);
        if (cybotConfig.llmId) {
          await dispatch(
            streamLLmId({ cybotConfig, prevMsgs, content, signal, id }),
          );
          return;
        }
        const response = await chatStreamRequest({
          currentServer,
          requestBody,
          signal,
          token,
        });
        const reader = response.body.getReader();
        return { reader, id };
      },
      {},
    ),
    streamLLmId: create.asyncThunk(
      async ({ cybotConfig, prevMsgs, content, signal, id }, thunkApi) => {
        const cybotId = cybotConfig.id;
        const dispatch = thunkApi.dispatch;
        const readLLMAction = await dispatch(read({ id: cybotConfig.llmId }));
        const llmConfig = readLLMAction.payload;
        const { api, apiStyle, model } = llmConfig;

        console.log("apiStyle", apiStyle);
        console.log("model", model);
        const config = {
          ...cybotConfig,
          responseLanguage: navigator.language,
        };
        const promotMessage = createPromotMessage(config);

        const prepareMsgConfig = { model, promotMessage, prevMsgs, content };

        const messages = prepareMsgs(prepareMsgConfig);

        const body = JSON.stringify({
          model: model,
          messages,
        });
        console.log("body", body);
        const result = await fetch(api, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body,
        });
        if (result.ok) {
          const reader = result.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          let temp;
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // 处理缓冲区中的完整 JSON 对象
            let newlineIndex;
            while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
              const chunk = buffer.slice(0, newlineIndex);
              buffer = buffer.slice(newlineIndex + 1);

              if (chunk.trim().length > 0) {
                try {
                  const jsonData = JSON.parse(chunk);
                  console.log("Received data:", jsonData);
                  const { done } = jsonData;
                  temp = (temp || "") + (jsonData.message.content || "");
                  if (done) {
                    thunkApi.dispatch(
                      messageStreamEnd({
                        id,
                        content: temp,
                        cybotId,
                      }),
                    );
                  } else {
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
                  // 在这里处理您的 JSON 数据
                  // 例如：更新UI，存储数据等
                } catch (error) {
                  console.error("Error parsing JSON:", error);
                }
              }
            }
          }

          // 处理最后可能剩余的数据
          if (buffer.trim().length > 0) {
            try {
              const jsonData = JSON.parse(buffer);
              console.log("Final data:", jsonData);
              // 处理最后的 JSON 数据
            } catch (error) {
              console.error("Error parsing final JSON:", error);
            }
          }
        } else {
          console.error("HTTP-Error:", result.status);
        }
      },
      {},
    ),
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
} = messageSlice.actions;

export default messageSlice.reducer;
