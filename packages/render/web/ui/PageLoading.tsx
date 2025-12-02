import React from "react";

const PageLoading: React.FC<{ message?: string; minHeight?: string }> = ({
  message = "加载资源中...",
  minHeight = "60vh",
}) => {
  return (
    <div className="page-loading" style={{ minHeight }}>
      <div className="spinner" />
      <span className="message">{message}</span>

      <style href="page-loading" precedence="medium">{`
        .page-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          color: var(--textSecondary);
          gap: 16px;
        }
        .spinner {
          width: 32px;
          height: 32px;
          border: 2px solid var(--border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: pageLoadingSpin 0.8s linear infinite;
        }
        .message {
          font-size: 14px;
          opacity: 0.8;
          font-weight: 500;
        }
        @keyframes pageLoadingSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PageLoading;
