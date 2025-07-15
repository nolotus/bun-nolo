import React, { useState } from "react";
import { Table, TableRow, TableCell } from "render/web/ui/Table";
import { fireworksmodels } from "integrations/fireworks/models";
import { deepinfraModels } from "integrations/deepinfra/models";
import { openAIModels } from "integrations/openai/models";
import { mistralModels } from "integrations/mistral/models";
import { googleModels } from "integrations/google/models";
import { deepSeekModels } from "integrations/deepseek/models";
import { openrouterModels } from "integrations/openrouter/models";
import { xaiModels } from "integrations/xai/models";
// 从 react-icons/lu 引入我们需要的图标
import { LuArrowUp, LuArrowDown, LuEye, LuEyeOff } from "react-icons/lu";

// 格式化数字为带单位的字符串
const fmtNum = (n?: number) => {
  if (typeof n !== "number" || isNaN(n)) return "未知";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
};
// 格式化价格
const fmtPrice = (n?: number, d = 2) =>
  typeof n === "number" && !isNaN(n)
    ? n.toFixed(d).replace(/\.?0+$/, "")
    : "未知";

const ModelComparison: React.FC = () => {
  const normalize = (m: any, p: string) => ({
    ...m,
    provider: p,
    formattedContextWindow: fmtNum(m.contextWindow),
    formattedMaxOutputTokens: fmtNum(m.maxOutputTokens),
    formattedInputPrice: fmtPrice(m.price?.input),
    formattedOutputPrice: fmtPrice(m.price?.output),
  });
  const providers = [
    [deepinfraModels, "Deepinfra"],
    [mistralModels, "Mistral"],
    [openAIModels, "OpenAI"],
    [googleModels, "Google"],
    [deepSeekModels, "Deepseek"],
    [fireworksmodels, "Fireworks"],
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
  }>({ key: null, dir: null });

  const sortBy = (key: string) => {
    const dir =
      sortConfig.key === key && sortConfig.dir === "ascending"
        ? "descending"
        : "ascending";
    setSort({ key, dir });
    const parse = (s: string) => {
      if (s.endsWith("M")) return parseFloat(s) * 1e6;
      if (s.endsWith("K")) return parseFloat(s) * 1e3;
      if (s === "未知") return 0;
      return parseFloat(s);
    };
    const cmp = (a: any, b: any) => {
      if (key === "price")
        return (a.price?.output || 0) - (b.price?.output || 0);
      if (["formattedContextWindow", "formattedMaxOutputTokens"].includes(key))
        return parse(a[key]) - parse(b[key]);
      return String(a[key]).localeCompare(String(b[key]));
    };
    setModels((prev) =>
      [...prev].sort((a, b) => (dir === "ascending" ? cmp(a, b) : -cmp(a, b)))
    );
  };

  // 排序按钮改用 LuArrowUp / LuArrowDown
  const SortBtn: React.FC<{ k: string }> = ({ k }) => {
    const active = sortConfig.key === k;
    const isAsc = active && sortConfig.dir === "ascending";
    const isDesc = active && sortConfig.dir === "descending";
    return (
      <button className="sort-btn" onClick={() => sortBy(k)}>
        {isAsc ? (
          <LuArrowUp />
        ) : isDesc ? (
          <LuArrowDown />
        ) : (
          <>
            <LuArrowUp className="light" />
            <LuArrowDown className="light" />
          </>
        )}
      </button>
    );
  };

  return (
    <>
      <style href="model-comparison" precedence="low">{`
        .model-comp { padding: var(--space-4); }
        .title { text-align: center; color: var(--text); font-size: 24px; font-weight: 600; margin-bottom: var(--space-6); }
        .desktop-view { display: block; }
        .mobile-view { display: none; }
        @media (max-width: 768px) {
          .desktop-view { display: none; }
          .mobile-view { display: block; }
        }
        .sort-btn {
          margin-left: var(--space-1);
          background: none; border: none; cursor: pointer;
          color: var(--textTertiary); font-size: 16px;
          padding: 0 var(--space-1); border-radius: var(--space-1);
          height: 24px; transition: 0.2s;
          display: inline-flex; align-items: center;
        }
        .sort-btn:hover { color: var(--textSecondary); background: var(--backgroundHover); }
        .light { opacity: 0.4; }
        .table { width: 100%; }
        .header-cell { display: flex; align-items: center; }
        .name { font-weight: 500; }
        .sub { color: var(--textSecondary); font-size: 12px; margin-top: var(--space-1); }
        .price { display: inline-flex; align-items: center; gap: var(--space-1); }
        .divider { color: var(--textTertiary); }
        .list { padding: var(--space-3); }
        .card { border-bottom: 1px solid var(--borderLight); padding: var(--space-4) 0; margin-bottom: var(--space-3); }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2); }
        .vision-icon { font-size: 18px; }
        .grid { display: grid; grid-template-columns: repeat(2,1fr); gap: var(--space-3) var(--space-4); }
        .label { color: var(--textSecondary); font-size: 12px; margin-top: var(--space-1); }
        .value { font-weight: 500; }
      `}</style>

      <div className="model-comp">
        <h1 className="title">大模型性能和价格对比</h1>

        {/* 桌面端表格 */}
        <div className="desktop-view">
          <Table attributes={{ className: "table" }}>
            <thead>
              <TableRow>
                {[
                  ["displayName", "模型名称"],
                  ["formattedMaxOutputTokens", "最大输出Token"],
                  ["formattedContextWindow", "上下文窗口"],
                  ["price", "价格（输入/输出）"],
                  ["hasVision", "视觉能力"],
                ].map(([key, label]) => (
                  <TableCell key={key} element={{ header: true }}>
                    <div className="header-cell">
                      {label}
                      <SortBtn k={key} />
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            </thead>
            <tbody>
              {models.map((m, i) => (
                <TableRow key={i}>
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
                    <div className="price">
                      <span>{m.formattedInputPrice}</span>
                      <span className="divider">/</span>
                      <span>{m.formattedOutputPrice}</span>
                    </div>
                  </TableCell>
                  <TableCell element={{ header: false }}>
                    {m.hasVision ? (
                      <LuEye className="vision-icon" />
                    ) : (
                      <LuEyeOff className="vision-icon" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </div>

        {/* 移动端卡片 */}
        <div className="mobile-view">
          <div className="list">
            {models.map((m, i) => (
              <div key={i} className="card">
                <div className="header">
                  <div>
                    <div className="name">{m.displayName || m.name}</div>
                    <div className="sub">{m.provider}</div>
                  </div>
                  {m.hasVision ? (
                    <LuEye className="vision-icon" />
                  ) : (
                    <LuEyeOff className="vision-icon" />
                  )}
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
                    <div className="label">输入价格</div>
                    <div className="value">{m.formattedInputPrice}</div>
                  </div>
                  <div>
                    <div className="label">输出价格</div>
                    <div className="value">{m.formattedOutputPrice}</div>
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
