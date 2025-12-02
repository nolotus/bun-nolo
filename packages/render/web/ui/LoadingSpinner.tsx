// components/LoadingSpinner.tsx
import React from "react";

const spinKeyframes = `
  @keyframes loadingSpin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingSpinner: React.FC<{ size?: number }> = ({ size = 30 }) => (
  <>
    {/* 注入一次简单的 keyframes */}
    <style>{spinKeyframes}</style>
    <div
      style={{
        border: "4px solid var(--backgroundTertiary)",
        borderLeftColor: "var(--primary)",
        borderRadius: "50%",
        width: size,
        height: size,
        animation: "loadingSpin 1s linear infinite",
      }}
    />
  </>
);

export default LoadingSpinner;
