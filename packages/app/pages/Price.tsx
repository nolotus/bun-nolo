import React, { useState } from "react";
import { Table, TableRow, TableCell } from "render/web/ui/Table";
import { deepinfraModels } from "integrations/deepinfra/models";
import { openAIModels } from "integrations/openai/models";
import { mistralModels } from "integrations/mistral/models";
import { googleModels } from "integrations/google/models";
import { deepSeekModels } from "integrations/deepseek/models";
import { openrouterModels } from "integrations/openrouter/models";
import { xaiModels } from "integrations/xai/models";
import {
  LuArrowUp,
  LuArrowDown,
  LuEye,
  LuWrench,
  LuBrainCircuit,
} from "react-icons/lu";

// 格式化数字为带单位的字符串 (K, M)
const fmtNum = (n?: number) => {
  if (typeof n !== "number" || isNaN(n)) return "未知";
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(".0", "") + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(".0", "") + "K";
  return n.toString();
};

// 格式化价格，移除多余的末尾零，并添加美元符号
const fmtPrice = (n?: number, d = 2) =>
  typeof n === "number" && !isNaN(n)
    ? `$${n
        .toFixed(d)
        .replace(/\.0+$/, "")
        .replace(/(\.\d*?[1-9])0+$/, "$1")}`
    : "未知";

// 统一展示模型能力的图标组件
const CapabilitiesIcons: React.FC<{ model: any }> = ({ model }) => (
  <div className="capabilities-icons">
    <LuEye title="支持视觉" className={model.hasVision ? "active" : ""} />
    <LuWrench
      title="支持工具调用"
      className={model.canUseTools ? "active" : ""}
    />
    <LuBrainCircuit
      title="增强推理"
      className={model.hasAdvancedReasoning ? "active" : ""}
    />
  </div>
);

// 排序按钮组件
const SortBtn: React.FC<{
  active: boolean;
  isAsc: boolean;
  onClick: () => void;
}> = ({ active, isAsc, onClick }) => (
  <button className={`sort-btn ${active ? "active" : ""}`} onClick={onClick}>
    {isAsc ? <LuArrowUp /> : <LuArrowDown />}
  </button>
);

