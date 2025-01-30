// ai/cybot/types.ts

export interface Cybot {
  id: string;
  userId: string;
  name: string;
  provider: string;
  customProviderUrl?: string;
  model: string;
  apiKey?: string;
  useServerProxy: boolean;
  prompt?: string;
  tools?: string[];
  isPublic: boolean;
  greeting?: string;
  introduction?: string;
  inputPrice?: number; // 替换 pricing.input
  outputPrice?: number; // 替换 pricing.output
  dialogCount?: number; // 替换 metrics.useCount
  messageCount?: number; // 替换 metrics.messageCount
  tokenCount?: number; // 新增
  tags?: string[]; // 新增
  spaceId?: string;
  categoryId?: string;
  createdAt: number; // 替换 createTime
  updatedAt: string; // 替换 updateTime，使用 ISO 字符串
}

// 如果需要请求参数的类型
export interface FetchPubCybotsParams {
  limit?: number;
  sortBy?: "newest" | "popular" | "rating";
}

// 如果需要响应的类型
export interface FetchPubCybotsResponse {
  data: Cybot[];
  total: number;
  hasMore: boolean;
}
