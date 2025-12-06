// 文件路径: ai/chat/fetchUtils.ts
import { Agent } from "app/types";

import { API_ENDPOINTS } from "database/config";

interface BodyData {
  model: string;
  messages: any[];
  stream: boolean;
  tools?: any[];
}

interface FetchParams {
  cybotConfig: Agent;
  api: string;
  bodyData: BodyData;
  currentServer: string;
  token: string;
  signal?: AbortSignal; // signal 是可选的
}

const fetchDirectly = async ({
  api,
  cybotConfig,
  bodyData,
  signal,
}: Omit<FetchParams, "currentServer" | "token">): Promise<Response> => {
  try {
    return await fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cybotConfig.apiKey}`,
      },
      body: JSON.stringify(bodyData),
      signal, // 可选参数，直接传递
    });
  } catch (error: any) {
    console.error("[fetchDirectly] 网络请求失败:", error);
    throw error; // 抛出错误，交给上层处理
  }
};

const fetchWithServerProxy = async ({
  currentServer,
  api,
  bodyData,
  cybotConfig,
  token,
  signal,
}: FetchParams): Promise<Response> => {
  try {
    let response = await fetch(`${currentServer}${API_ENDPOINTS.CHAT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // 使用 Authorization 头传递 token
      },
      body: JSON.stringify({
        ...bodyData,
        url: api,
        provider: bodyData.provider || cybotConfig.provider,
        KEY: cybotConfig.apiKey, // 在请求体中传递 apiKey
      }),
      signal, // 可选参数，直接传递
    });

    // 如果状态码是503，重试一次
    if (response.status === 503) {
      console.warn("[fetchWithServerProxy] 检测到503状态，重试一次...");
      response = await fetch(`${currentServer}${API_ENDPOINTS.CHAT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...bodyData,
          url: api,
          provider: cybotConfig.provider,
          KEY: cybotConfig.apiKey,
        }),
        signal,
      });
    }

    return response;
  } catch (error: any) {
    console.error("[fetchWithServerProxy] 网络请求失败:", error);
    throw error; // 抛出错误，交给上层处理
  }
};
export const performFetchRequest = async (
  params: FetchParams
): Promise<Response> => {
  try {
    return params.cybotConfig.useServerProxy
      ? await fetchWithServerProxy(params)
      : await fetchDirectly(params);
  } catch (error: any) {
    console.error("[performFetchRequest] 请求过程中发生错误:", error);
    // 如果是网络错误，抛出自定义错误对象，以便上层捕获
    throw new Error(`网络请求失败: ${error.message || String(error)}`);
  }
};
