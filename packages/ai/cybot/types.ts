// ai/cybot/types.ts

// 参考资料项类型
export enum ReferenceItemType {
  PAGE = "page",
  SPACE = "space",
  // 以下为将来扩展预留
  // URL = 'url',
  // FILE = 'file',
}

// 参考资料项结构
export interface ReferenceItem {
  type: ReferenceItemType;
  dbKey: string;
  title: string;
}

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
  inputPrice?: number;
  outputPrice?: number;
  dialogCount?: number;
  messageCount?: number;
  tokenCount?: number;
  tags?: string[];
  references?: ReferenceItem[];
  spaceId?: string;
  categoryId?: string;
  createdAt: number;
  updatedAt: string;
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
