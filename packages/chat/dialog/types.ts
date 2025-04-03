import { DataType } from "create/types";

export interface DialogConfig {
  id: string; // 对话的唯一标识符/路径
  type: DataType; // 数据类型，固定为 DataType.DIALOG
  title: string; // 对话标题
  cybots: string[]; // 参与对话的 Cybot ID 列表
  // ... 可能还有其他字段，例如创建时间戳、用户ID（虽然id已包含）、状态等，
  //     但它们没有在这个 data 对象中显式定义。
}
