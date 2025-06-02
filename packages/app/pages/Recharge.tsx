// app/pages/Recharge.jsx
import React from "react";
import { PersonIcon, CreditCardIcon, InfoIcon } from "@primer/octicons-react";
import { useAppSelector } from "../hooks";
import { selectTheme } from "../theme/themeSlice";
import { useAuth } from "auth/hooks/useAuth";
import image from "app/images/image.png";

const RechargePage = () => {
  const theme = useAppSelector(selectTheme);
  const auth = useAuth();

  // 二维码图片显示组件
  const QrCodeDisplay = () => (
    <div
      style={{
        width: "240px",
        height: "240px",
        backgroundColor: "#FFFFFF",
        border: `3px solid ${theme.border}`,
        borderRadius: theme.space[3],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto",
        position: "relative",
        boxShadow: `0 4px 12px ${theme.shadow1}`,
        overflow: "hidden",
      }}
    >
      {/* 二维码图片 */}
      <img
        src={image}
        alt="充值二维码"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: theme.space[2],
        }}
      />

      {/* 可选：添加半透明的中心 Logo 覆盖层 */}
      <div
        style={{
          position: "absolute",
          bottom: theme.space[2],
          right: theme.space[2],
          width: "32px",
          height: "32px",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: theme.space[1],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 2px 8px ${theme.shadow2}`,
        }}
      >
        <CreditCardIcon size={18} color={theme.primary} />
      </div>
    </div>
  );

  return (
    <div
      style={{
        maxWidth: "520px",
        margin: `${theme.space[10]} auto`,
        padding: theme.space[8],
        borderRadius: theme.space[4],
        backgroundColor: theme.background,
        color: theme.text,
        textAlign: "center",
        animation: "fadeIn 0.4s ease-out",
      }}
    >
      {/* 标题区域 */}
      <div style={{ marginBottom: theme.space[8] }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "600",
            color: theme.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: theme.space[3],
            margin: 0,
            marginBottom: theme.space[4],
          }}
        >
          <CreditCardIcon size={32} color={theme.primary} />
          账户充值
        </h1>

        <p
          style={{
            color: theme.textSecondary,
            lineHeight: "1.6",
            fontSize: "1.1rem",
            margin: 0,
          }}
        >
          使用支付宝或微信扫描下方二维码完成充值
        </p>
      </div>

      {/* 用户信息显示 */}
      <div
        style={{
          marginBottom: theme.space[8],
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: `${theme.space[2]} ${theme.space[4]}`,
            backgroundColor: theme.backgroundSecondary,
            borderRadius: theme.space[2],
            border: `1px solid ${theme.border}`,
          }}
        >
          <PersonIcon size={20} color={theme.textSecondary} />
          <span
            style={{
              fontSize: "14px",
              fontWeight: "500",
              marginLeft: theme.space[2],
              color: theme.text,
            }}
          >
            {auth.user?.username || "未登录用户"}
          </span>
        </div>
      </div>

      {/* 二维码显示区域 */}
      <div
        style={{
          backgroundColor: theme.backgroundSecondary,
          borderRadius: theme.space[4],
          padding: theme.space[8],
          marginBottom: theme.space[8],
        }}
      >
        <QrCodeDisplay />

        <div
          style={{
            marginTop: theme.space[6],
            color: theme.textSecondary,
            fontSize: "0.95rem",
          }}
        >
          扫描上方二维码完成充值
        </div>
      </div>

      {/* 重要提示区域 */}
      <div
        style={{
          backgroundColor: theme.backgroundTertiary,
          borderRadius: theme.space[3],
          padding: theme.space[6],
          textAlign: "left",
        }}
      >
        <h4
          style={{
            margin: `0 0 ${theme.space[4]} 0`,
            color: theme.text,
            fontSize: "1rem",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: theme.space[2],
          }}
        >
          <InfoIcon size={20} color={theme.primary} />
          充值须知
        </h4>

        <div
          style={{
            color: theme.textSecondary,
            fontSize: "0.9rem",
            lineHeight: "1.7",
            display: "flex",
            flexDirection: "column",
            gap: theme.space[3],
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: theme.space[2],
            }}
          >
            <span
              style={{
                color: theme.primary,
                fontSize: "1.2rem",
                lineHeight: 1,
              }}
            >
              •
            </span>
            <span>
              <strong>转账备注：</strong>请务必填写您的用户名{" "}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  backgroundColor: theme.backgroundHover,
                  padding: `${theme.space[1]} ${theme.space[2]}`,
                  borderRadius: theme.space[1],
                  fontSize: "0.85rem",
                  color: theme.primary,
                  fontFamily: "monospace",
                  fontWeight: "500",
                  gap: theme.space[1],
                  border: `1px solid ${theme.border}`,
                }}
              >
                <PersonIcon size={12} color={theme.primary} />
                {auth.user?.username || "username"}
              </span>
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: theme.space[2],
            }}
          >
            <span
              style={{
                color: theme.primary,
                fontSize: "1.2rem",
                lineHeight: 1,
              }}
            >
              •
            </span>
            <span>
              <strong>充值金额：</strong>
              可充值任意金额，支持小数点（如：50.5元）
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: theme.space[2],
            }}
          >
            <span
              style={{
                color: theme.primary,
                fontSize: "1.2rem",
                lineHeight: 1,
              }}
            >
              •
            </span>
            <span>
              <strong>到账时间：</strong>非即时到账，通常 1-10 分钟内到账
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: theme.space[2],
            }}
          >
            <span
              style={{
                color: theme.primary,
                fontSize: "1.2rem",
                lineHeight: 1,
              }}
            >
              •
            </span>
            <span>
              <strong>支付方式：</strong>支持支付宝、微信支付扫码转账
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: theme.space[2],
            }}
          >
            <span
              style={{
                color: theme.primary,
                fontSize: "1.2rem",
                lineHeight: 1,
              }}
            >
              •
            </span>
            <span>
              <strong>客服支持：</strong>充值遇到问题请联系 support@cybot.com
            </span>
          </div>
        </div>
      </div>

      {/* 底部说明 */}
      <div
        style={{
          marginTop: theme.space[8],
          padding: theme.space[4],
          backgroundColor: theme.backgroundGhost,
          borderRadius: theme.space[2],
          fontSize: "0.85rem",
          color: theme.textTertiary,
          lineHeight: "1.6",
        }}
      >
        <div
          style={{
            marginBottom: theme.space[2],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: theme.space[2],
          }}
        >
          <InfoIcon size={16} color={theme.textTertiary} />
          <strong>温馨提示</strong>
        </div>
        <div>
          充值成功后余额将自动更新，可立即使用 Cybot 服务。
          转账时请确保备注信息准确，以便系统快速识别并到账。
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(${theme.space[6]}); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
      `}</style>
    </div>
  );
};

export default RechargePage;
