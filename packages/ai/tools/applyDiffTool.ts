// /ai/tools/applyDiffTool.ts

import type { RootState } from "app/store";
import { selectCurrentServer } from "app/settings/settingSlice";

/**
 * [Schema] 定义 'applyDiff' 工具结构，供 LLM 调用。
 */
export const applyDiffFunctionSchema = {
  name: "applyDiff",
  description:
    "将给定的 unified/git diff 补丁应用到指定的项目文件中，用于在代码库中执行精确修改。",
  parameters: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description:
          "要修改的文件相对项目根目录的路径，例如 'src/index.ts' 或 'apps/web/src/App.tsx'。",
      },
      diff: {
        type: "string",
        description:
          "针对该 filePath 文件的 unified/git diff 补丁文本。仅应包含与此文件相关的 hunks。",
      },
    },
    required: ["filePath", "diff"],
  },
};

/**
 * 截断文本，用于 displayData 预览。
 */
function truncateText(text: string, maxLength = 400): string {
  if (!text) return "";
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + "\n...（已截断，仅展示前部分补丁内容）";
}

/**
 * [Executor] 'applyDiff' 工具执行函数。
 */
export async function applyDiffFunc(
  args: { filePath: string; diff: string },
  thunkApi: any
): Promise<{ rawData: string; displayData: string }> {
  const { filePath, diff } = args;

  if (!filePath || typeof filePath !== "string") {
    throw new Error("应用补丁失败：必须提供有效的 filePath 字符串。");
  }

  if (!diff || typeof diff !== "string") {
    throw new Error("应用补丁失败：必须提供有效的 diff 补丁文本。");
  }

  try {
    const state = thunkApi.getState() as RootState;
    const currentServer = selectCurrentServer(state);

    if (!currentServer) {
      throw new Error("应用补丁失败：无法获取当前服务器配置。");
    }

    const apiUrl = `${currentServer}/api/apply-diff`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filePath, diff }),
    });

    const textBody = await response.text();
    let data: any = {};
    try {
      data = textBody ? JSON.parse(textBody) : {};
    } catch {
      // 如果不是 JSON，就忽略解析错误
    }

    if (!response.ok || data?.error) {
      const errMsg =
        data?.error ||
        `API 请求失败，状态码: ${response.status}. 响应: ${textBody}`;
      console.error("applyDiff API Error:", errMsg);
      throw new Error(errMsg);
    }

    const rawData = JSON.stringify(
      {
        request: { filePath, diff },
        response: data,
      },
      null,
      2
    );

    const displayData = `✅ 已成功将补丁应用到文件: \`${filePath}\`

**补丁预览 (可能已截断)：**

\`\`\`diff
${truncateText(diff)}
\`\`\`
`;

    return { rawData, displayData };
  } catch (error: any) {
    console.error(`执行 applyDiff 时发生错误:`, error);
    throw new Error(
      `应用补丁到文件 (${filePath}) 失败：${error?.message || String(error)}`
    );
  }
}
