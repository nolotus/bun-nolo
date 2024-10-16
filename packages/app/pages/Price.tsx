import React, { useState } from "react";
import { initialModels } from "./modelData";

const ModelComparison = () => {
  const [models, setModels] = useState(initialModels);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
    setModels(
      [...models].sort((a, b) => {
        if (a[key] < b[key]) return direction === "ascending" ? -1 : 1;
        if (a[key] > b[key]) return direction === "ascending" ? 1 : -1;
        return 0;
      }),
    );
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>大模型性能和价格对比</h1>
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                textAlign: "left",
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
              }}
            >
              输出价格
              <button
                onClick={() => handleSort("outputPrice")}
                style={{
                  marginLeft: "5px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {sortConfig.key === "outputPrice"
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
              }}
            >
              输入价格
              <button
                onClick={() => handleSort("inputPrice")}
                style={{
                  marginLeft: "5px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {sortConfig.key === "inputPrice"
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
              }}
            >
              视觉能力
              <button
                onClick={() => handleSort("visualCapability")}
                style={{
                  marginLeft: "5px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {sortConfig.key === "visualCapability"
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
              }}
            >
              延迟
              <button
                onClick={() => handleSort("latency")}
                style={{
                  marginLeft: "5px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {sortConfig.key === "latency"
                  ? sortConfig.direction === "ascending"
                    ? "↑"
                    : "↓"
                  : "↑↓"}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {models.map((model, index) => (
            <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                {model.name}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                {model.maxOutputTokens}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                {model.contextWindow}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                {model.humanEval}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                {model.outputPrice}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                {model.inputPrice}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                {model.supportsTool}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                {model.visualCapability}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                {model.latency}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ModelComparison;
