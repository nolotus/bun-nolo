import React, { useState } from "react";
import { Table, TableRow, TableCell } from "render/web/ui/Table";
import { fireworksmodels } from "integrations/fireworks/models";
import { deepinfraModels } from "integrations/deepinfra/models";
import { openAIModels } from "integrations/openai/models";
import { mistralModels } from "integrations/mistral/models";
import { googleModels } from "integrations/google/models";
import { deepSeekModels } from "integrations/deepseek/models";
import { selectTheme } from "app/settings/settingSlice";

import { useAppSelector } from "app/store";
import { openrouterModels } from "integrations/openrouter/models";
import { useMediaQuery } from "react-responsive";
import { xaiModels } from "integrations/xai/models";

// 格式化数字为带单位的字符串
const formatNumberWithUnit = (num) => {
  if (typeof num !== "number" || isNaN(num)) return "未知";

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

const ModelComparison = () => {
  const theme = useAppSelector(selectTheme);
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  const normalizeModel = (model, provider) => ({
    ...model,
    maxOutputTokens: model.maxOutputTokens || "未知",
    provider: provider,
    // 格式化数字字段
    formattedContextWindow: formatNumberWithUnit(model.contextWindow),
    formattedMaxOutputTokens: formatNumberWithUnit(model.maxOutputTokens),
  });

  const modelProviders = [
    { models: deepinfraModels, name: "Deepinfra" },
    { models: mistralModels, name: "Mistral" },
    { models: openAIModels, name: "OpenAI" },
    { models: googleModels, name: "Google" },
    { models: deepSeekModels, name: "Deepseek" },
    { models: fireworksmodels, name: "Fireworks" },
    { models: openrouterModels, name: "OpenRouter" },
    { models: xaiModels, name: "XAI" },
  ];

  const combinedModels = modelProviders.flatMap(({ models, name }) =>
    models.map((model) => normalizeModel(model, name))
  );

  const [models, setModels] = useState(combinedModels);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "ascending"
        ? "descending"
        : "ascending";

    setSortConfig({ key, direction });

    const getCompareValue = (a, b) => {
      if (key === "price") {
        return (a.price?.output || 0) - (b.price?.output || 0);
      } else if (key === "contextWindow" || key === "maxOutputTokens") {
        const getNumericValue = (value) => {
          if (typeof value === "string") {
            if (value.endsWith("M")) {
              return parseFloat(value) * 1000000;
            } else if (value.endsWith("K")) {
              return parseFloat(value) * 1000;
            } else if (value === "未知") {
              return 0;
            }
          }
          return value || 0;
        };
        return getNumericValue(a[key]) - getNumericValue(b[key]);
      } else {
        return String(a[key]).localeCompare(String(b[key]));
      }
    };

    setModels(
      [...models].sort((a, b) => {
        const compareValue = getCompareValue(a, b);
        return direction === "ascending" ? compareValue : -compareValue;
      })
    );
  };

  const SortButton = ({ columnKey }) => {
    const isActive = sortConfig.key === columnKey;
    const direction = isActive ? sortConfig.direction : null;

    return (
      <button
        onClick={() => handleSort(columnKey)}
        style={{
          marginLeft: theme.space[1],
          background: "none",
          border: "none",
          cursor: "pointer",
          color: theme.textTertiary,
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          padding: `0 ${theme.space[1]}`,
          borderRadius: theme.space[1],
          height: "24px",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = theme.textSecondary;
          e.currentTarget.style.backgroundColor = theme.backgroundHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = theme.textTertiary;
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        {isActive ? (
          direction === "ascending" ? (
            "↑"
          ) : (
            "↓"
          )
        ) : (
          <>
            <span style={{ opacity: 0.5 }}>↑</span>
            <span style={{ opacity: 0.5, marginLeft: "-4px" }}>↓</span>
          </>
        )}
      </button>
    );
  };

  // 移动端视图 - 卡片布局
  const MobileView = () => (
    <div style={{ padding: theme.space[3] }}>
      {models.map((model, index) => (
        <div
          key={index}
          style={{
            borderBottom: `1px solid ${theme.borderLight}`,
            padding: `${theme.space[4]} 0`,
            marginBottom: theme.space[3],
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: theme.space[2],
            }}
          >
            <div>
              <div style={{ fontWeight: 500, fontSize: "16px" }}>
                {model.displayName || model.name}
              </div>
              <div
                style={{
                  color: theme.textSecondary,
                  fontSize: "12px",
                  marginTop: theme.space[1],
                }}
              >
                {model.provider}
              </div>
            </div>
            <div
              style={{
                color: model.hasVision ? theme.text : theme.textTertiary,
                fontSize: "14px",
              }}
            >
              {model.hasVision ? "✓ 视觉" : "✗ 无视觉"}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: `${theme.space[3]} ${theme.space[4]}`,
              marginTop: theme.space[2],
            }}
          >
            <div>
              <div style={{ color: theme.textSecondary, fontSize: "12px" }}>
                最大输出
              </div>
              <div style={{ fontWeight: 500 }}>
                {model.formattedMaxOutputTokens}
              </div>
            </div>
            <div>
              <div style={{ color: theme.textSecondary, fontSize: "12px" }}>
                上下文窗口
              </div>
              <div style={{ fontWeight: 500 }}>
                {model.formattedContextWindow}
              </div>
            </div>
            <div>
              <div style={{ color: theme.textSecondary, fontSize: "12px" }}>
                输入价格
              </div>
              <div style={{ fontWeight: 500 }}>
                {model.price?.input || "未知"}
              </div>
            </div>
            <div>
              <div style={{ color: theme.textSecondary, fontSize: "12px" }}>
                输出价格
              </div>
              <div style={{ fontWeight: 500 }}>
                {model.price?.output || "未知"}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // 桌面端视图 - 表格布局
  const DesktopView = () => (
    <Table theme={theme} attributes={{ style: { width: "100%" } }}>
      <thead>
        <TableRow theme={theme}>
          {[
            { key: "displayName", label: "模型名称" },
            { key: "formattedMaxOutputTokens", label: "最大输出Token" },
            { key: "formattedContextWindow", label: "上下文窗口" },
            { key: "price", label: "价格（输入/输出）" },
            { key: "hasVision", label: "视觉能力" },
          ].map((column) => (
            <TableCell
              key={column.key}
              element={{ header: true }}
              theme={theme}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                {column.label}
                <SortButton columnKey={column.key} />
              </div>
            </TableCell>
          ))}
        </TableRow>
      </thead>
      <tbody>
        {models.map((model, index) => (
          <TableRow key={index} theme={theme}>
            <TableCell
              element={{ header: false }}
              theme={theme}
              attributes={{ title: model.description }}
            >
              <div style={{ fontWeight: 500 }}>
                {model.displayName || model.name}
              </div>
              <div
                style={{
                  color: theme.textSecondary,
                  fontSize: "12px",
                  marginTop: theme.space[1],
                }}
              >
                {model.provider}
              </div>
            </TableCell>
            <TableCell element={{ header: false }} theme={theme}>
              {model.formattedMaxOutputTokens}
            </TableCell>
            <TableCell element={{ header: false }} theme={theme}>
              {model.formattedContextWindow}
            </TableCell>
            <TableCell element={{ header: false }} theme={theme}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: theme.space[1],
                }}
              >
                <span>{model.price?.input || "未知"}</span>
                <span style={{ color: theme.textTertiary }}>/</span>
                <span>{model.price?.output || "未知"}</span>
              </div>
            </TableCell>
            <TableCell element={{ header: false }} theme={theme}>
              {model.hasVision ? "✓" : "✗"}
            </TableCell>
          </TableRow>
        ))}
      </tbody>
    </Table>
  );

  return (
    <div style={{ padding: theme.space[4] }}>
      <h1
        style={{
          textAlign: "center",
          color: theme.text,
          fontSize: "24px",
          fontWeight: 600,
          marginBottom: theme.space[6],
        }}
      >
        大模型性能和价格对比
      </h1>

      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
};

export default ModelComparison;
