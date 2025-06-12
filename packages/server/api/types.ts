// server/api/types.ts
export type ErrorCode =
  | "not_found"
  | "invalid_input"
  | "unauthorized"
  | "internal";

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: unknown; // 添加可选的错误详情
}

// 添加参数类型约束
export interface ApiContext {
  token?: string;
  userId?: string;
}
