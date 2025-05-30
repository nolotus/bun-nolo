import React, { useState } from "react";
import { Table, TableRow, TableCell } from "web/ui/Table";
import { fireworksmodels } from "integrations/fireworks/models";
import { anthropicModels } from "integrations/anthropic/anthropicModels";
import { deepinfraModels } from "integrations/deepinfra/models";
import { openAIModels } from "integrations/openai/models";
import { mistralModels } from "integrations/mistral/models";
import { googleModels } from "integrations/google/models";
import { deepSeekModels } from "integrations/deepseek/models";

import { selectTheme } from "../theme/themeSlice";
import { useAppSelector } from "../hooks";

const ModelComparison = () => {
  const theme = useAppSelector(selectTheme);

  // 统一处理各提供商的模型数据
  const normalizeModel = (model: any) => ({
    ...model,
    maxOutputTokens: model.maxOutputTokens || "未知",
  });

  const modelProviders = [
    { models: deepinfraModels, name: "Deepinfra" },
    { models: mistralModels, name: "Mistral" },
    { models: anthropicModels, name: "Anthropic" },
    { models: openAIModels, name: "OpenAI" },
    { models: googleModels, name: "Google" },
    { models: deepSeekModels, name: "Deepseek" },
    { models: fireworksmodels, name: "Fireworks" },
  ];

  const combinedModels = modelProviders.flatMap(({ models }) =>
    models.map((model) => normalizeModel(model))
  );

  const [models, setModels] = useState(combinedModels);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const handleSort = (key: string) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "ascending"
        ? "descending"
        : "ascending";

    setSortConfig({ key, direction });
    setModels(
      [...models].sort((a, b) => {
        const compareValue =
          key === "price"
            ? (a.price?.output || 0) - (b.price?.output || 0)
            : String(a[key]).localeCompare(String(b[key]));

        return direction === "ascending" ? compareValue : -compareValue;
      })
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
              <SortButton columnKey="displayName" />
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
              价格（每100万token）
              <br />
              输入/输出
              <SortButton columnKey="price" />
            </TableCell>
            <TableCell {...headerCellProps}>
              视觉能力
              <SortButton columnKey="hasVision" />
            </TableCell>
          </TableRow>
        </thead>
        <tbody>
          {models.map((model, index) => (
            <TableRow key={index} theme={theme} attributes={{}}>
              <TableCell
                element={{ header: false }}
                attributes={{ title: model.description }}
              >
                {model.displayName || model.name}
              </TableCell>
              <TableCell element={{ header: false }} attributes={{}}>
                {model.maxOutputTokens}
              </TableCell>
              <TableCell element={{ header: false }} attributes={{}}>
                {model.contextWindow}
              </TableCell>
              <TableCell element={{ header: false }} attributes={{}}>
                {model.price?.input || "未知"} / {model.price?.output || "未知"}
              </TableCell>
              <TableCell element={{ header: false }} attributes={{}}>
                {model.hasVision ? "是" : "否"}
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ModelComparison;
