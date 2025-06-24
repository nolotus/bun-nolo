// ai/cybot/types.ts

import { BotConfig } from "app/types";

// 参考资料项类型

// 参考资料项结构

// 如果需要请求参数的类型
export interface FetchPubCybotsParams {
  limit?: number;
  sortBy?: "newest" | "popular" | "rating";
}

// 如果需要响应的类型
export interface FetchPubCybotsResponse {
  data: BotConfig[];
  total: number;
  hasMore: boolean;
}
