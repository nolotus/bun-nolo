import React, { useState, useMemo } from "react";
import { Table, TableRow, TableCell } from "render/web/ui/Table";
import { deepinfraModels } from "integrations/deepinfra/models";
import { openAIModels } from "integrations/openai/models";
import { mistralModels } from "integrations/mistral/models";
import { googleModels } from "integrations/google/models";
import { deepSeekModels } from "integrations/deepseek/models";
import { openrouterModels } from "integrations/openrouter/models";
import { xaiModels } from "integrations/xai/models";
import UsageRules from "./UsageRules";
import {
  LuArrowUp,
  LuArrowDown,
  LuEye,
  LuWrench,
  LuBrainCircuit,
} from "react-icons/lu";

const BREAKPOINT_MOBILE = 768;
const BREAKPOINT_TABLET = 1024;

const TABLE_HEADERS = [
  { key: "displayName", label: "模型名称", sortable: false },
  { key: "formattedMaxOutputTokens", label: "最大输出", sortable: true },
  { key: "formattedContextWindow", label: "上下文窗口", sortable: true },
  { key: "price.input", label: "输入价格 / 1M", sortable: true },
  { key: "price.output", label: "输出价格 / 1M", sortable: true },
  { key: "capabilities", label: "拥有能力", sortable: false },
];

