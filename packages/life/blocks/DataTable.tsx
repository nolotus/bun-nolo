import React from "react";
import { useAppDispatch } from "app/hooks";
import { extractCustomId } from "core";
import { DataType } from "create/types";
import { deleteData } from "database/dbSlice";
import { Link } from "react-router-dom";
import { TrashIcon, RepoPullIcon } from "@primer/octicons-react";
import Button from "web/ui/Button";

type FieldConfig = {
  header: string;
  key: string;
  render?: (value: any, data: any) => React.ReactNode;
};

type RenderConfig = {
  fields: FieldConfig[];
  actions?: (data: any) => React.ReactNode;
};

const renderConfigs: Record<string, RenderConfig> = {
  [DataType.Page]: {
    fields: [
      {
        header: "链接",
        key: "id",
        render: (value) => (
          <Link
            to={`/${value}`}
            style={{ textDecoration: "none", color: "blue" }}
          >
            {extractCustomId(value)}
          </Link>
        ),
      },
      { header: "标题", key: "title" },
    ],
  },
  [DataType.SurfSpot]: {
    fields: [
      {
        header: "Id",
        key: "id",
        render: (value) => (
          <Link
            to={`/${value}`}
            style={{ textDecoration: "none", color: "blue" }}
          >
            {extractCustomId(value)}
          </Link>
        ),
      },
      { header: "浪点名字", key: "title" },
    ],
  },
  [DataType.Prompt]: {
    fields: [
      { header: "名称", key: "name" },
      {
        header: "内容",
        key: "content",
        render: (value) => value.substring(0, 50) + "...",
      },
      { header: "分类", key: "category" },
      { header: "标签", key: "tags", render: (value) => value.join(", ") },
    ],
    actions: (data) => (
      <Link
        to={`/${data.id}`}
        style={{ textDecoration: "none", color: "blue" }}
      >
        <button style={{ borderRadius: "4px", padding: "4px" }}>查看</button>
      </Link>
    ),
  },

  [DataType.TokenStats]: {
    fields: [
      { header: "消息类型", key: "messageType" },
      { header: "模型", key: "model" },
      { header: "Token 数量", key: "tokenCount" },
      { header: "用户 ID", key: "userId" },
      { header: "用户名", key: "username" },
      {
        header: "日期",
        key: "date",
        render: (value) => new Date(value).toLocaleString(),
      },
    ],
    actions: (data) => (
      <Link
        to={`/token-stats/${data.id}`}
        style={{ textDecoration: "none", color: "blue" }}
      >
        <button style={{ borderRadius: "4px", padding: "4px" }}>详情</button>
      </Link>
    ),
  },
  [DataType.CalendarEvent]: {
    fields: [
      {
        header: "事件标题",
        key: "summary",
      },
      {
        header: "事件描述",
        key: "description",
      },
      {
        header: "开始时间",
        key: "start",
        render: (value) => {
          if (!value?.dateTime) return "-";
          return new Date(value.dateTime).toLocaleString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
        },
      },
      {
        header: "结束时间",
        key: "end",
        render: (value) => {
          if (!value?.dateTime) return "-";
          return new Date(value.dateTime).toLocaleString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
        },
      },
    ],
    actions: (data) => (
      <Link
        to={`/calendar/${data.id}`}
        style={{ textDecoration: "none", color: "blue" }}
      >
        <button style={{ borderRadius: "4px", padding: "4px" }}>
          查看详情
        </button>
      </Link>
    ),
  },
};

const defaultConfig: RenderConfig = {
  fields: [
    { header: "Id", key: "id" },
    { header: "数据类型", key: "type" },
  ],
};

interface DataTableProps {
  dataList: any[];
  type?: DataType;
  pullData: (id: string, data: any) => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  dataList,
  type,
  pullData,
}) => {
  const dispatch = useAppDispatch();
  const config =
    type && type in renderConfigs ? renderConfigs[type] : defaultConfig;

  const renderCell = (data: any, field: FieldConfig) => {
    if (field.render) {
      return field.render(data[field.key], data);
    }
    return data[field.key];
  };

  const renderActions = (data: any) => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <Button
        variant="secondary"
        status="error"
        size="small"
        onClick={() => dispatch(deleteData({ id: data.id }))}
        icon={<TrashIcon size={14} />}
      >
        删除
      </Button>

      <Button
        variant="secondary"
        size="small"
        onClick={() => pullData(data.id, data)}
        icon={<RepoPullIcon size={14} />}
      >
        拉取
      </Button>

      {config.actions && config.actions(data)}
    </div>
  );

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ minWidth: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {config.fields.map((field) => (
              <th
                key={field.key}
                style={{
                  padding: "8px",
                  textAlign: "left",
                  borderBottom: "1px solid #ddd",
                }}
              >
                {field.header}
              </th>
            ))}
            <th
              style={{
                padding: "8px",
                textAlign: "left",
                borderBottom: "1px solid #ddd",
              }}
            >
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          {dataList.map((data) => (
            <tr key={data.id}>
              {config.fields.map((field) => (
                <td
                  key={field.key}
                  style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                >
                  {renderCell(data, field)}
                </td>
              ))}
              <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                {renderActions(data)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
