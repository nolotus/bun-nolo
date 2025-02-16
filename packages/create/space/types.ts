// create/space/types.ts

// 基础枚举保持不变
export enum SpaceVisibility {
  PRIVATE = "private",
  PUBLIC = "public",
}

export enum ContentType {
  DIALOG = "dialog",
  PAGE = "page",
}

export enum MemberRole {
  OWNER = "owner",
  ADMIN = "admin",
  MEMBER = "member",
  GUEST = "guest",
}

// 分类相关保持不变
export interface Category {
  name: string;
  order: number;
}

export interface Categories {
  [categoryId: string]: Category;
}

// 更新内容相关接口
export interface SpaceContent {
  title: string;
  type: ContentType;
  contentKey: string;
  categoryId: string;
  pinned: boolean;
  createdAt: number; // 改为createdAt
  updatedAt: number; // 新增updatedAt
  order?: number;
}

export interface Contents {
  [contentKey: string]: SpaceContent;
}

// 成员相关
export interface SpaceMember {
  role: MemberRole;
  joinedAt: number; // 保持joinedAt，因为表示加入行为的时间点
  updatedAt?: number; // 可选添加，用于追踪角色变更等
}

// 带space基本信息的member类型
export interface SpaceMemberWithSpaceInfo extends SpaceMember {
  spaceId: string;
  spaceName: string;
  ownerId: string;
  visibility: SpaceVisibility;
  type?: DataType; // 可选添加，用于类型识别
}

// 主数据结构
export interface SpaceData {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  visibility: SpaceVisibility;
  members: string[];
  categories: Categories;
  contents: Contents;
  createdAt: number; // 已经是正确的命名
  updatedAt: number; // 已经是正确的命名
}

// API请求/响应类型
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
  contentKey: string;
  categoryId?: string;
  pinned?: boolean;
  order?: number; // 可选添加order
}

export interface UpdateContentRequest {
  title?: string;
  categoryId?: string;
  pinned?: boolean;
  order?: number;
}

// 辅助类型
export type SpaceId = string;
export type CategoryId = string;
export type ContentId = string;
