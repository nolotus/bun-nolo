import React, { useState } from "react";
import { Table, TableRow, TableCell } from "render/elements/Table";
import {
  mistralModels,
  openaiModels,
  googleModels,
  deepseekModels,
} from "./modelData";
import { anthropicModels } from "integrations/anthropic/models";
import { deepinfraModels } from "integrations/deepinfra/models";
import { selectTheme } from "../theme/themeSlice";
import { useAppSelector } from "../hooks";

const ModelComparison = () => {
  const theme = useAppSelector(selectTheme);

  const combinedModels = [
    ...deepinfraModels.map((model) => ({
      ...model,
      provider: "Deepinfra",
      maxOutputTokens: model.maxOutputTokens || "未知",
      supportsTool: model.supportsTool || "未知",
    })),
    ...mistralModels.map((model) => ({
      ...model,
      provider: "Mistral",
    })),
    ...anthropicModels.map((model) => ({
      ...model,
      provider: "Anthropic",
    })),
    ...openaiModels.map((model) => ({
      ...model,
      provider: "OpenAI",
    })),
    ...googleModels.map((model) => ({
      ...model,
      provider: "Google",
    })),
    ...deepseekModels.map((model) => ({
      ...model,
      provider: "Deepseek",
    })),
  ];

  const [models, setModels] = useState(combinedModels);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const handleSort = (key: string) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
    setModels(
      [...models].sort((a, b) => {
        if (key === "price") {
          if (a.price.output < b.price.output)
            return direction === "ascending" ? -1 : 1;
          if (a.price.output > b.price.output)
            return direction === "ascending" ? 1 : -1;
          return 0;
        } else {
          if (a[key] < b[key]) return direction === "ascending" ? -1 : 1;
          if (a[key] > b[key]) return direction === "ascending" ? 1 : -1;
          return 0;
        }
      }),
    );
  };

  const SortButton = ({ columnKey }: { columnKey: string }) => (
    <button
      onClick={() => handleSort(columnKey)}
      style={{
        marginLeft: "5px",
        background: "none",
        border: "none",
        cursor: "pointer",
      }}
    >
      {sortConfig.key === columnKey
        ? sortConfig.direction === "ascending"
          ? "↑"
          : "↓"
        : "↑↓"}
    </button>
  );

  const headerCellProps = {
    element: { header: true },
    theme,
    attributes: { style: { whiteSpace: "nowrap" } },
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>大模型性能和价格对比</h1>
      <Table theme={theme} attributes={{}}>
        <thead>
          <TableRow theme={theme} attributes={{}}>
            <TableCell {...headerCellProps}>
              模型名称
              <SortButton columnKey="name" />
            </TableCell>
            <TableCell {...headerCellProps}>
              最大输出Token
              <SortButton columnKey="maxOutputTokens" />
            </TableCell>
            <TableCell {...headerCellProps}>
              上下文窗口
              <SortButton columnKey="contextWindow" />
            </TableCell>
            <TableCell {...headerCellProps}>
              价格（输入/输出）
              <SortButton columnKey="price" />
            </TableCell>
            <TableCell {...headerCellProps}>
              支持工具
              <SortButton columnKey="supportsTool" />
            </TableCell>
            <TableCell {...headerCellProps}>
              视觉能力
              <SortButton columnKey="hasVision" />
            </TableCell>
            <TableCell {...headerCellProps}>
              提供商
              <SortButton columnKey="provider" />
            </TableCell>
          </TableRow>
        </thead>
        <tbody>
          {models.map((model, index) => (
            <TableRow key={index} theme={theme} attributes={{}}>
              <TableCell
                element={{ header: false }}
                theme={theme}
                attributes={{ title: model.displayName || model.name }}
              >
                {model.displayName || model.name}
              </TableCell>
              <TableCell
                element={{ header: false }}
                theme={theme}
                attributes={{}}
              >
                {model.maxOutputTokens}
              </TableCell>
              <TableCell
                element={{ header: false }}
                theme={theme}
                attributes={{}}
              >
                {model.contextWindow}
              </TableCell>
              <TableCell
                element={{ header: false }}
                theme={theme}
                attributes={{}}
              >
                {model.price.input} / {model.price.output}
              </TableCell>
              <TableCell
                element={{ header: false }}
                theme={theme}
                attributes={{}}
              >
                {model.supportsTool}
              </TableCell>
              <TableCell
                element={{ header: false }}
                theme={theme}
                attributes={{}}
              >
                {model.hasVision ? "是" : "否"}
              </TableCell>
              <TableCell
                element={{ header: false }}
                theme={theme}
                attributes={{}}
              >
                {model.provider}
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ModelComparison;
