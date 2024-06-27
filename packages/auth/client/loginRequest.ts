import { API_VERSION } from "database/config";

export const loginRequest = async (currentServer: string, data) => {
  const res = await fetch(`${currentServer}${API_VERSION}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (res.status === 200) {
    const result = await res.json();
    return result;
  } else {
    const errorData = await res.json(); // 尝试获取错误消息
    throw { status: res.status, message: errorData.message || "Unknown error" };
  }
};
