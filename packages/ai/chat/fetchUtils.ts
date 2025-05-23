// fetchUtils.ts
import { API_ENDPOINTS } from "database/config";

interface CybotConfig {
  apiKey: string;
  model: string;
  provider: string;
  useServerProxy: boolean;
  tools?: any[];
  id: string;
}

interface BodyData {
  model: string;
  messages: any[];
  stream: boolean;
  tools?: any[];
}

const createRequestConfig = (
  cybotConfig: CybotConfig,
  bodyData: BodyData,
  signal?: AbortSignal
): RequestInit => ({
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${cybotConfig.apiKey}`,
  },
  body: JSON.stringify(bodyData),
  signal,
});

const fetchWithServerProxy = async (
  currentServer: string,
  api: string,
  bodyData: BodyData,
  cybotConfig: CybotConfig,
  signal?: AbortSignal
) => {
  return await fetch(`${currentServer}${API_ENDPOINTS.CHAT}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...bodyData,
      url: api,
      KEY: cybotConfig.apiKey,
      provider: cybotConfig.provider,
    }),
    signal,
  });
};

export const performFetchRequest = async (
  cybotConfig: CybotConfig,
  api: string,
  bodyData: BodyData,
  currentServer: string,
  signal?: AbortSignal
): Promise<Response> => {
  if (!cybotConfig.useServerProxy) {
    return await fetch(api, createRequestConfig(cybotConfig, bodyData, signal));
  }
  return await fetchWithServerProxy(
    currentServer,
    api,
    bodyData,
    cybotConfig,
    signal
  );
};
