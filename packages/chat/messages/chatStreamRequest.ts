import { API_ENDPOINTS } from "database/config";

const chatUrl = `${API_ENDPOINTS.AI}/chat`;

interface ChatStreamRequestParams {
  currentServer: string;
  requestBody: Record<string, any>;
  abortControllerRef: React.RefObject<AbortController>;
  token: string;
}

export const chatStreamRequest = async ({
  currentServer,
  requestBody,
  abortControllerRef,
  token,
}: ChatStreamRequestParams): Promise<Response> => {
  const url = `${currentServer}${chatUrl}`;

  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(requestBody),
    signal: abortControllerRef.current?.signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
};
