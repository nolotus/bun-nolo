import { API_VERSION } from "database/config";

export const loginRequest = async (currentServer: string, data) => {
  const url = `${currentServer}${API_VERSION}/users/login`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res;
};
