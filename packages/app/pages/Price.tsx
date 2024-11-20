import React, { useState } from "react";
import { deepinfraModels } from "integrations/deepinfra/models";
import {
  mistralModels,
  anthropicModels,
  openaiModels,
  googleModels,
  deepseekModels,
} from "./modelData";
import TableCell from "render/blocks/TableCell";
import TableRow from "render/blocks/TableRow";
import Table from "render/blocks/Table";

const ModelComparison = () => {
  const combinedModels = [
    ...deepinfraModels.map((model) => ({
      ...model,
      provider: "Deepinfra",
      maxOutputTokens: model.maxOutputTokens || "未知",
      humanEval: model.humanEval || "未知",
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

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>大模型性能和价格对比</h1>
      <Table>
        <thead
          style={{
            backgroundColor: "#f2f2f2",
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          <TableRow>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                textAlign: "left",
                whiteSpace: "nowrap",
              }}
            >
              模型名称
              <button
                onClick={() => handleSort("name")}
                style={{
                  marginLeft: "5px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {sortConfig.key === "name"
                  ? sortConfig.direction === "ascending"
                    ? "↑"
                    : "↓"
                  : "↑↓"}
              </button>
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                textAlign: "left",
                whiteSpace: "nowrap",
              }}
            >
              最大输出Token
              <button
                onClick={() => handleSort("maxOutputTokens")}
                style={{
                  marginLeft: "5px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {sortConfig.key === "maxOutputTokens"
                  ? sortConfig.direction === "ascending"
                    ? "↑"
                    : "↓"
                  : "↑↓"}
              </button>
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                textAlign: "left",
                whiteSpace: "nowrap",
              }}
            >
              上下文窗口
              <button
                onClick={() => handleSort("contextWindow")}
                style={{
                  marginLeft: "5px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {sortConfig.key === "contextWindow"
                  ? sortConfig.direction === "ascending"
                    ? "↑"
                    : "↓"
                  : "↑↓"}
              </button>
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                textAlign: "left",
                whiteSpace: "nowrap",
              }}
            >
              HumanEval
              <button
                onClick={() => handleSort("humanEval")}
                style={{
                  marginLeft: "5px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {sortConfig.key === "humanEval"
                  ? sortConfig.direction === "ascending"
                    ? "↑"
                    : "↓"
                  : "↑↓"}
              </button>
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                textAlign: "left",
                whiteSpace: "nowrap",
              }}
            >
              价格（输入/输出）
              <button
                onClick={() => handleSort("price")}
                style={{
                  marginLeft: "5px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {sortConfig.key === "price"
                  ? sortConfig.direction === "ascending"
                    ? "↑"
                    : "↓"
                  : "↑↓"}
              </button>
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                textAlign: "left",
                whiteSpace: "nowrap",
              }}
            >
              支持工具
              <button
                onClick={() => handleSort("supportsTool")}
                style={{
                  marginLeft: "5px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {sortConfig.key === "supportsTool"
                  ? sortConfig.direction === "ascending"
                    ? "↑"
                    : "↓"
                  : "↑↓"}
              </button>
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                textAlign: "left",
                whiteSpace: "nowrap",
              }}
            >
              视觉能力
              <button
                onClick={() => handleSort("hasVision")}
                style={{
                  marginLeft: "5px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {sortConfig.key === "hasVision"
                  ? sortConfig.direction === "ascending"
                    ? "↑"
                    : "↓"
                  : "↑↓"}
              </button>
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                textAlign: "left",
                whiteSpace: "nowrap",
              }}
            >
              提供商
              <button
                onClick={() => handleSort("provider")}
                style={{
                  marginLeft: "5px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {sortConfig.key === "provider"
                  ? sortConfig.direction === "ascending"
                    ? "↑"
                    : "↓"
                  : "↑↓"}
              </button>
            </th>
          </TableRow>
        </thead>
        <tbody>
          {models.map((model, index) => (
            <TableRow key={index}>
              <TableCell title={model.name}>{model.name}</TableCell>
              <TableCell>{model.maxOutputTokens}</TableCell>
              <TableCell>{model.contextWindow}</TableCell>
              <TableCell>{model.humanEval}</TableCell>
              <TableCell>
                {model.price.input} / {model.price.output}
              </TableCell>
              <TableCell>{model.supportsTool}</TableCell>
              <TableCell>{model.hasVision ? "是" : "否"}</TableCell>
              <TableCell>{model.provider}</TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ModelComparison;
