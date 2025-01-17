// auth/api.ts
import { authRoutes } from "auth/routes";

export interface LoginData {
  username: string;
  password: string;
}

export const loginRequest = async (currentServer: string, data: LoginData) => {
  const path = authRoutes.login.createPath();

  return fetch(`${currentServer}${path}`, {
    method: authRoutes.login.method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};
