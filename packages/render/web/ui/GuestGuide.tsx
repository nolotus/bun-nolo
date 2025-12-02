// render/web/ui/GuestGuide.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LuBot, LuLogIn, LuUserPlus } from "react-icons/lu";
import Button from "render/web/ui/Button";

interface GuestGuideProps {
  title?: string;
  description?: string;
}

const GuestGuide = ({ title, description }: GuestGuideProps) => {
  const { t } = useTranslation("common"); // 保持和原代码一致的 namespace 逻辑，或者使用 "common"

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        padding: "var(--space-8)",
        textAlign: "center",
        color: "var(--textSecondary)",
        backgroundColor: "var(--background)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "var(--backgroundSecondary)",
          borderRadius: "var(--space-4)",
          padding: "var(--space-8)",
          boxShadow: "0 10px 30px var(--shadowMedium)", // 稍微优化了阴影以符合设计规范
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "var(--space-6)",
          }}
        >
          {/* 替换为 LuBot */}
          <LuBot size={48} style={{ color: "var(--primary)" }} />
        </div>
        <h2
          style={{
            margin: "0 0 var(--space-4) 0",
            color: "var(--text)",
            fontSize: "24px",
            fontWeight: 600,
          }}
        >
          {title || t("welcomeTitle")}
        </h2>
        <p
          style={{
            margin: "0 0 var(--space-6) 0",
            lineHeight: "1.5",
            fontSize: "16px",
          }}
        >
          {description || t("welcomeHint")}
        </p>
        <div
          style={{
            display: "flex",
            gap: "var(--space-4)",
            justifyContent: "center",
          }}
        >
          <Button
            as={Link}
            to="/login"
            variant="primary"
            style={{
              width: "120px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--space-2)",
            }}
          >
            <LuLogIn size={16} />
            {t("login")}
          </Button>
          <Button
            as={Link}
            to="/signup"
            variant="secondary"
            style={{
              width: "120px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--space-2)",
            }}
          >
            <LuUserPlus size={16} />
            {t("signup")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GuestGuide;
