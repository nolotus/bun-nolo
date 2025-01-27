// create/types.ts
export enum DataType {
  CYBOT = "cybot",
  PAGE = "page",
  DIALOG = "dialog",
  MSG = "msg",
  TOKEN = "token",
  Space = "space",

  // Prompt = "prompt",
  // Category = "category",
  // CalendarEvent = "calendar_event",
}
interface Space {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isDefault?: boolean; // 是否为默认空间
  createTime: number;
  updateTime: number;
}

interface Category {
  id: string;
  spaceId: string;
  name: string;
  order: number;
  createTime: number;
}
