// database/tools/createTableTool.ts

import { ulid } from "ulid";
import { metaKey } from "database/keys";
import { write } from "database/dbSlice";
import type { AppDispatch } from "app/store";

/**
 * createTable 工具定义
 */
export const createTableTool = {
  name: "createTable",
  description:
    "为指定租户注册一张新表：写入 meta 信息（包含表名、列定义、索引定义和创建时间）",
  parameters: {
    type: "object",
    properties: {
      tenantId: {
        type: "string",
        description: "租户 ID",
      },
      tableName: {
        type: "string",
        description: "表展示名称",
      },
      columns: {
        type: "array",
        description: "列定义数组，每项 { name: 列名, type: 数据类型 }",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            type: { type: "string" },
          },
          required: ["name", "type"],
        },
      },
      indexDefs: {
        type: "array",
        description: "索引定义数组，每项 { name: 索引名, fields: 字段名数组 }",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            fields: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["name", "fields"],
        },
      },
    },
    required: ["tenantId", "tableName", "columns"],
  },
};

/**
 * 执行 createTable 操作
 * 自动生成唯一 tableId，无需传入
 *
 * @param args
 *   tenantId   租户 ID
 *   tableName  表展示名称
 *   columns    列定义数组
 *   indexDefs  索引定义数组，可选
 * @param thunkApi.dispatch Redux dispatch
 * @returns { tableId: string }
 */
export async function createTableFunc(
  args: {
    tenantId: string;
    tableName: string;
    columns: { name: string; type: string }[];
    indexDefs?: { name: string; fields: string[] }[];
  },
  { dispatch }: { dispatch: AppDispatch }
): Promise<{ tableId: string }> {
  const { tenantId, tableName, columns, indexDefs = [] } = args;

  // 生成全局唯一的表 ID
  const tableId = ulid();
  // 根据租户和表 ID 生成存储 key
  const key = metaKey(tenantId, tableId);

  // 组装 meta 信息
  const meta = {
    name: tableName,
    columns,
    indexDefs, // 索引定义
    createdAt: Date.now(),
  };

  // 写入数据库（Redux store），customKey 为 metaKey
  await dispatch(write({ data: meta, customKey: key })).unwrap();

  return { tableId };
}