const ModelComparison: React.FC = () => {
  // 标准化模型数据
  const normalize = (m: any, p: string) => ({
    ...m,
    provider: p,
    formattedContextWindow: fmtNum(m.contextWindow),
    formattedMaxOutputTokens: fmtNum(m.maxOutputTokens),
  });

  const providers = [
    [deepinfraModels, "Deepinfra"],
    [mistralModels, "Mistral"],
    [openAIModels, "OpenAI"],
    [googleModels, "Google"],
    [deepSeekModels, "Deepseek"],

    [openrouterModels, "OpenRouter"],
    [xaiModels, "XAI"],
  ] as const;

  const allModels = providers.flatMap(([ms, name]) =>
    ms.map((m) => normalize(m, name))
  );

  const [models, setModels] = useState(allModels);
  const [sortConfig, setSort] = useState<{
    key: string | null;
    dir: "ascending" | "descending" | null;
  }>({ key: "price.output", dir: "ascending" }); // 默认按输出价格升序

  // 排序逻辑
  const handleSort = (key: string) => {
    const newDir =
      sortConfig.key === key && sortConfig.dir === "ascending"
        ? "descending"
        : "ascending";
    setSort({ key, dir: newDir });

    const getVal = (obj: any, path: string) =>
      path.split(".").reduce((o, k) => (o || {})[k], obj);

    const parseFormattedNum = (s: string) => {
      if (s === "未知") return -1;
      const num = parseFloat(s);
      if (s.endsWith("M")) return num * 1e6;
      if (s.endsWith("K")) return num * 1e3;
      return num;
    };

    const cmp = (a: any, b: any) => {
      if (key.startsWith("price.")) {
        const valA = getVal(a, key) ?? Infinity;
        const valB = getVal(b, key) ?? Infinity;
        return valA - valB;
      }
      if (
        ["formattedContextWindow", "formattedMaxOutputTokens"].includes(key)
      ) {
        return parseFormattedNum(a[key]) - parseFormattedNum(b[key]);
      }
      return String(getVal(a, key) ?? "").localeCompare(
        String(getVal(b, key) ?? "")
      );
    };

    setModels((prev) =>
      [...prev].sort((a, b) =>
        newDir === "ascending" ? cmp(a, b) : -cmp(a, b)
      )
    );
  };

  // 表头定义
  const headers = [
    { key: "displayName", label: "模型名称" },
    { key: "formattedMaxOutputTokens", label: "最大输出" },
    { key: "formattedContextWindow", label: "上下文窗口" },
    { key: "price.input", label: "输入价格 / 1M" },
    { key: "price.output", label: "输出价格 / 1M" },
    { key: "capabilities", label: "拥有能力" },
  ];

  return (
    <>
      <style href="model-comparison" precedence="low">{`
        .model-comp { padding: var(--space-4) var(--space-6); }
        .title { text-align: center; color: var(--text); font-size: 24px; font-weight: 600; margin-bottom: var(--space-6); }
        
        /* 响应式布局 */
        .desktop-view { display: block; }
        .mobile-view { display: none; }
        @media (max-width: 768px) {
          .model-comp { padding: var(--space-3) var(--space-2); }
          .desktop-view { display: none; }
          .mobile-view { display: block; }
        }
        
        /* 桌面端表格样式 */
        .header-cell { display: flex; align-items: center; white-space: nowrap; }
        .name { font-weight: 500; color: var(--text); }
        .sub { color: var(--textTertiary); font-size: 12px; margin-top: var(--space-1); }
        
        /* 排序按钮样式 */
        .sort-btn {
          background: none; border: none; cursor: pointer;
          font-size: 16px; padding: 0 var(--space-1);
          border-radius: var(--space-1); height: 24px;
          display: inline-flex; align-items: center; vertical-align: middle;
          margin-left: var(--space-2);
          color: var(--textQuaternary);
          opacity: 0.6;
          transition: opacity 0.2s ease, color 0.2s ease;
        }
        .sort-btn:hover {
          opacity: 1;
          color: var(--textSecondary);
        }
        .sort-btn.active {
          opacity: 1;
          color: var(--primary);
        }
        .sort-btn.active:hover {
          color: var(--hover);
        }
        
        /* 能力图标样式 */
        .capabilities-icons {
          display: flex; align-items: center;
          gap: var(--space-3); font-size: 18px;
          color: var(--textQuaternary);
        }
        .capabilities-icons > svg {
          transition: color 0.2s ease;
        }
        .capabilities-icons > svg:not(.active):hover {
           color: var(--textTertiary);
        }
        .capabilities-icons > .active {
          color: var(--text);
        }
        
        /* 移动端卡片样式 */
        .list { padding: 0; }
        .card { border-bottom: 1px solid var(--border); padding: var(--space-4) var(--space-2); }
        .card:last-child { border-bottom: none; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3); }
        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-3) var(--space-4); }
        .label { color: var(--textSecondary); font-size: 12px; }
        .value { font-weight: 500; color: var(--text); margin-top: var(--space-1); }
      `}</style>

      <div className="model-comp">
        <h1 className="title">大模型性能和价格对比</h1>

        <div className="desktop-view">
          <Table>
            <thead>
              <TableRow>
                {headers.map(({ key, label }) => (
                  <TableCell key={key} element={{ header: true }}>
                    <div className="header-cell">
                      <span>{label}</span>
                      {key !== "capabilities" && (
                        <SortBtn
                          active={sortConfig.key === key}
                          isAsc={sortConfig.dir === "ascending"}
                          onClick={() => handleSort(key)}
                        />
                      )}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            </thead>
            <tbody>
              {models.map((m, i) => (
                <TableRow key={`${m.name}-${i}`}>
                  <TableCell
                    element={{ header: false }}
                    attributes={{ title: m.description }}
                  >
                    <div className="name">{m.displayName || m.name}</div>
                    <div className="sub">{m.provider}</div>
                  </TableCell>
                  <TableCell element={{ header: false }}>
                    {m.formattedMaxOutputTokens}
                  </TableCell>
                  <TableCell element={{ header: false }}>
                    {m.formattedContextWindow}
                  </TableCell>
                  <TableCell element={{ header: false }}>
                    {fmtPrice(m.price?.input)}
                  </TableCell>
                  <TableCell element={{ header: false }}>
                    {fmtPrice(m.price?.output)}
                  </TableCell>
                  <TableCell element={{ header: false }}>
                    <CapabilitiesIcons model={m} />
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="mobile-view">
          <div className="list">
            {models.map((m, i) => (
              <div key={`${m.name}-${i}`} className="card">
                <div className="header">
                  <div>
                    <div className="name">{m.displayName || m.name}</div>
                    <div className="sub">{m.provider}</div>
                  </div>
                  <CapabilitiesIcons model={m} />
                </div>
                <div className="grid">
                  <div>
                    <div className="label">最大输出</div>
                    <div className="value">{m.formattedMaxOutputTokens}</div>
                  </div>
                  <div>
                    <div className="label">上下文窗口</div>
                    <div className="value">{m.formattedContextWindow}</div>
                  </div>
                  <div>
                    <div className="label">输入价格 / 1M</div>
                    <div className="value">{fmtPrice(m.price?.input)}</div>
                  </div>
                  <div>
                    <div className="label">输出价格 / 1M</div>
                    <div className="value">{fmtPrice(m.price?.output)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ModelComparison;
