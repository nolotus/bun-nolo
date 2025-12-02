// components/PageLoading.tsx
import React from "react";
import LoadingSpinner from "./LoadingSpinner";

const PageLoading: React.FC<{ message?: string; minHeight?: string }> = ({
  message = "加载中...",
  minHeight = "60vh",
}) => {
  return (
    <div
      style={{
        minHeight,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        color: "var(--textSecondary)",
        backgroundColor: "var(--background)",
      }}
    >
      <LoadingSpinner />
      {message && (
        <span
          style={{
            fontSize: 14,
            opacity: 0.8,
            fontWeight: 500,
          }}
        >
          {message}
        </span>
      )}
    </div>
  );
};

export default PageLoading;
