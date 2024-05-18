import { retrieveFirstToken } from "auth/client/token";
export const isIPv4 = (address: string): boolean => {
  const ipv4Regex =
    /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.((25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.){2}(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/;
  return ipv4Regex.test(address);
};
const getProtocolAndPrefix = (domainWithPort: string) => {
  let protocol = "https"; // 默认协议
  const [domainPrefix, port = ""] = domainWithPort.split(":"); // 提取域名和端口

  // 检查是否是 IP 地址或特定的本地域名
  if (
    isIPv4(domainPrefix) ||
    domainPrefix === "nolotus.local" ||
    domainPrefix === "localhost"
  ) {
    protocol = "http";
  }

  return { protocol, domainPrefix, port };
};

export const buildURL = (domain: string, endpoint: string) => {
  const { protocol, domainPrefix, port } = getProtocolAndPrefix(domain);

  const domainWithPort = port ? `${domainPrefix}:${port}` : domainPrefix;

  return `${protocol}://${domainWithPort}${endpoint}`;
};

export const fetchWithToken = async (
  url,
  options = {},
  returnRawResponse = false,
) => {
  try {
    const token = retrieveFirstToken();
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    const requestOptions = {
      ...options,
      headers,
    };

    const response = await fetch(url, requestOptions);

    if (returnRawResponse) {
      return response;
    }

    return response.json();
  } catch (error) {
    console.error("fetchWithToken 错误:", error);
    throw error;
  }
};
