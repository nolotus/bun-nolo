// packages/database/config.ts

// 这个文件现在是前后端通用的，不包含任何后端模块如 'fs' 或 'path'。
export const API_VERSION = "/api/v1";

export const API_ENDPOINTS = {
  DATABASE: `${API_VERSION}/db`,
  USERS: `${API_VERSION}/users`,
  WEATHER: `${API_VERSION}/weather`,
  HI: `${API_VERSION}/hi`,
  CHAT: `${API_VERSION}/chat`,
  EXECUTE_SQL: `${API_VERSION}/sqlite/execute_sql`,
  // --- 新增端点 ---
  TRANSACTIONS: `${API_VERSION}/transactions`,
};
