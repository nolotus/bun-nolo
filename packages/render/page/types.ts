import { DataType } from "create/types"; // 确认路径

export interface PageData {
  id: string; // 通常与 pageKey 中的 id 部分相同
  dbKey: string; // pageKey (例如 'page-userid-ulid')
  type: DataType.PAGE;
  title: string;
  content?: string | null; // 原始内容，可能未使用
  slateData?: any | null; // Slate 编辑器数据
  spaceId: string | null; // 页面所属的 spaceId, null 表示不在任何空间
  tags?: string[]; // 页面的标签
  created: string; // ISO 格式创建时间
  updated_at?: string; // ISO 格式更新时间 (可选)
}
