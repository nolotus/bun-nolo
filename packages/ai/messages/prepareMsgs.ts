import { claudeHandler } from "integrations/anthropic/claudeHandler";
import { ollamaHandler } from "integrations/ollama/ollamaHandler";

// 主要处理函数
export function prepareMsgs({ model, promotMessage, prevMsgs, content }) {
  if (model === "llava") {
    return ollamaHandler.prepareMsgs({ promotMessage, prevMsgs, content });
  } else if (model.includes("claude")) {
    return claudeHandler.prepareMsgs({ promotMessage, prevMsgs, content });
  }

  // 对于其他模型的处理逻辑
  return [promotMessage, ...prevMsgs, { role: "user", content }];
}
