// app/pages/Recharge.jsx
import React from "react";
import {
  PersonIcon,
  CreditCardIcon,
  InfoIcon,
  DeviceMobileIcon,
  AlertIcon,
} from "@primer/octicons-react";
import { useAppSelector } from "app/store";
import { selectTheme } from "app/settings/settingSlice";

import { useAuth } from "auth/hooks/useAuth";
import image from "app/images/image.png";
const EMAIL = "s@nolotus.com";

const RechargePage = () => {
  const theme = useAppSelector(selectTheme);
  const auth = useAuth();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 二维码显示组件
  const QrCodeDisplay = () => (
    <div className="qr-code-container">
      <img src={image} alt="充值二维码" className="qr-code-image" />
      <div className="qr-code-badge">
        <CreditCardIcon size={16} color="var(--primary)" />
      </div>
    </div>
  );

  // 精简的重要提醒组件
  const ImportantNotice = () => (
    <div className="important-notice">
      <div className="notice-content">
        <div className="notice-icon">
          <AlertIcon size={12} color="var(--primary)" />
        </div>
        <div className="notice-text">
          <span className="notice-label">转账备注必填：</span>
          <div className="username-badge">
            <PersonIcon size={12} color="var(--primary)" />
            <span className="username-text">
              {auth.user?.username || "username"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // 充值须知组件
  const RechargeInstructions = () => (
    <div className="instructions-container">
      <h3 className="instructions-title">
        <InfoIcon size={18} color="var(--primary)" />
        充值须知
      </h3>

      <div className="instructions-list">
        {[
          { label: "充值金额", content: "可充值任意金额" },
          { label: "到账时间", content: "通常 1-10 分钟内到账" },
          { label: "客服支持", content: `遇到问题请联系 ${EMAIL}` },
        ].map((item, index) => (
          <div key={index} className="instruction-item">
            <div className="instruction-label">
              <div className="instruction-dot" />
              {item.label}
            </div>
            <div className="instruction-content">{item.content}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // 二维码区域组件
  const QrCodeSection = () => (
    <div className="qr-section">
      <QrCodeDisplay />
      <div className="qr-description">
        <DeviceMobileIcon size={14} color="var(--textTertiary)" />
        扫描二维码完成充值
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        .recharge-container {
          max-width: ${isMobile ? "400px" : "1200px"};
          margin: var(--space-8) auto;
          padding: ${isMobile ? "var(--space-6)" : "var(--space-10)"};
          color: var(--text);
          animation: fadeIn 0.5s ease-out;
        }

        .page-title {
          margin-bottom: var(--space-8);
          text-align: center;
        }

        .title-content {
          font-size: ${isMobile ? "1.75rem" : "2rem"};
          font-weight: 600;
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-3);
          margin: 0;
          letter-spacing: -0.02em;
        }

        .important-notice {
          background: linear-gradient(135deg, var(--primaryBg) 0%, var(--backgroundAccent) 100%);
          border-radius: var(--space-3);
          padding: var(--space-4) var(--space-5);
          margin-bottom: var(--space-6);
          position: relative;
          border-left: 3px solid var(--primary);
        }

        .notice-content {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .notice-icon {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--primaryGhost);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .notice-text {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          flex-wrap: wrap;
        }

        .notice-label {
          color: var(--primary);
          font-weight: 600;
          font-size: 0.9rem;
          white-space: nowrap;
        }

        .username-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1);
          background: var(--backgroundAccent);
          padding: var(--space-1) var(--space-3);
          border-radius: var(--space-2);
          box-shadow: var(--shadowLight);
        }

        .username-text {
          color: var(--primary);
          font-family: ui-monospace, 'SF Mono', monospace;
          font-weight: 500;
          font-size: 0.85rem;
          letter-spacing: 0.01em;
        }

        .main-content {
          display: flex;
          flex-direction: ${isMobile ? "column" : "row"};
          gap: var(--space-8);
          align-items: ${isMobile ? "stretch" : "flex-start"};
        }

        .content-section {
          flex: ${isMobile ? "none" : "1"};
        }

        .qr-section {
          background-color: var(--backgroundSecondary);
          border-radius: var(--space-4);
          padding: var(--space-8);
          text-align: center;
        }

        .qr-code-container {
          width: ${isMobile ? "200px" : "280px"};
          height: ${isMobile ? "200px" : "280px"};
          background-color: #FFFFFF;
          border-radius: var(--space-4);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          position: relative;
          box-shadow: var(--shadowMedium);
          overflow: hidden;
        }

        .qr-code-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: var(--space-3);
        }

        .qr-code-badge {
          position: absolute;
          bottom: var(--space-3);
          right: var(--space-3);
          width: 28px;
          height: 28px;
          background-color: rgba(255, 255, 255, 0.95);
          border-radius: var(--space-2);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadowLight);
          backdrop-filter: blur(8px);
        }

        .qr-description {
          margin-top: var(--space-5);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          color: var(--textSecondary);
          font-size: 0.85rem;
          font-weight: 400;
        }

        .instructions-container {
          background-color: var(--backgroundSecondary);
          border-radius: var(--space-4);
          padding: var(--space-8);
        }

        .instructions-title {
          margin: 0 0 var(--space-6) 0;
          color: var(--text);
          font-size: 1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: var(--space-3);
          letter-spacing: -0.01em;
        }

        .instructions-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .instruction-item {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .instruction-label {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          color: var(--text);
          font-weight: 500;
          font-size: 0.85rem;
        }

        .instruction-dot {
          width: 3px;
          height: 3px;
          background-color: var(--primary);
          border-radius: 50%;
          flex-shrink: 0;
        }

        .instruction-content {
          padding-left: var(--space-3);
          color: var(--textSecondary);
          font-size: 0.8rem;
          line-height: 1.4;
        }

        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(var(--space-4)); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        @media (max-width: 768px) {
          .notice-text {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-2);
          }
          
          .username-badge {
            align-self: flex-start;
          }
        }
      `}</style>

      <div className="recharge-container">
        {/* 标题区域 */}
        <div className="page-title">
          <h1 className="title-content">
            <CreditCardIcon size={isMobile ? 22 : 26} color="var(--primary)" />
            账户充值
          </h1>
        </div>

        {/* 精简的重要提醒 */}
        <ImportantNotice />

        {/* 主要内容区域 */}
        <div className="main-content">
          <div className="content-section">
            <QrCodeSection />
          </div>
          <div className="content-section">
            <RechargeInstructions />
          </div>
        </div>
      </div>
    </>
  );
};

export default RechargePage;
