// auth/routes.ts
import { API_VERSION } from "database/config";

export interface RouteParams {
  userId?: string;
}

export const authRoutes = {
  login: {
    path: `${API_VERSION}/users/login`,
    method: "POST" as const,
    createPath: () => `${API_VERSION}/users/login`,
  },
  signup: {
    path: `${API_VERSION}/users/signup`,
    method: "POST" as const,
    createPath: () => `${API_VERSION}/users/signup`,
  },
  users: {
    list: {
      path: `${API_VERSION}/users`,
      method: "GET" as const,
      createPath: () => `${API_VERSION}/users`,
    },
    detail: {
      path: `${API_VERSION}/users/:userId`,
      method: "GET" as const,
      createPath: (params: RouteParams) =>
        `${API_VERSION}/users/${params.userId}`,
    },
    transfer: {
      path: `${API_VERSION}/users/:userId/transfer`,
      method: "POST" as const,
      createPath: (params: RouteParams) =>
        `${API_VERSION}/users/${params.userId}/transfer`,
    },
    delete: {
      path: `${API_VERSION}/users/:userId`,
      method: "DELETE" as const,
      createPath: (params: RouteParams) =>
        `${API_VERSION}/users/${params.userId}`,
    },
    disable: {
      path: `${API_VERSION}/users/:userId/disable`,
      method: "POST" as const,
      createPath: (params: RouteParams) =>
        `${API_VERSION}/users/${params.userId}/disable`,
    },
    enable: {
      path: `${API_VERSION}/users/:userId/enable`,
      method: "POST" as const,
      createPath: (params: RouteParams) =>
        `${API_VERSION}/users/${params.userId}/enable`,
    },
  },
} as const;

// 简单的路径匹配器，只处理基本的参数提取
export function createPathMatcher(routePath: string) {
  return new RegExp(`^${routePath.replace(/:(\w+)/g, "([^/]+)")}$`);
}
