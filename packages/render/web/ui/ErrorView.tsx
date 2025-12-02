// render/web/ui/ErrorView.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { LuTriangleAlert } from "react-icons/lu";

interface ErrorViewProps {
  error: any;
}

const ErrorView = ({ error }: ErrorViewProps) => {
  const { t } = useTranslation("common");
  return (
    <div
      style={{
        display: "flex", // 增加 flex 居中，比原版单纯 text-align 更好
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: "var(--space-5)",
        color: "var(--error)",
        textAlign: "center",
        gap: "var(--space-2)",
      }}
    >
      <LuTriangleAlert size={24} />
      <div>
        {t("errors.loadingMessages")}: {error?.message || String(error)}
      </div>
    </div>
  );
};

export default ErrorView;
