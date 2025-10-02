// app/pages/Recharge.jsx
import React, { useState, useEffect } from "react";
import {
  RiUserLine,
  RiSecurePaymentLine,
  RiInformationLine,
  RiSmartphoneLine,
  RiWechatPayLine,
  RiAlipayLine,
  RiCheckLine,
} from "react-icons/ri";
import { useAuth } from "auth/hooks/useAuth";
import wechat from "app/images/wechat.png";
import alipay from "app/images/alipay.jpg";

const EMAIL = "s@nolotus.com";

const RechargePage = () => {
  const auth = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("wechat");
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => setImageLoaded(false), [paymentMethod]);

  const paymentMethods = [
    { id: "wechat", name: "微信", icon: RiWechatPayLine, color: "#07C160" },
    { id: "alipay", name: "支付宝", icon: RiAlipayLine, color: "#1677FF" },
    { id: "usdt", name: "USDT", icon: RiSecurePaymentLine, disabled: true },
  ];

  const instructions = [
    { label: "充值金额", content: "任意金额" },
    {
      label: "到账时间",
      content: "1-10 分钟",
      note: "人工充值，部分情况会延迟",
    },
    { label: "问题咨询", content: EMAIL },
  ];

  const qrImage = paymentMethod === "wechat" ? wechat : alipay;
  const aspectRatio = paymentMethod === "wechat" ? "2/3" : "3/4";
  const paymentName = paymentMethod === "wechat" ? "微信支付" : "支付宝";

  return (
    <>
      <style>{`
        .recharge-container {
          max-width: ${isMobile ? "100%" : "1100px"};
          margin: 0 auto;
          padding: ${isMobile ? "var(--space-5)" : "var(--space-12)"};
          color: var(--text);
        }

        .page-title {
          font-size: ${isMobile ? "1.75rem" : "2.25rem"};
          font-weight: 600;
          color: var(--text);
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin: 0 0 var(--space-8);
          letter-spacing: -0.02em;
        }

        .content-grid {
          display: grid;
          grid-template-columns: ${isMobile ? "1fr" : "1.2fr 1fr"};
          gap: var(--space-8);
        }

        .card {
          background: var(--backgroundSecondary);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          border-radius: ${isMobile ? "12px" : "16px"};
          padding: ${isMobile ? "var(--space-6)" : "var(--space-8)"};
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
        }

        .payment-tabs {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-2);
          margin-bottom: var(--space-4);
          background: var(--backgroundTertiary);
          border-radius: 10px;
          padding: var(--space-1);
        }

        .payment-tab {
          padding: ${isMobile ? "var(--space-2)" : "var(--space-3)"};
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-1);
          position: relative;
          color: var(--textSecondary);
          min-height: ${isMobile ? "64px" : "72px"};
        }

        .payment-tab:hover:not(:disabled) {
          background: var(--backgroundHover);
        }

        .payment-tab.active {
          background: var(--background);
          color: var(--text);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .payment-tab:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .tab-icon {
          font-size: ${isMobile ? "1.3rem" : "1.5rem"};
        }

        .tab-name {
          font-size: ${isMobile ? "0.75rem" : "0.85rem"};
          font-weight: 500;
          letter-spacing: -0.01em;
        }

        .active-indicator {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 18px;
          height: 18px;
          background: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
        }

        .coming-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: linear-gradient(135deg, #FF6B6B, #FF8E53);
          color: white;
          font-size: 0.55rem;
          padding: 2px 5px;
          border-radius: 4px;
          font-weight: 600;
          letter-spacing: 0.02em;
          box-shadow: 0 2px 4px rgba(255, 107, 107, 0.3);
        }

        .notice {
          background: var(--primaryBg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--borderAccent);
          border-radius: 8px;
          padding: var(--space-3);
          margin-bottom: var(--space-6);
          font-size: 0.8rem;
          color: var(--textSecondary);
          line-height: 1.5;
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .notice-icon {
          color: var(--primary);
          flex-shrink: 0;
        }

        .notice-highlight {
          color: var(--primary);
          font-weight: 600;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
          padding: 0 var(--space-1);
          background: var(--backgroundAccent);
          border-radius: 4px;
        }

        .qr-wrapper {
          text-align: center;
        }

        .qr-container {
          width: 100%;
          max-width: ${isMobile ? "280px" : "320px"};
          aspect-ratio: ${aspectRatio};
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          position: relative;
          margin: 0 auto;
          transition: aspect-ratio 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(0, 0, 0, 0.06);
        }

        .qr-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          opacity: ${imageLoaded ? "1" : "0"};
          transition: opacity 0.4s ease;
        }

        .qr-loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: var(--textTertiary);
          font-size: 0.85rem;
          font-weight: 500;
        }

        .qr-tip {
          margin-top: var(--space-5);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          color: var(--textSecondary);
          font-size: 0.85rem;
        }

        .info-title {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin: 0 0 var(--space-6);
          font-size: 1rem;
          font-weight: 600;
          color: var(--text);
          letter-spacing: -0.01em;
        }

        .info-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .info-item {
          display: grid;
          grid-template-columns: 80px 1fr;
          gap: var(--space-4);
          align-items: start;
        }

        .info-label {
          color: var(--textSecondary);
          font-weight: 500;
          font-size: 0.85rem;
        }

        .info-content {
          color: var(--text);
          font-size: 0.85rem;
          line-height: 1.6;
        }

        .info-note {
          display: block;
          color: var(--textTertiary);
          font-size: 0.75rem;
          margin-top: var(--space-1);
        }

        @media (max-width: 768px) {
          .info-item {
            grid-template-columns: auto 1fr;
            gap: var(--space-3);
          }
        }
      `}</style>

      <div className="recharge-container">
        <h1 className="page-title">
          <RiSecurePaymentLine size={isMobile ? 24 : 28} />
          账户充值
        </h1>

        <div className="content-grid">
          <div className="card">
            <div className="payment-tabs">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isActive = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    className={`payment-tab ${isActive ? "active" : ""}`}
                    onClick={() =>
                      !method.disabled && setPaymentMethod(method.id)
                    }
                    disabled={method.disabled}
                  >
                    <Icon
                      className="tab-icon"
                      style={{ color: isActive ? method.color : undefined }}
                    />
                    <span className="tab-name">{method.name}</span>
                    {isActive && !method.disabled && (
                      <div className="active-indicator">
                        <RiCheckLine size={11} />
                      </div>
                    )}
                    {method.disabled && (
                      <span className="coming-badge">即将推出</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="notice">
              <RiUserLine size={16} className="notice-icon" />
              <span>
                转账备注请填写
                <span className="notice-highlight">
                  {auth.user?.username || "username"}
                </span>
                否则无法到账
              </span>
            </div>

            <div className="qr-wrapper">
              <div className="qr-container">
                {!imageLoaded && <div className="qr-loading">加载中...</div>}
                <img
                  src={qrImage}
                  alt={`${paymentName}充值二维码`}
                  className="qr-image"
                  onLoad={() => setImageLoaded(true)}
                />
              </div>
              <div className="qr-tip">
                <RiSmartphoneLine size={16} />
                使用{paymentName}扫码付款
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="info-title">
              <RiInformationLine size={20} />
              充值说明
            </h3>
            <div className="info-list">
              {instructions.map((item, i) => (
                <div key={i} className="info-item">
                  <div className="info-label">{item.label}</div>
                  <div className="info-content">
                    {item.content}
                    {item.note && (
                      <span className="info-note">{item.note}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RechargePage;
