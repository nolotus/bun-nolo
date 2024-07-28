import React from "react";
import { useAppDispatch } from "app/hooks";
import { extractCustomId } from "core";
import { DataType } from "create/types";
import { deleteData } from "database/dbSlice";
import { Link } from "react-router-dom";
import { TrashIcon, RepoPullIcon } from "@primer/octicons-react";

type FieldConfig = {
  header: string;
  key: string;
  render?: (value: any, data: any) => React.ReactNode;
};

type RenderConfig = {
  fields: FieldConfig[];
  actions?: (data: any) => React.ReactNode;
};

const renderConfigs: Record<DataType, RenderConfig> = {
  [DataType.ChatRobot]: {
    fields: [
      { header: "AI名字", key: "name" },
      { header: "AI所用模型", key: "model" },
      { header: "AI 定制描述", key: "description" },
      { header: "AI 知识", key: "knowledge" },
      { header: "数据源", key: "source" },
    ],
  },
  [DataType.Cybot]: {
    fields: [
      { header: "AI名字", key: "name" },
      { header: "AI所用模型", key: "model" },
      { header: "AI 定制描述", key: "description" },
      { header: "AI 知识", key: "knowledge" },
      { header: "数据源", key: "source" },
    ],
  },
  [DataType.Page]: {
    fields: [
      {
        header: "链接",
        key: "id",
        render: (value) => (
          <Link to={`/${value}`}>{extractCustomId(value)}</Link>
        ),
      },
      { header: "标题", key: "title" },
      { header: "数据源", key: "source" },
    ],
  },
  [DataType.SurfSpot]: {
    fields: [
      {
        header: "Id",
        key: "id",
        render: (value) => (
          <Link to={`/${value}`}>{extractCustomId(value)}</Link>
        ),
      },
      { header: "浪点名字", key: "title" },
      { header: "数据源", key: "source" },
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
      { header: "数据源", key: "source" },
    ],
    actions: (data) => (
      <Link to={`/${data.id}`}>
        <button className="rounded p-2">查看</button>
      </Link>
    ),
  },
};

const defaultConfig: RenderConfig = {
  fields: [
    { header: "Id", key: "id" },
    { header: "数据类型", key: "type" },
    { header: "数据源", key: "source" },
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

  const config = type ? renderConfigs[type] : defaultConfig;

  const renderCell = (data: any, field: FieldConfig) => {
    if (field.render) {
      return field.render(data[field.key], data);
    }
    return data[field.key];
  };

  const renderActions = (data: any) => (
    <>
      <button
        onClick={() =>
          dispatch(deleteData({ id: data.id, source: data.source }))
        }
      >
        <TrashIcon size={16} />
        删除
      </button>
      <button
        type="button"
        onClick={() => pullData(data.id, data)}
        className="rounded p-2"
      >
        <RepoPullIcon size={16} />
        拉取
      </button>
      {config.actions && config.actions(data)}
    </>
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto">
        <thead>
          <tr>
            {config.fields.map((field) => (
              <th key={field.key} className="px-4 py-2 text-left">
                {field.header}
              </th>
            ))}
            <th className="px-4 py-2 text-left">操作</th>
          </tr>
        </thead>
        <tbody>
          {dataList.map((data) => (
            <tr key={data.id}>
              {config.fields.map((field) => (
                <td key={field.key} className="border px-4 py-2">
                  {renderCell(data, field)}
                </td>
              ))}
              <td className="border px-4 py-2">{renderActions(data)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
