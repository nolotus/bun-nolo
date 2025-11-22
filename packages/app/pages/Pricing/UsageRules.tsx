import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LuSparkles,
  LuZap,
  LuGlobe,
  LuUpload,
  LuShield,
  LuRocket,
} from "react-icons/lu";

const TIERS = {
  basic: {
    name: "基础版",
    meta: "余额 ≤ 20",
    icon: LuShield,
    color: "#667eea",
    features: [
      { icon: LuUpload, text: "单文件上传", ok: true },
      { icon: LuGlobe, text: "联网受限", ok: false },
    ],
  },
  pro: {
    name: "专业版",
    meta: "余额 ＞ 20",
    icon: LuRocket,
    color: "#f5576c",
    features: [
      { icon: LuUpload, text: "批量上传", ok: true },
      { icon: LuGlobe, text: "完整联网", ok: true },
      { icon: LuZap, text: "优先处理", ok: true },
    ],
  },
};

const Card: React.FC<{ tier: typeof TIERS.basic; isPro?: boolean }> = ({
  tier,
  isPro,
}) => {
  const Icon = tier.icon;

  return (
    <div className={`card ${isPro ? "pro" : ""}`}>
      {isPro && (
        <div className="badge">
          <LuSparkles />
          推荐
        </div>
      )}

      <div className="icon" style={{ background: tier.color }}>
        <Icon />
      </div>

      <h3>{tier.name}</h3>
      <div className="meta">{tier.meta}</div>

      <ul>
        {tier.features.map((f, i) => (
          <li key={i} className={f.ok ? "ok" : "no"}>
            <f.icon />
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
      <style href="usage-rules" precedence="low">{`
        .rules {
          max-width: 850px;
          margin: var(--space-6) auto;
          padding: 0 var(--space-4);
        }
        
        .header {
          text-align: center;
          margin-bottom: var(--space-5);
        }

        .super {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1);
          color: var(--primary);
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: var(--space-2);
        }
        
        .title {
          font-size: 22px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: var(--space-2);
        }

        .subtitle {
          font-size: 13px;
          color: var(--textSecondary);
        }
        
        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-4);
          margin-bottom: var(--space-5);
        }
        
        .card {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: var(--space-5);
          position: relative;
          transition: all 0.25s ease;
        }
        
        .card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px var(--shadowMedium);
          border-color: var(--primary);
        }
        
        .pro {
          border-color: var(--primary);
          background: var(--primaryBg);
        }
        
        .badge {
          position: absolute;
          top: var(--space-3);
          right: var(--space-3);
          display: flex;
          align-items: center;
          gap: 4px;
          background: var(--primary);
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 999px;
        }

        .icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--space-3);
          transition: transform 0.25s;
        }

        .card:hover .icon {
          transform: scale(1.1);
        }

        .icon svg {
          font-size: 22px;
          color: white;
        }
        
        .card h3 {
          font-size: 17px;
          font-weight: 700;
          color: var(--text);
          margin: 0 0 var(--space-1);
        }

        .meta {
          display: inline-block;
          background: var(--backgroundTertiary);
          color: var(--textSecondary);
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 999px;
          margin-bottom: var(--space-3);
        }
        
        .card ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: var(--space-2);
        }
        
        .card li {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 13px;
          color: var(--text);
        }

        .card li svg {
          width: 20px;
          height: 20px;
          padding: 4px;
          border-radius: 6px;
          flex-shrink: 0;
        }

        .ok svg {
          background: var(--success);
          color: white;
        }

        .no svg {
          background: var(--backgroundTertiary);
          color: var(--textQuaternary);
        }

        .no span {
          color: var(--textTertiary);
          text-decoration: line-through;
          opacity: 0.6;
        }

        .cta {
          text-align: center;
          padding: var(--space-5);
          background: var(--primaryBg);
          border-radius: 14px;
          border: 1px solid var(--border);
        }

        .cta h3 {
          font-size: 16px;
          font-weight: 700;
          color: var(--text);
          margin: 0 0 var(--space-2);
        }

        .cta p {
          font-size: 12px;
          color: var(--textSecondary);
          margin: 0 0 var(--space-3);
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          background: var(--primary);
          color: white;
          font-size: 14px;
          font-weight: 600;
          padding: 10px 24px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn:hover {
          background: var(--hover);
          transform: translateY(-2px);
        }

        .btn svg {
          font-size: 16px;
        }
        
        @media (max-width: 768px) {
          .grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="rules">
        <header className="header">
          <div className="super">
            <LuSparkles />
            AI 驱动
          </div>
          <h2 className="title">选择你的方案</h2>
          <p className="subtitle">解锁完整功能，让 AI 成为你的创作伙伴</p>
        </header>

        <div className="grid">
          <Card tier={TIERS.basic} />
          <Card tier={TIERS.pro} isPro />
        </div>

        <div className="cta">
          <h3>准备好体验 AI 了吗？</h3>
          <p>立即充值，解锁完整功能</p>
          <button className="btn" onClick={() => navigate("/recharge")}>
            <LuZap />
            立即充值
          </button>
        </div>
      </section>
    </>
  );
};

export default UsageRules;
