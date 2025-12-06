import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableRow, TableCell } from "render/web/ui/Table";
// import { openAIModels } from "integrations/openai/models";
import { deepSeekModels } from "integrations/deepseek/models";
import { openrouterModels } from "integrations/openrouter/models";
// import { xaiModels } from "integrations/xai/models";

import {
  LuSparkles,
  LuZap,
  LuShield,
  LuRocket,
  LuCheck,
  LuX,
  LuArrowUp,
  LuArrowDown,
} from "react-icons/lu";

const BREAKPOINT_MOBILE = 768;
const BREAKPOINT_TABLET = 1024;

/* ========================  方案选择区域（UsageRules）  ======================== */

const TIERS = {
  basic: {
    name: "基础版",
    meta: "余额 ≤ 20",
    icon: LuShield,
    color: "#667eea",
    features: [
      { text: "单文件上传", ok: true },
      { text: "联网受限", ok: false },
    ],
  },
  pro: {
    name: "专业版",
    meta: "余额 ＞ 20",
    icon: LuRocket,
    color: "#f5576c",
    features: [
      { text: "批量上传", ok: true },
      { text: "完整联网", ok: true },
      { text: "优先处理", ok: true },
    ],
  },
};

const Card: React.FC<{ tier: typeof TIERS.basic; isPro?: boolean }> = ({
  tier,
  isPro,
}) => {
  const Icon = tier.icon;

  return (
    <div className={`pricing-card ${isPro ? "pricing-card--pro" : ""}`}>
      {isPro && (
        <div className="pricing-card__badge">
          <LuSparkles className="pricing-card__badge-icon" /> 推荐
        </div>
      )}

      <div
        className="pricing-card__icon-wrapper"
        style={{ background: tier.color }}
      >
        <Icon />
      </div>

      <h3 className="pricing-card__title">{tier.name}</h3>
      <div className="pricing-card__meta">{tier.meta}</div>

      <ul className="pricing-card__features">
        {tier.features.map((f, i) => (
          <li
            key={i}
            className={`pricing-card__feature ${
              f.ok ? "pricing-card__feature--ok" : "pricing-card__feature--no"
            }`}
          >
            <div
              className={`pricing-card__status-icon ${
                f.ok
                  ? "pricing-card__status-icon--ok"
                  : "pricing-card__status-icon--no"
              }`}
            >
              {f.ok ? <LuCheck size={12} /> : <LuX size={12} />}
            </div>
            <span>{f.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const UsageRules: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        .rules {
          max-width: 960px;
          margin: var(--space-8) auto var(--space-6);
          padding: 0 var(--space-4);
        }
        
        .rules__grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }
        
        .pricing-card {
          width: 100%;
          background: color-mix(in srgb, var(--background) 80%, #ffffff 20%);
          border: 1px solid var(--borderLight);
          border-radius: 18px;
          padding: var(--space-6);
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-shadow: 0 18px 45px var(--shadowLight);
          backdrop-filter: blur(14px);
          transition: transform 0.18s ease-out, box-shadow 0.18s ease-out,
            border-color 0.18s ease-out, background 0.18s ease-out;
        }
        
        .pricing-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 50px var(--shadowMedium);
          border-color: var(--primary);
          background: color-mix(in srgb, var(--background) 75%, #ffffff 25%);
        }
        
        .pricing-card--pro {
          border-color: var(--primary);
          background: var(--primaryBg);
        }
        
        .pricing-card__badge {
          position: absolute;
          top: 12px;
          right: 12px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: var(--primary);
          color: #ffffff;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 999px;
        }
        
        .pricing-card__badge-icon {
          font-size: 12px;
        }

        .pricing-card__icon-wrapper {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--space-3);
          color: #ffffff;
          font-size: 24px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.18);
        }
        
        .pricing-card__title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          margin: 0 0 var(--space-1);
        }

        .pricing-card__meta {
          display: inline-block;
          background: var(--backgroundTertiary);
          color: var(--textSecondary);
          font-size: 12px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 999px;
          margin-bottom: var(--space-5);
        }
        
        .pricing-card__features {
          list-style: none;
          margin: 0;
          padding: 0;
          width: 100%;
          display: grid;
          gap: var(--space-3);
          text-align: left;
        }
        
        .pricing-card__feature {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: 14px;
          color: var(--text);
        }

        .pricing-card__status-icon {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .pricing-card__status-icon--ok {
          background: var(--success);
          color: #ffffff;
        }

        .pricing-card__status-icon--no {
          background: var(--backgroundTertiary);
          color: var(--textQuaternary);
        }

        .pricing-card__feature--no span {
          color: var(--textTertiary);
          text-decoration: line-through;
          opacity: 0.7;
        }

        .rules__cta {
          text-align: center;
          padding: var(--space-5);
          background: var(--backgroundTertiary);
          border-radius: 18px;
        }
        
        .rules__cta-title {
          margin: 0 0 var(--space-3) 0;
          font-size: 16px;
          color: var(--text);
        }

        .rules__btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          background: var(--primary);
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          padding: 10px 32px;
          border: none;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.18s ease-out;
        }

        .rules__btn:hover {
          background: var(--hover);
          transform: translateY(-1px);
          box-shadow: 0 10px 28px var(--shadowMedium);
        }
        
        @media (max-width: 768px) {
          .rules {
            padding: 0 var(--space-3);
          }

          .rules__grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <section className="rules">
        <div className="rules__grid">
          <Card tier={TIERS.basic} />
          <Card tier={TIERS.pro} isPro />
        </div>

        <div className="rules__cta">
          <h3 className="rules__cta-title">准备好体验了吗？</h3>
          <button className="rules__btn" onClick={() => navigate("/recharge")}>
            <LuZap />
            立即充值
          </button>
        </div>
      </section>
    </>
  );
};

/* ========================  模型对比区域（ModelComparison）  ======================== */

const TABLE_HEADERS = [
  { key: "displayName", label: "模型名称", sortable: false },
  { key: "price.input", label: "输入 / 1M 积分", sortable: true },
  { key: "price.output", label: "输出 / 1M 积分", sortable: true },
  { key: "vision", label: "视觉识别", sortable: false },
];

// 价格展示：0 -> 免费，其他为「数值 + 积分」，小额自动多保留几位
const formatPrice = (n?: number): string => {
  if (typeof n !== "number" || isNaN(n)) return "未知";
  if (n === 0) return "免费";

  const abs = Math.abs(n);
  const decimals = abs < 0.01 ? 4 : abs < 1 ? 3 : 2;

  const num = n
    .toFixed(decimals)
    .replace(/\.0+$/, "")
    .replace(/(\.\d*?[1-9])0+$/, "$1");

  return `${num} 积分`;
};

const getNestedValue = (obj: any, path: string): any =>
  path.split(".").reduce((o, k) => (o || {})[k], obj);

const VisionTag: React.FC<{ hasVision: boolean }> = ({ hasVision }) => (
  <span
    className={`vision-tag ${hasVision ? "vision-tag--yes" : "vision-tag--no"}`}
  >
    {hasVision ? "支持" : "不支持"}
  </span>
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
    provider, // 仅内部使用，不展示
  });

  const allModels = useMemo(() => {
    const providers = [
      // [openAIModels, "OpenAI"],
      // [googleModels, "Google"],
      [deepSeekModels, "Deepseek"],
      [openrouterModels, "OpenRouter"],
      // [xaiModels, "XAI"],
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

        .vision-tag {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 56px;
          padding: 2px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .vision-tag--yes {
          background: rgba(16, 185, 129, 0.12);
          color: #10b981;
        }
        
        .vision-tag--no {
          background: var(--backgroundTertiary);
          color: var(--textQuaternary);
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
        <h2 className="comparison-title">模型价格对比（消耗积分）</h2>

        {/* 桌面端表格视图 */}
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
                  </TableCell>
                  <TableCell element={{ header: false }}>
                    {formatPrice(model.price?.input)}
                  </TableCell>
                  <TableCell element={{ header: false }}>
                    {formatPrice(model.price?.output)}
                  </TableCell>
                  <TableCell element={{ header: false }}>
                    <VisionTag hasVision={!!model.hasVision} />
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </div>

        {/* 移动端卡片视图 */}
        <div className="mobile-view">
          <div className="model-list">
            {models.map((model, index) => (
              <article key={`${model.name}-${index}`} className="model-card">
                <header className="card-header">
                  <div className="model-name">
                    {model.displayName || model.name}
                  </div>
                  <VisionTag hasVision={!!model.hasVision} />
                </header>
                <div className="card-grid">
                  <div>
                    <div className="card-item-label">输入 / 1M 积分</div>
                    <div className="card-item-value">
                      {formatPrice(model.price?.input)}
                    </div>
                  </div>
                  <div>
                    <div className="card-item-label">输出 / 1M 积分</div>
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

/* ========================  页面容器（PricingPage）  ======================== */

const PricingPage: React.FC = () => (
  <>
    <style href="pricing-page" precedence="low">{`
      .pricing-page {
        max-width: 1440px;
        margin: 0 auto;
        padding: var(--space-8) 0 var(--space-10);
      }
      
      .pricing-page__title {
        font-size: 32px;
        font-weight: 700;
        text-align: center;
        margin-bottom: var(--space-1);
        color: var(--text);
        letter-spacing: -0.02em;
      }

      .pricing-page__subtitle {
        text-align: center;
        font-size: 14px;
        color: var(--textSecondary);
        margin-bottom: var(--space-4);
      }
      
      @media (max-width: ${BREAKPOINT_MOBILE}px) {
        .pricing-page {
          padding: var(--space-6) 0 var(--space-8);
        }
        
        .pricing-page__title {
          font-size: 24px;
          margin-bottom: var(--space-1);
        }
      }
    `}</style>

    <main className="pricing-page">
      <h1 className="pricing-page__title">定价与模型对比</h1>
      <p className="pricing-page__subtitle">按积分计费，更透明的使用体验</p>
      <UsageRules />
      <ModelComparison />
    </main>
  </>
);

export default PricingPage;
