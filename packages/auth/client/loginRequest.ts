import { API_VERSION } from "database/config";

export const loginRequest = async (currentServer: string, data) => {
  const res = await fetch(`${currentServer}${API_VERSION}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res;
};
