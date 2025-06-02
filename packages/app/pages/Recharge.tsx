// app/pages/Recharge.jsx
import React from "react";
import {
  PersonIcon,
  CreditCardIcon,
  InfoIcon,
  DeviceMobileIcon,
} from "@primer/octicons-react";
import { useAppSelector } from "../hooks";
import { selectTheme } from "../theme/themeSlice";
import { useAuth } from "auth/hooks/useAuth";
import image from "app/images/image.png";

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
    <div
      style={{
        width: isMobile ? "200px" : "280px",
        height: isMobile ? "200px" : "280px",
        backgroundColor: "#FFFFFF",
        borderRadius: theme.space[4],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto",
        position: "relative",
        boxShadow: `0 8px 32px ${theme.shadow2}`,
        overflow: "hidden",
      }}
    >
      <img
        src={image}
        alt="充值二维码"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: theme.space[3],
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: theme.space[3],
          right: theme.space[3],
          width: "36px",
          height: "36px",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: theme.space[2],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 4px 12px ${theme.shadow2}`,
        }}
      >
        <CreditCardIcon size={20} color={theme.primary} />
      </div>
    </div>
  );

  // 充值须知组件
  const RechargeInstructions = () => (
    <div
      style={{
        backgroundColor: theme.backgroundSecondary,
        borderRadius: theme.space[4],
        padding: theme.space[8],
        height: "fit-content",
      }}
    >
      <h3
        style={{
          margin: `0 0 ${theme.space[6]} 0`,
          color: theme.text,
          fontSize: "1.25rem",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: theme.space[3],
        }}
      >
        <InfoIcon size={24} color={theme.primary} />
        充值须知
      </h3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: theme.space[5],
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: theme.space[2],
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: theme.space[2],
              color: theme.text,
              fontWeight: "500",
              fontSize: "0.95rem",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                backgroundColor: theme.primary,
                borderRadius: "50%",
                flexShrink: 0,
              }}
            />
            转账备注
          </div>
          <div style={{ paddingLeft: theme.space[4] }}>
            <div
              style={{
                color: theme.textSecondary,
                marginBottom: theme.space[2],
                fontSize: "0.9rem",
              }}
            >
              请务必填写您的用户名：
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                backgroundColor: theme.backgroundHover,
                padding: `${theme.space[2]} ${theme.space[3]}`,
                borderRadius: theme.space[2],
                fontSize: "0.9rem",
                color: theme.primary,
                fontFamily: "monospace",
                fontWeight: "600",
                gap: theme.space[2],
              }}
            >
              <PersonIcon size={16} color={theme.primary} />
              {auth.user?.username || "username"}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: theme.space[2],
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: theme.space[2],
              color: theme.text,
              fontWeight: "500",
              fontSize: "0.95rem",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                backgroundColor: theme.primary,
                borderRadius: "50%",
                flexShrink: 0,
              }}
            />
            充值金额
          </div>
          <div
            style={{
              paddingLeft: theme.space[4],
              color: theme.textSecondary,
              fontSize: "0.9rem",
            }}
          >
            可充值任意金额
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: theme.space[2],
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: theme.space[2],
              color: theme.text,
              fontWeight: "500",
              fontSize: "0.95rem",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                backgroundColor: theme.primary,
                borderRadius: "50%",
                flexShrink: 0,
              }}
            />
            到账时间
          </div>
          <div
            style={{
              paddingLeft: theme.space[4],
              color: theme.textSecondary,
              fontSize: "0.9rem",
            }}
          >
            非即时到账，通常 1-10 分钟内到账
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: theme.space[2],
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: theme.space[2],
              color: theme.text,
              fontWeight: "500",
              fontSize: "0.95rem",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                backgroundColor: theme.primary,
                borderRadius: "50%",
                flexShrink: 0,
              }}
            />
            客服支持
          </div>
          <div
            style={{
              paddingLeft: theme.space[4],
              color: theme.textSecondary,
              fontSize: "0.9rem",
            }}
          >
            充值遇到问题请联系 s@nolotus.com
          </div>
        </div>
      </div>
    </div>
  );

  // 二维码区域组件
  const QrCodeSection = () => (
    <div
      style={{
        backgroundColor: theme.backgroundSecondary,
        borderRadius: theme.space[4],
        padding: theme.space[8],
        textAlign: "center",
        height: "fit-content",
      }}
    >
      <QrCodeDisplay />

      <div
        style={{
          marginTop: theme.space[6],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: theme.space[2],
          color: theme.textSecondary,
          fontSize: "1rem",
          fontWeight: "500",
        }}
      >
        <DeviceMobileIcon size={18} color={theme.textTertiary} />
        扫描二维码完成充值
      </div>
    </div>
  );

  return (
    <div
      style={{
        maxWidth: isMobile ? "400px" : "1200px",
        margin: `${theme.space[8]} auto`,
        padding: isMobile ? theme.space[6] : theme.space[10],
        color: theme.text,
        animation: "fadeIn 0.5s ease-out",
      }}
    >
      {/* 标题区域 */}
      <div style={{ marginBottom: theme.space[10], textAlign: "center" }}>
        <h1
          style={{
            fontSize: isMobile ? "1.75rem" : "2.25rem",
            fontWeight: "700",
            color: theme.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: theme.space[3],
            margin: 0,
          }}
        >
          <CreditCardIcon size={isMobile ? 28 : 36} color={theme.primary} />
          账户充值
        </h1>
      </div>

      {/* 主要内容区域 */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: theme.space[8],
          alignItems: isMobile ? "stretch" : "flex-start",
        }}
      >
        {/* 左侧：二维码区域 (桌面端) / 上方 (移动端) */}
        <div
          style={{
            flex: isMobile ? "none" : "1",
            order: isMobile ? 1 : 1,
          }}
        >
          <QrCodeSection />
        </div>

        {/* 右侧：充值须知 (桌面端) / 下方 (移动端) */}
        <div
          style={{
            flex: isMobile ? "none" : "1",
            order: isMobile ? 2 : 2,
          }}
        >
          <RechargeInstructions />
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(${theme.space[4]}); 
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
