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

export interface ApiMethod<P = unknown, R = unknown> {
  handler: (params: P) => Promise<R>;
  auth?: boolean;
  rateLimit?: number; // 可选的速率限制
}

// 添加参数类型约束
export interface ApiContext {
  token?: string;
  userId?: string;
}
