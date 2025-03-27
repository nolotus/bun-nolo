import React from "react";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";

export type SaveStatus = "saving" | "saved" | "error" | "pending" | null;

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  lastSaved: string | null;
  onRetry: () => void;
  hasPendingChanges: boolean;
}

const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = React.memo(
  ({ status, lastSaved, onRetry, hasPendingChanges }) => {
    const theme = useAppSelector(selectTheme);

    // 当 hasPendingChanges 为 true 且没有其他状态时，显示 pending 状态
    const effectiveStatus = status || (hasPendingChanges ? "pending" : null);

    if (!effectiveStatus && !lastSaved) return null;

    return (
      <div className="page-save-status-indicator">
        {effectiveStatus === "saving" && (
          <div className="page-status-content">
            <div className="page-status-spinner"></div>
            <span>正在保存...</span>
          </div>
        )}

        {effectiveStatus === "saved" && (
          <div className="page-status-content">
            <FaCheckCircle size={14} color={theme.success} />
            <span>已保存</span>
          </div>
        )}

        {effectiveStatus === "pending" && (
          <div className="page-status-content page-status-pending">
            <div className="page-status-pending-dot"></div>
            <span>有未保存的更改</span>
          </div>
        )}

        {effectiveStatus === "error" && (
          <div className="page-status-content page-status-error">
            <FaExclamationCircle size={14} color={theme.error} />
            <span>保存失败</span>
            <button onClick={onRetry} className="page-status-retry-button">
              重试
            </button>
          </div>
        )}

        {!effectiveStatus && lastSaved && (
          <div className="page-status-content">
            <span className="page-status-last-saved-time">
              上次保存: {lastSaved}
            </span>
          </div>
        )}

        <style jsx>{`
          .page-save-status-indicator {
            position: fixed;
            bottom: 16px;
            right: 16px;
            padding: 8px 12px;
            background-color: ${theme.backgroundSecondary};
            border-radius: 6px;
            font-size: 12px;
            box-shadow: 0 2px 8px ${theme.shadowLight};
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
          }

          .page-status-content {
            display: flex;
            align-items: center;
            gap: 6px;
            color: ${theme.textSecondary};
          }

          .page-status-content.page-status-pending {
            color: ${theme.warning || "#faad14"};
          }

          .page-status-content.page-status-error {
            color: ${theme.error};
          }

          .page-status-last-saved-time {
            color: ${theme.textTertiary};
          }

          .page-status-spinner {
            width: 14px;
            height: 14px;
            border: 2px solid transparent;
            border-top-color: ${theme.primary};
            border-radius: 50%;
            animation: statusSpinnerRotate 0.8s linear infinite;
          }

          .page-status-pending-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: ${theme.warning || "#faad14"};
            animation: statusPendingPulse 2s infinite;
          }

          .page-status-retry-button {
            margin-left: 6px;
            background: transparent;
            border: none;
            color: ${theme.link};
            cursor: pointer;
            text-decoration: underline;
            padding: 0;
            font-size: 12px;
          }

          .page-status-retry-button:hover {
            color: ${theme.linkHover};
          }

          @keyframes statusSpinnerRotate {
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes statusPendingPulse {
            0% {
              transform: scale(0.95);
              opacity: 0.7;
            }
            50% {
              transform: scale(1.05);
              opacity: 1;
            }
            100% {
              transform: scale(0.95);
              opacity: 0.7;
            }
          }
        `}</style>
      </div>
    );
  }
);

export default SaveStatusIndicator;