const formatNumber = (n?: number): string => {
  if (typeof n !== "number" || isNaN(n)) return "未知";
  if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace(".0", "")}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1).replace(".0", "")}K`;
  return n.toString();
};

const formatPrice = (n?: number, decimals = 2): string => {
  if (typeof n !== "number" || isNaN(n)) return "未知";
  return `$${n
    .toFixed(decimals)
    .replace(/\.0+$/, "")
    .replace(/(\.\d*?[1-9])0+$/, "$1")}`;
};

const parseFormattedNumber = (str: string): number => {
  if (str === "未知") return -1;
  const num = parseFloat(str);
  if (str.endsWith("M")) return num * 1e6;
  if (str.endsWith("K")) return num * 1e3;
  return num;
};

const getNestedValue = (obj: any, path: string): any =>
  path.split(".").reduce((o, k) => (o || {})[k], obj);

const CapabilityIcon: React.FC<{
  Icon: React.ComponentType<any>;
  title: string;
  active: boolean;
}> = ({ Icon, title, active }) => (
  <Icon title={title} className={active ? "active" : ""} />
);

const CapabilitiesIcons: React.FC<{ model: any }> = ({ model }) => (
  <div className="capabilities-icons">
    <CapabilityIcon Icon={LuEye} title="支持视觉" active={model.hasVision} />
    <CapabilityIcon
      Icon={LuWrench}
      title="支持工具调用"
      active={model.canUseTools}
    />
    <CapabilityIcon
      Icon={LuBrainCircuit}
      title="增强推理"
      active={model.hasAdvancedReasoning}
    />
  </div>
);

const SortButton: React.FC<{
  active: boolean;
  isAscending: boolean;
  onClick: () => void;
}> = ({ active, isAscending, onClick }) => (
  <button
    className={`sort-btn ${active ? "active" : ""}`}
    onClick={onClick}
    aria-label={`排序${isAscending ? "升序" : "降序"}`}
  >
    {isAscending ? <LuArrowUp /> : <LuArrowDown />}
  </button>
);

const ModelComparison: React.FC = () => {
  const normalizeModel = (model: any, provider: string) => ({
    ...model,
    provider,
    formattedContextWindow: formatNumber(model.contextWindow),
    formattedMaxOutputTokens: formatNumber(model.maxOutputTokens),
  });

  const allModels = useMemo(() => {
    const providers = [
      [deepinfraModels, "Deepinfra"],
      [mistralModels, "Mistral"],
      [openAIModels, "OpenAI"],
      [googleModels, "Google"],
      [deepSeekModels, "Deepseek"],
      [openrouterModels, "OpenRouter"],
      [xaiModels, "XAI"],
    ] as const;

    return providers.flatMap(([models, name]) =>
      models.map((m) => normalizeModel(m, name))
    );
  }, []);

  const [models, setModels] = useState(allModels);
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: "ascending" | "descending" | null;
  }>({ key: "price.output", direction: "ascending" });

  const handleSort = (key: string) => {
    const newDirection =
      sortConfig.key === key && sortConfig.direction === "ascending"
        ? "descending"
        : "ascending";

    setSortConfig({ key, direction: newDirection });

    const comparator = (a: any, b: any) => {
      if (key.startsWith("price.")) {
        const valA = getNestedValue(a, key) ?? Infinity;
        const valB = getNestedValue(b, key) ?? Infinity;
        return valA - valB;
      }

      if (
        ["formattedContextWindow", "formattedMaxOutputTokens"].includes(key)
      ) {
        return parseFormattedNumber(a[key]) - parseFormattedNumber(b[key]);
      }

      return String(getNestedValue(a, key) ?? "").localeCompare(
        String(getNestedValue(b, key) ?? "")
      );
    };

    setModels((prev) =>
      [...prev].sort((a, b) =>
        newDirection === "ascending" ? comparator(a, b) : -comparator(a, b)
      )
    );
  };

  return (
    <>
      <style href="model-comparison" precedence="low">{`
        .model-comparison {
          padding: var(--space-6);
        }
        
        .comparison-title {
          text-align: center;
          color: var(--text);
          font-size: 24px;
          font-weight: 600;
          margin-bottom: var(--space-8);
        }
        
        .desktop-view {
          display: block;
        }
        
        .mobile-view {
          display: none;
        }
        
        .header-cell {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          white-space: nowrap;
        }
        
        .model-name {
          font-weight: 500;
          color: var(--text);
        }
        
        .model-provider {
          color: var(--textTertiary);
          font-size: 12px;
          margin-top: var(--space-1);
        }
        
        .sort-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          padding: var(--space-1);
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          color: var(--textQuaternary);
          opacity: 0.5;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .sort-btn:hover {
          opacity: 0.8;
          background: var(--backgroundHover);
          color: var(--textSecondary);
        }
        
        .sort-btn.active {
          opacity: 1;
          color: var(--primary);
        }
        
        .sort-btn.active:hover {
          color: var(--hover);
          background: var(--primaryGhost);
        }
        
        .capabilities-icons {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: 18px;
          color: var(--textQuaternary);
        }
        
        .capabilities-icons > svg {
          transition: all 0.2s ease;
        }
        
        .capabilities-icons > svg:not(.active):hover {
          color: var(--textTertiary);
          transform: scale(1.1);
        }
        
        .capabilities-icons > .active {
          color: var(--primary);
        }
        
        .model-list {
          padding: 0;
        }
        
        .model-card {
          background: var(--backgroundSecondary);
          border-radius: 12px;
          padding: var(--space-4);
          margin-bottom: var(--space-3);
          transition: all 0.2s ease;
        }
        
        .model-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px var(--shadowLight);
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-4);
        }
        
        .card-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-3);
        }
        
        .card-item-label {
          color: var(--textSecondary);
          font-size: 12px;
          margin-bottom: var(--space-1);
        }
        
        .card-item-value {
          font-weight: 500;
          color: var(--text);
          font-size: 14px;
        }
        
        @media (max-width: ${BREAKPOINT_TABLET}px) {
          .model-comparison {
            padding: var(--space-4);
          }
        }
        
        @media (max-width: ${BREAKPOINT_MOBILE}px) {
          .model-comparison {
            padding: var(--space-3);
          }
          
          .comparison-title {
            font-size: 20px;
            margin-bottom: var(--space-6);
          }
          
          .desktop-view {
            display: none;
          }
          
          .mobile-view {
            display: block;
          }
        }
      `}</style>

      <section className="model-comparison">
        <h2 className="comparison-title">大模型性能和价格对比</h2>

        <div className="desktop-view">
          <Table>
            <thead>
              <TableRow>
                {TABLE_HEADERS.map(({ key, label, sortable }) => (
                  <TableCell key={key} element={{ header: true }}>
                    <div className="header-cell">
                      <span>{label}</span>
                      {sortable && (
                        <SortButton
                          active={sortConfig.key === key}
                          isAscending={sortConfig.direction === "ascending"}
                          onClick={() => handleSort(key)}
                        />
                      )}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            </thead>
            <tbody>
              {models.map((model, index) => (
                <TableRow key={`${model.name}-${index}`}>
                  <TableCell
                    element={{ header: false }}
                    attributes={{ title: model.description }}
                  >
                    <div className="model-name">
                      {model.displayName || model.name}
                    </div>
                    <div className="model-provider">{model.provider}</div>
                  </TableCell>
                  <TableCell element={{ header: false }}>
                    {model.formattedMaxOutputTokens}
                  </TableCell>
                  <TableCell element={{ header: false }}>
                    {model.formattedContextWindow}
                  </TableCell>
                  <TableCell element={{ header: false }}>
                    {formatPrice(model.price?.input)}
                  </TableCell>
                  <TableCell element={{ header: false }}>
                    {formatPrice(model.price?.output)}
                  </TableCell>
                  <TableCell element={{ header: false }}>
                    <CapabilitiesIcons model={model} />
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="mobile-view">
          <div className="model-list">
            {models.map((model, index) => (
              <article key={`${model.name}-${index}`} className="model-card">
                <header className="card-header">
                  <div>
                    <div className="model-name">
                      {model.displayName || model.name}
                    </div>
                    <div className="model-provider">{model.provider}</div>
                  </div>
                  <CapabilitiesIcons model={model} />
                </header>
                <div className="card-grid">
                  <div>
                    <div className="card-item-label">最大输出</div>
                    <div className="card-item-value">
                      {model.formattedMaxOutputTokens}
                    </div>
                  </div>
                  <div>
                    <div className="card-item-label">上下文窗口</div>
                    <div className="card-item-value">
                      {model.formattedContextWindow}
                    </div>
                  </div>
                  <div>
                    <div className="card-item-label">输入价格 / 1M</div>
                    <div className="card-item-value">
                      {formatPrice(model.price?.input)}
                    </div>
                  </div>
                  <div>
                    <div className="card-item-label">输出价格 / 1M</div>
                    <div className="card-item-value">
                      {formatPrice(model.price?.output)}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

const PricingPage: React.FC = () => (
  <>
    <style href="pricing-page" precedence="low">{`
      .pricing-page {
        max-width: 1440px;
        margin: 0 auto;
        padding: var(--space-8) 0;
      }
      
      .page-title {
        font-size: 32px;
        font-weight: 700;
        text-align: center;
        margin-bottom: var(--space-3);
        color: var(--text);
        letter-spacing: -0.02em;
      }
      
      .page-subtitle {
        text-align: center;
        color: var(--textSecondary);
        font-size: 16px;
        margin-bottom: var(--space-2);
      }
      
      @media (max-width: ${BREAKPOINT_MOBILE}px) {
        .pricing-page {
          padding: var(--space-6) 0;
        }
        
        .page-title {
          font-size: 24px;
          margin-bottom: var(--space-2);
        }
        
        .page-subtitle {
          font-size: 14px;
        }
      }
    `}</style>

    <main className="pricing-page">
      <h1 className="page-title">定价与模型对比</h1>
      <p className="page-subtitle">透明的价格,强大的性能</p>
      <UsageRules />
      <ModelComparison />
    </main>
  </>
);

export default PricingPage;
