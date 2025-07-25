import { DataType } from "create/types";

export type ULID = string;

export interface DialogConfig {
  id: string; // 对话的唯一标识符/路径
  type: DataType.DIALOG; // 数据类型标记
  title: string; // 对话标题
  cybots: string[]; // 参与对话的 Cybot ID 列表
  mode: string; // 调用模式 (原 invocationMode)
  orchPrompt?: string; // 编排提示词 (原 orchestratorPrompt), 仅在 ORCHESTRATED 模式下使用 (可选)
  createdAt: string; // 创建时间戳
  updatedAt: string; // 最后更新时间戳
}
export type ReferenceItem = {
  dbKey: string;
  title: string;
  type: "knowledge" | "instruction";
};
export interface Agent {
  // --- 你已有的所有字段 ---
  provider: string;
  model: string;
  prompt?: string;
  name?: string;
  [key: string]: any; // 保留以兼容未知属性
  tools?: string[];
  userId: string;
  useServerProxy: boolean;
  apiKey?: string;
  customProviderUrl?: string;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  max_tokens?: number;
  reasoning_effort?: string;
  updatedAt: string; // 注意：在最终方案中这个字段类型会变为 number
  createdAt: number; // 注意：在最终方案中这个字段类型会变为 number
  categoryId?: string;
  spaceId?: string;
  references?: ReferenceItem[];
  tags?: string[];
  tokenCount?: number;
  messageCount?: number;
  dialogCount?: number;
  outputPrice?: number;
  inputPrice?: number;
  introduction?: string;
  greeting?: string;
  isPublic: boolean; // 保留这个字段
  endpointKey?: string;

  /**
   * [战术热修新增] 白名单用户ID列表。
   * 这是一个可选的字符串数组。
   */
  whitelist?: string[];
}

// --- 内容相关 (核心修改处) ---

export interface SpaceContent {
  title: string;
  type: ContentType;
  contentKey: string; // 唯一标识符 (通常是 dbKey)

  // --- 修改: categoryId 变为可选 ---
  categoryId?: string; // 属性不存在或值为 undefined 代表未分类

  pinned: boolean;
  createdAt: number; // 时间戳 (number)
  updatedAt: number; // 时间戳 (number)
  order?: number; // 分类内排序
  tags?: string[]; // 保留 tags 字段
} // --- 主数据结构 (SpaceData 保持不变) ---

export interface SpaceData {
  id: ULID;
  name: string;
  description: string;
  ownerId: string;
  visibility: SpaceVisibility;
  members: string[]; // userId 列表
  categories: Categories;
  contents: Contents;
  createdAt: number;
  updatedAt: number;
}
export enum ContentType {
  DIALOG = "dialog",
  PAGE = "page",
} // --- 枚举 (保持不变) ---
export enum SpaceVisibility {
  PRIVATE = "private",
  PUBLIC = "public",
}
export enum MemberRole {
  OWNER = "owner",
  ADMIN = "admin",
  MEMBER = "member",
  GUEST = "guest",
}
export type Categories = Record<string, Category | null>; // --- 分类相关 (Category, Categories 保持不变) ---
export interface Category {
  name: string;
  order: number;
  updatedAt: number;
} // --- 成员相关 (SpaceMember, SpaceMemberWithSpaceInfo 保持不变) ---

export interface SpaceMember {
  role: MemberRole;
  joinedAt: number;
  updatedAt?: number;
  userId: string;
  spaceId: string;
} // Contents 类型保持不变 (Record<string, SpaceContent | null>)
export type Contents = Record<string, SpaceContent | null>;
export interface SpaceMemberWithSpaceInfo {
  role: MemberRole;
  joinedAt: number;
  memberUpdatedAt?: number;
  spaceId: string;
  spaceName: string;
  ownerId: string;
  visibility: SpaceVisibility;
  spaceCreatedAt: number;
  spaceUpdatedAt: number;
  type?: DataType;
}

// --- 新增: 空间设置类型 ---
export interface SpaceSetting {
  /** 数据库中用于识别此对象类型的主键 */
  type: DataType.SETTING;
  /** 此设置所属的用户ID */
  userId: ULID;
  /** 此设置应用的空间ID */
  spaceId: ULID;
  /**
   * 存储分类的折叠状态
   * @key categoryId
   * @value boolean (true: collapsed, false: expanded)
   */
  collapsedCategories?: Record<string, boolean>;
  /** 创建时间的ISO字符串 */
  createdAt: string;
  /** 最后更新时间的ISO字符串 */
  updatedAt: string;
}

type MessageContentPartText = { type: "text"; text: string };
type MessageContentPartImageUrl = {
  type: "image_url";
  image_url: { url: string; detail?: "low" | "high" | "auto" };
};

type MessageContentPart = MessageContentPartText | MessageContentPartImageUrl;

export interface Message {
  id?: string;
  role: "user" | "assistant" | "system" | "tool" | "developer";
  content: string | MessageContentPart[];
  name?: string;
  tool_calls?: any;
  tool_call_id?: string;
  userId?: string;
}
