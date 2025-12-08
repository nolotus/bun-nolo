import React from "react";
import { NavLink } from "react-router-dom";
import {
  LuSparkles,
  LuCheck,
  LuMessageSquare,
  LuFileText,
  LuBox,
  LuAppWindow,
  LuBrain,
  LuMoonStar,
  LuCoffee,
  LuZap,
} from "react-icons/lu";
import { useTranslation } from "react-i18next";

const WelcomeSection = () => {
  const { t } = useTranslation();

  return (
    <section className="ws-container">
      <div className="ws-ambient-glow"></div>

      {/* Header */}
      <div className="ws-hero">
        <h1 className="ws-hero-title">
          <span className="ws-gradient-text">
            {t("welcomeSection.heroTitle")}
          </span>
        </h1>
        <p className="ws-hero-desc">{t("welcomeSection.heroDescription")}</p>
        <div className="ws-cta-wrapper">
          <NavLink to="/signup" className="ws-cta-btn">
            {t("welcomeSection.ctaButton")}
          </NavLink>
        </div>
      </div>

      {/* Experience Grid */}
      <div className="ws-grid">
        {/* Card 1: Context Flow (流体处理) */}
        <div className="ws-card ws-card-context">
          <div className="ws-card-visual">
            <div className="ws-flow-pipeline">
              {/* Input Zone */}
              <div className="ws-input-zone">
                <div className="ws-file-pill">
                  <LuFileText size={12} />
                  <span>Project.pdf</span>
                </div>
                <div className="ws-user-dot"></div>
              </div>

              {/* Processing Stream */}
              <div className="ws-stream-line">
                <div className="ws-stream-pulse"></div>
              </div>

              {/* Output Zone */}
              <div className="ws-output-zone">
                <div className="ws-ai-badge">
                  <LuBrain size={14} className="ws-ai-icon" />
                  <span>Gemini Pro</span>
                </div>
                <div className="ws-chat-bubble">
                  {t("welcomeSection.cards.context.bubble")}
                </div>
              </div>
            </div>
          </div>
          <div className="ws-card-text">
            <h3>{t("welcomeSection.cards.context.title")}</h3>
            <p>{t("welcomeSection.cards.context.desc")}</p>
          </div>
        </div>

        {/* Card 2: Council (引力场) */}
        <div className="ws-card ws-card-council">
          <div className="ws-card-visual">
            <div className="ws-council-system">
              {/* Orbit Rings */}
              <div className="ws-orbit-ring ring-1"></div>
              <div className="ws-orbit-ring ring-2"></div>

              {/* Floating Avatars (Renamed to avoid conflict) */}
              <div className="ws-model-avatar pos-gpt">GPT</div>
              <div className="ws-model-avatar pos-claude">C</div>
              <div className="ws-model-avatar pos-gemini">G</div>

              {/* Core */}
              <div className="ws-core-energy">
                <LuMessageSquare size={18} />
              </div>

              {/* Status Pill */}
              <div className="ws-status-pill">
                <div className="ws-success-dot">
                  <LuCheck size={8} strokeWidth={4} />
                </div>
                <span>{t("welcomeSection.cards.battle.result")}</span>
              </div>
            </div>
          </div>
          <div className="ws-card-text">
            <h3>{t("welcomeSection.cards.battle.title")}</h3>
            <p>{t("welcomeSection.cards.battle.desc")}</p>
          </div>
        </div>

        {/* Card 3: Create (能量爆发) */}
        <div className="ws-card ws-card-create">
          <div className="ws-card-visual">
            <div className="ws-bloom-container">
              {/* Central Trigger */}
              <div className="ws-magic-trigger">
                <LuZap size={18} className="ws-zap-icon" />
              </div>

              {/* Erupting Elements */}
              <div className="ws-bloom-item item-3d">
                <div className="ws-icon-box">
                  <LuBox size={18} />
                </div>
                <span className="ws-label-tiny">3D Asset</span>
              </div>
              <div className="ws-bloom-item item-web">
                <div className="ws-icon-box">
                  <LuAppWindow size={18} />
                </div>
                <span className="ws-label-tiny">Web UI</span>
              </div>

              {/* Connecting Beams */}
              <svg className="ws-bloom-beams" width="100%" height="100%">
                <line
                  x1="50%"
                  y1="50%"
                  x2="25%"
                  y2="30%"
                  className="ws-beam beam-1"
                />
                <line
                  x1="50%"
                  y1="50%"
                  x2="75%"
                  y2="30%"
                  className="ws-beam beam-2"
                />
              </svg>
            </div>
          </div>
          <div className="ws-card-text">
            <h3>{t("welcomeSection.cards.create.title")}</h3>
            <p>{t("welcomeSection.cards.create.desc")}</p>
          </div>
        </div>

        {/* Card 4: Plan & Peace (深空夜景) */}
        <div className="ws-card ws-card-night">
          <div className="ws-card-visual ws-visual-night">
            <div className="ws-night-bg">
              <LuMoonStar className="ws-moon" size={24} />
              <div className="ws-star s1"></div>
              <div className="ws-star s2"></div>
              <div className="ws-star s3"></div>
            </div>

            <div className="ws-workflow-dock">
              <div className="ws-flow-step step-done">
                <div className="ws-step-dot"></div>
                <div className="ws-step-line"></div>
              </div>
              <div className="ws-flow-step step-active">
                <div className="ws-step-dot pulse"></div>
                <div className="ws-step-line dashed"></div>
              </div>
              <div className="ws-flow-step step-pending">
                <div className="ws-step-dot"></div>
              </div>
            </div>

            <div className="ws-sleep-badge">
              <LuCoffee size={14} />
              <span>While you sleep</span>
            </div>
          </div>
          <div className="ws-card-text">
            <h3>{t("welcomeSection.cards.auto.title")}</h3>
            <p>{t("welcomeSection.cards.auto.desc")}</p>
          </div>
        </div>
      </div>

      <style>{`
        /* === Container & Variables === */
        .ws-container {
          --ws-primary: var(--primary, #1677ff);
          --ws-bg: var(--background, #ffffff);
          --ws-bg-sub: var(--backgroundSecondary, #f5f5f5);
          --ws-text: var(--text, #000);
          --ws-text-sub: var(--textSecondary, #666);
          --ws-border: var(--border, #e5e5e5);
          --ws-radius: 24px;
          
          padding: 80px 24px;
          max-width: 1100px;
          margin: 0 auto;
          position: relative;
          font-family: inherit;
        }

        .ws-ambient-glow {
          position: absolute;
          width: 60%;
          height: 600px;
          background: radial-gradient(circle, var(--primaryGhost) 0%, transparent 70%);
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 0;
          opacity: 0.6;
          pointer-events: none;
        }

        /* === Hero Section === */
        .ws-hero { text-align: center; margin-bottom: 60px; position: relative; z-index: 2; }
        
        .ws-hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1.1;
          margin-bottom: 24px;
          color: var(--ws-text);
        }

        .ws-gradient-text {
          background: linear-gradient(135deg, var(--ws-text) 30%, var(--ws-primary));
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .ws-hero-desc {
          font-size: 1.2rem;
          color: var(--ws-text-sub);
          max-width: 560px;
          margin: 0 auto 40px;
          line-height: 1.6;
        }

        .ws-cta-btn {
          display: inline-block;
          padding: 14px 48px;
          background: var(--ws-text);
          color: var(--ws-bg);
          border-radius: 99px;
          font-weight: 600;
          text-decoration: none;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 10px 20px -5px rgba(0,0,0,0.1);
        }
        .ws-cta-btn:hover { transform: scale(1.05) translateY(-2px); box-shadow: 0 15px 30px -5px rgba(0,0,0,0.2); }

        /* === Grid Layout === */
        .ws-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
          position: relative;
          z-index: 2;
        }

        /* === Generic Card Styles === */
        .ws-card {
          background: var(--ws-bg-sub);
          border-radius: var(--ws-radius);
          padding: 8px; /* Inner padding for the "frame" look */
          transition: transform 0.4s ease, box-shadow 0.4s ease;
          border: 1px solid transparent;
          display: flex;
          flex-direction: column;
        }

        .ws-card:hover {
          transform: translateY(-8px);
          background: var(--ws-bg);
          border-color: var(--ws-border);
          box-shadow: 0 24px 48px -12px rgba(0,0,0,0.08);
        }

        .ws-card-visual {
          background: var(--ws-bg); 
          border-radius: 18px;
          height: 240px;
          width: 100%;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          border: 1px solid rgba(0,0,0,0.03);
        }
        
        /* Dark visuals overrides */
        .ws-card-night .ws-card-visual {
           background: linear-gradient(160deg, #1e293b, #0f172a);
           border: 1px solid #334155;
        }

        .ws-card-text { padding: 0 24px 24px; text-align: left; }
        .ws-card-text h3 { font-size: 1.4rem; margin: 0 0 8px; color: var(--ws-text); letter-spacing: -0.02em; }
        .ws-card-text p { font-size: 1rem; margin: 0; color: var(--ws-text-sub); line-height: 1.5; }

        /* === Card 1: Context Pipeline === */
        .ws-flow-pipeline {
          display: flex; flex-direction: column; align-items: center; gap: 0; position: relative;
        }
        .ws-input-zone { display: flex; align-items: center; gap: 12px; z-index: 2; }
        .ws-file-pill {
          background: var(--ws-bg); border: 1px solid var(--ws-border);
          padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; 
          display: flex; gap: 6px; align-items: center; color: var(--ws-text-sub);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .ws-user-dot { width: 24px; height: 24px; background: #e2e8f0; border-radius: 50%; }

        .ws-stream-line {
          width: 2px; height: 60px; background: var(--ws-border); position: relative; margin: 4px 0; overflow: hidden;
        }
        .ws-stream-pulse {
          position: absolute; top: -100%; left: 0; width: 100%; height: 50%;
          background: linear-gradient(to bottom, transparent, var(--ws-primary), transparent);
          animation: ws-stream 2s infinite;
        }

        .ws-output-zone { display: flex; flex-direction: column; align-items: center; gap: 12px; z-index: 2; width: 200px; }
        .ws-ai-badge {
           color: #06b6d4; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
           display: flex; align-items: center; gap: 4px;
        }
        .ws-chat-bubble {
          background: #ecfeff; color: #164e63; padding: 12px; border-radius: 12px;
          font-size: 0.85rem; width: 100%; border: 1px solid #cffafe;
          opacity: 0; animation: ws-pop-in 0.5s forwards 1s;
        }

        /* === Card 2: Council Gravity === */
        .ws-council-system { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .ws-orbit-ring {
           position: absolute; border: 1px border var(--ws-border); border-radius: 50%;
           border: 1px dashed rgba(0,0,0,0.1);
        }
        .ring-1 { width: 160px; height: 160px; animation: ws-spin 30s linear infinite; }
        .ring-2 { width: 100px; height: 100px; animation: ws-spin-rev 20s linear infinite; }

        .ws-core-energy {
           width: 48px; height: 48px; background: var(--ws-bg); border-radius: 50%;
           box-shadow: 0 0 20px rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center;
           color: var(--ws-primary); z-index: 5;
        }

        .ws-model-avatar {
           position: absolute; width: 36px; height: 36px; border-radius: 50%;
           color: white; font-size: 10px; font-weight: 800; display: flex; align-items: center; justify-content: center;
           box-shadow: 0 4px 10px rgba(0,0,0,0.15); z-index: 4;
        }
        .pos-gpt { background: #10a37f; top: 40px; left: 50%; transform: translateX(-50%); animation: ws-float 4s ease-in-out infinite; }
        .pos-claude { background: #d97757; bottom: 50px; left: 60px; animation: ws-float 5s ease-in-out infinite 0.5s; }
        .pos-gemini { background: #0ea5e9; bottom: 50px; right: 60px; animation: ws-float 6s ease-in-out infinite 1s; }

        .ws-status-pill {
           position: absolute; bottom: 20px; background: rgba(255,255,255,0.8); backdrop-filter: blur(4px);
           padding: 6px 12px; border-radius: 99px; display: flex; align-items: center; gap: 6px;
           box-shadow: 0 4px 12px rgba(0,0,0,0.1); font-size: 0.75rem; font-weight: 600; color: #059669;
        }
        .ws-success-dot { width: 16px; height: 16px; background: #10b981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; }

        /* === Card 3: Create Bloom === */
        .ws-bloom-container { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .ws-magic-trigger {
           width: 56px; height: 56px; background: var(--ws-text); color: var(--ws-bg);
           border-radius: 50%; display: flex; align-items: center; justify-content: center;
           z-index: 10; box-shadow: 0 8px 20px rgba(0,0,0,0.2);
           transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .ws-card-create:hover .ws-magic-trigger { transform: scale(1.1); }
        .ws-zap-icon { fill: currentColor; }

        .ws-bloom-beams { position: absolute; top: 0; left: 0; pointer-events: none; z-index: 1; }
        .ws-beam { stroke: var(--ws-primary); stroke-width: 2; stroke-dasharray: 5; opacity: 0; transition: all 0.5s ease; }
        .ws-card-create:hover .ws-beam { opacity: 0.3; stroke-dashoffset: -10; }

        .ws-bloom-item {
           position: absolute; display: flex; flex-direction: column; align-items: center; gap: 6px;
           transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
           opacity: 0.5; transform: scale(0.8);
        }
        .item-3d { top: 40px; left: 40px; }
        .item-web { top: 40px; right: 40px; }
        
        .ws-card-create:hover .item-3d { top: 30px; left: 30px; opacity: 1; transform: scale(1); }
        .ws-card-create:hover .item-web { top: 30px; right: 30px; opacity: 1; transform: scale(1); }

        .ws-icon-box {
           width: 40px; height: 40px; background: var(--ws-bg); border: 1px solid var(--ws-border);
           border-radius: 12px; display: flex; align-items: center; justify-content: center;
           box-shadow: 0 4px 12px rgba(0,0,0,0.1); color: var(--ws-text);
        }
        .ws-label-tiny { font-size: 0.65rem; font-weight: 600; color: var(--ws-text-sub); }


        /* === Card 4: Night Workflow === */
        .ws-visual-night { display: flex; flex-direction: column; justify-content: center; position: relative; }
        .ws-night-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; }
        .ws-moon { position: absolute; top: 20px; right: 20px; color: #fefce8; opacity: 0.8; }
        .ws-star { position: absolute; background: white; border-radius: 50%; opacity: 0; animation: ws-twinkle 3s infinite; }
        .s1 { width: 2px; height: 2px; top: 40%; left: 20%; animation-delay: 0s; }
        .s2 { width: 3px; height: 3px; top: 20%; left: 50%; animation-delay: 1s; }
        .s3 { width: 1px; height: 1px; bottom: 30%; right: 30%; animation-delay: 2s; }

        .ws-workflow-dock {
           display: flex; align-items: center; gap: 8px; z-index: 2;
           background: rgba(255,255,255,0.05); padding: 16px 24px; border-radius: 16px;
           border: 1px solid rgba(255,255,255,0.1);
           backdrop-filter: blur(4px);
        }
        .ws-flow-step { display: flex; align-items: center; gap: 8px; }
        .ws-step-dot { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.2); }
        .step-done .ws-step-dot { background: #10b981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.4); }
        .step-active .ws-step-dot { background: #3b82f6; box-shadow: 0 0 8px rgba(59, 130, 246, 0.4); }
        .ws-step-line { width: 40px; height: 2px; background: rgba(255,255,255,0.1); }
        .ws-step-line.dashed { background: transparent; border-top: 1px dashed rgba(255,255,255,0.3); }

        .ws-sleep-badge {
           margin-top: 20px; z-index: 2; display: flex; align-items: center; gap: 8px;
           color: #94a3b8; font-size: 0.75rem; background: rgba(0,0,0,0.3); padding: 6px 12px; border-radius: 99px;
        }

        /* === Animations === */
        @keyframes ws-stream { 0% { top: -100%; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        @keyframes ws-pop-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes ws-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes ws-spin-rev { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes ws-float { 0%,100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, -6px); } }
        @keyframes ws-twinkle { 0%,100% { opacity: 0.2; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.5); } }
        
        .pulse { animation: ws-pulse 2s infinite; }
        @keyframes ws-pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }

        /* === Responsive === */
        @media (max-width: 768px) {
          .ws-grid { grid-template-columns: 1fr; }
          .ws-hero-title { font-size: 2.5rem; }
        }
      `}</style>
    </section>
  );
};

export default React.memo(WelcomeSection);
