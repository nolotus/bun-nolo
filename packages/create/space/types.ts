// create/space/types.ts (更新后)

import { DataType } from "../types"; // 确认这个导入路径和类型是存在的

// --- 枚举 (保持不变) ---
export enum SpaceVisibility {
  PRIVATE = "private",
  PUBLIC = "public",
}

export enum ContentType {
  DIALOG = "dialog",
  PAGE = "page",
  // 可能还有其他类型...
}

export enum MemberRole {
  OWNER = "owner",
  ADMIN = "admin",
  MEMBER = "member",
  GUEST = "guest", // 如果支持访客角色
}

// --- 分类相关 ---
export interface Category {
  name: string;
  order: number;
  // **新增**: 添加 updatedAt 以追踪分类自身的修改时间
  updatedAt: number;
  // createdAt?: number; // 可选：如果需要追踪分类创建时间
}

// **修改**: 使用 Record 类型，并明确值可以是 Category 或 null (表示待删除)
export type Categories = Record<string, Category | null>;
// 或者保持 interface 语法:
// export interface Categories {
//   [categoryId: string]: Category | null;
// }

// --- 内容相关 ---
export interface SpaceContent {
  title: string;
  type: ContentType;
  contentKey: string; // 唯一标识符
  categoryId: string; // 空字符串 "" 表示未分类
  pinned: boolean;
  createdAt: number; // 创建时间戳 (number, e.g., Date.now())
  updatedAt: number; // 最后更新时间戳 (number, e.g., Date.now())
  order?: number; // 分类内排序，可选
  // 根据需要可以添加其他元数据，如 creatorId, lastEditorId 等
}

// **修改**: 使用 Record 类型，并明确值可以是 SpaceContent 或 null (表示待删除)
export type Contents = Record<string, SpaceContent | null>;
// 或者保持 interface 语法:
// export interface Contents {
//   [contentKey: string]: SpaceContent | null;
// }

// --- 成员相关 ---
// (这个结构通常存储在单独的 dbKey 下，例如 'member-{userId}-{spaceId}')
export interface SpaceMember {
  role: MemberRole;
  joinedAt: number; // 加入时间戳
  updatedAt?: number; // 可选：角色或其他成员信息更新时间
  userId: string; // 明确包含 userId
  spaceId: string; // 明确包含 spaceId
}

// (这个类型用于获取用户的所有空间成员资格，聚合了 Space 和 Member 信息)
export interface SpaceMemberWithSpaceInfo {
  // Member 信息
  role: MemberRole;
  joinedAt: number;
  memberUpdatedAt?: number; // 重命名以区分 space 的 updatedAt
  // Space 基本信息
  spaceId: string;
  spaceName: string;
  ownerId: string;
  visibility: SpaceVisibility;
  spaceCreatedAt: number; // 添加 space 创建时间
  spaceUpdatedAt: number; // 添加 space 更新时间
  // 可选的类型标识
  type?: DataType; // 例如 'spaceMembershipInfo'
}

// --- 主数据结构 (存储在 'space-{spaceId}' 下) ---
export interface SpaceData {
  id: string; // Space 的唯一 ID (短 ID)
  name: string;
  description: string;
  ownerId: string; // 创建者/所有者的 userId
  visibility: SpaceVisibility;
  members: string[]; // 成员 userId 列表 (简单引用，详细信息在 SpaceMember 对象中)
  // **修改**: 使用更新后的 Categories 和 Contents 类型
  categories: Categories;
  contents: Contents;
  createdAt: number; // Space 创建时间戳
  updatedAt: number; // Space 最后更新时间戳 (任何内部变化都应更新此时间戳)
  // type?: DataType; // 可选：标识这是 'space' 类型的数据
}

// --- API 请求/响应相关类型 ---
// (保持不变，或根据需要调整)
export interface CreateSpaceRequest {
  name: string;
  description?: string;
  visibility?: SpaceVisibility;
}

export interface UpdateSpaceRequest {
  name?: string;
  description?: string;
  visibility?: SpaceVisibility;
}

export interface AddContentRequest {
  title: string;
  type: ContentType;
  contentKey: string; // 前端通常会生成这个 Key
  categoryId?: string; // 可选，默认为未分类 ("")
  pinned?: boolean;
  order?: number; // 可选
}

// 注意：UpdateContentRequest 可能不需要了，因为更新通常通过 patch 实现
// 如果需要单独的 Update API，可以保留或调整
export interface UpdateContentRequest {
  title?: string;
  categoryId?: string;
  pinned?: boolean;
  order?: number;
}

// --- 辅助类型别名 (保持不变) ---
export type SpaceId = string;
export type CategoryId = string;
export type ContentId = string; // 通常等同于 contentKey
