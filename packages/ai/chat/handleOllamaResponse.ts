import {
  messageStreamEnd,
  messageStreaming,
  runCybotId,
} from "chat/messages/messageSlice";
import { setOne } from "database/dbSlice";
import { getHeadTail } from "core/getHeadTail";
import { getWeather } from "../tools/getWeather";
import { extractJsonFromXml } from "../tools/extractJsonFromXml";
import { makeAppointment } from "../tools/appointment";
import { selectCurrentUserId } from "auth/authSlice";

export const handleOllamaResponse = async (
  id,
  cybotId,
  result,
  thunkApi,
  controller,
  isStream,
  prevMsgs,
  userInput,
) => {
  const dispatch = thunkApi.dispatch;
  if (!isStream) {
    const data = await result.json();
    console.log("data", data);
    if (data.done) {
      if (data.message) {
        const content = data.message.content;
        const message = {
          role: "assistant",
          id,
          content: content,
          cybotId,
        };
        thunkApi.dispatch(setOne(message));
        thunkApi.dispatch(messageStreaming({ ...message }));
        return;
      }
    }
  } else {
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
            console.log("jsonData", jsonData);
            //todo  add open or close
            // console.log("Received data:", jsonData);
            const { done } = jsonData;
            temp = (temp || "") + (jsonData.message.content || "");
            if (done) {
              console.log("temp", temp);
              //qwen2.5 format
              if (temp.startsWith("<tool_call>")) {
                const message = {
                  role: "assistant",
                  id,
                  content: "thinking",
                  cybotId,
                };
                thunkApi.dispatch(messageStreaming({ ...message, controller }));
                // const { key, value } = getHeadTail(temp);
                // console.log("key", key);
                // console.log("value", value);
                const json = extractJsonFromXml(temp);
                console.log("qwen2.5  json", json);
                if (json.name === "run_cybot") {
                  const cybotId = json.arguments.cybotId;
                  const message = {
                    role: "assistant",
                    id,
                    content: "running",
                    cybotId,
                  };
                  thunkApi.dispatch(
                    messageStreaming({ ...message, controller }),
                  );
                  console.log("cybotId", cybotId);
                  const result = await dispatch(
                    runCybotId({ cybotId, prevMsgs, userInput }),
                  );
                  console.log("runCybotId result", result);
                  let endMessage;
                  if (typeof result.payload === "string") {
                    endMessage = {
                      content: result.payload,

                      id,
                      cybotId,
                    };
                  } else {
                    endMessage = {
                      ...result.payload,
                      id,
                      cybotId,
                    };
                  }

                  console.log("endMessage ", endMessage);

                  thunkApi.dispatch(messageStreamEnd(endMessage));
                  return;
                }
                if (json.name === "make_appointment") {
                  const message = {
                    role: "assistant",
                    id,
                    content: "running",
                    cybotId,
                  };
                  thunkApi.dispatch(
                    messageStreaming({ ...message, controller }),
                  );
                  const state = thunkApi.getState();
                  const currentUserId = selectCurrentUserId(state);
                  const result = await makeAppointment(
                    json.arguments,
                    thunkApi,
                    currentUserId,
                  );
                  thunkApi.dispatch(
                    messageStreamEnd({
                      id,
                      content: result,
                      cybotId,
                    }),
                  );
                  return;
                }
              }

              if (temp.startsWith("[TOOL_CALLS]")) {
                const message = {
                  role: "assistant",
                  id,
                  content: "思考中",
                  cybotId,
                };
                thunkApi.dispatch(messageStreaming({ ...message, controller }));

                const { key, value } = getHeadTail(temp);
                const json = JSON.parse(value);
                console.log("json", json);

                json.map(async (tool) => {
                  console.log("arguments", tool.arguments);
                  console.log("name", tool.name);
                  if (tool.name === "get_current_weather") {
                    const message = {
                      role: "assistant",
                      id,
                      content: "running",
                      cybotId,
                    };
                    thunkApi.dispatch(
                      messageStreaming({ ...message, controller }),
                    );

                    const result = await getWeather(tool.arguments);

                    const endMesssage = {
                      id,
                      content: result,
                      cybotId,
                    };
                    console.log("endMesssage", endMesssage);
                    thunkApi.dispatch(messageStreamEnd(endMesssage));
                  }
                  if (tool.name === "run_cybot") {
                    const message = {
                      role: "assistant",
                      id,
                      content: "执行中",
                      cybotId,
                    };
                    thunkApi.dispatch(
                      messageStreaming({ ...message, controller }),
                    );

                    // const result = await runCybot(tool.arguments);
                    const endMesssage = {
                      id,
                      content: "x",
                      cybotId,
                    };
                    console.log("endMesssage", endMesssage);
                    thunkApi.dispatch(messageStreamEnd(endMesssage));
                  }
                });
              } else {
                /// not tool call
                thunkApi.dispatch(
                  messageStreamEnd({
                    id,
                    content: temp,
                    cybotId,
                  }),
                );
              }
            } else {
              const message = {
                role: "assistant",
                id,
                content: temp,
                cybotId,
              };
              thunkApi.dispatch(setOne(message));
              thunkApi.dispatch(messageStreaming({ ...message, controller }));
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
  }
};
