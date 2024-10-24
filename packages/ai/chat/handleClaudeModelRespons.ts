import { setOne } from "database/dbSlice";
import { messageStreamEnd, messageStreaming } from "chat/messages/messageSlice";
import { updateInputTokens, updateOutputTokens } from "chat/dialog/dialogSlice";

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

export function handleClaudeModelResponse(
  text,
  id,
  cybotId,
  temp,
  thunkApi,
  controller,
) {
  const jsonResults = parseMultipleJson(text);
  const jsonArray = Array.isArray(jsonResults) ? jsonResults : [jsonResults];

  jsonArray.forEach((json) => {
    switch (json.type) {
      case "message_start":
        if (
          json.message &&
          json.message.usage &&
          json.message.usage.input_tokens
        ) {
          thunkApi.dispatch(updateInputTokens(json.message.usage.input_tokens));
        }
        break;

      case "message_stop":
        thunkApi.dispatch(
          messageStreamEnd({
            id,
            content: temp,
            cybotId,
          }),
        );
        break;

      case "content_block_delta":
        temp = (temp || "") + (json.delta?.text || "");
        const message = {
          role: "assistant",
          id,
          content: temp,
          cybotId,
        };
        thunkApi.dispatch(setOne(message));
        thunkApi.dispatch(messageStreaming({ ...message, controller }));
        break;

      case "message_delta":
        if (json.usage && json.usage.output_tokens) {
          thunkApi.dispatch(updateOutputTokens(json.usage.output_tokens));
        }
        break;

      default:
        break;
    }
  });

  return temp; // 返回更新后的 temp 值
}
