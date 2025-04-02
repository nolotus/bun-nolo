// 文件路径: create/space/types.ts (或你的实际路径)

import { DataType } from "../types"; // 确认导入

// --- 枚举 (保持不变) ---
export enum SpaceVisibility {
  PRIVATE = "private",
  PUBLIC = "public",
}

export enum ContentType {
  DIALOG = "dialog",
  PAGE = "page",
  // ... 其他类型
}

export enum MemberRole {
  OWNER = "owner",
  ADMIN = "admin",
  MEMBER = "member",
  GUEST = "guest",
}

// --- 分类相关 (Category, Categories 保持不变) ---
export interface Category {
  name: string;
  order: number;
  updatedAt: number;
  // createdAt?: number;
}
export type Categories = Record<string, Category | null>;

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
  // 可能还有其他元数据...
}
// Contents 类型保持不变 (Record<string, SpaceContent | null>)
export type Contents = Record<string, SpaceContent | null>;

// --- 成员相关 (SpaceMember, SpaceMemberWithSpaceInfo 保持不变) ---
export interface SpaceMember {
  role: MemberRole;
  joinedAt: number;
  updatedAt?: number;
  userId: string;
  spaceId: string;
}
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

// --- 主数据结构 (SpaceData 保持不变) ---
export interface SpaceData {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  visibility: SpaceVisibility;
  members: string[]; // userId 列表
  categories: Categories;
  contents: Contents;
  createdAt: number;
  updatedAt: number;
  // type?: DataType;
}

// --- API 请求/响应相关类型 (根据需要调整，AddContentRequest 中 categoryId 依然是可选 string) ---
export interface CreateSpaceRequest {
  /* ... */
}
export interface UpdateSpaceRequest {
  /* ... */
}
export interface AddContentRequest {
  title: string;
  type: ContentType;
  contentKey: string;
  categoryId?: string; // 发送给 API 时仍然是可选 string
  pinned?: boolean;
  order?: number;
}
// ... 其他 API 类型

// --- 辅助类型别名 (保持不变) ---
export type SpaceId = string;
export type CategoryId = string; // 仍然代表有效的分类ID (字符串)
export type ContentId = string;
