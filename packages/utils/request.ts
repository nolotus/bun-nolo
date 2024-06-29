import { noloReadRequest } from "database/client/readRequest";

async function makeRequest(server: string, id: string, token: string) {
  try {
    const res = await noloReadRequest(server, id, token);
    if (res.status === 200) {
      const result = await res.json();
      const withSourceResult = { ...result, source: [server] };

      return withSourceResult;
    } else {
      throw new Error(`Request failed with status ${res.status}`);
    }
  } catch (error) {
    throw error; // 继续抛出错误
  }
}

export async function requestServers(
  servers: string[],
  id: string,
  token: string,
) {
  const requests = servers.map((server) =>
    makeRequest(server, id, token).catch((error) => error),
  );

  const results = await Promise.all(requests); // 等待所有请求完成
  const validResults = results.filter((result) => !(result instanceof Error)); // 过滤出成功的响应

  if (validResults.length > 0) {
    const result = validResults[0];
    return result;
  } else {
    throw new Error("All servers failed to respond with a valid result.");
  }
}
