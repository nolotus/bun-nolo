// create/space/components/EmptyState.tsx
import React from "react";
import { useTheme } from "app/theme";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: React.ReactNode;
  onAction?: () => void;
  secondaryAction?: {
    text: string;
    onClick: () => void;
  };
  size?: "small" | "medium" | "large";
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  secondaryAction,
  size = "medium",
}) => {
  const theme = useTheme();

  // 根据size调整样式大小
  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          iconSize: "64px",
          iconFontSize: "24px",
          titleSize: "18px",
          descriptionSize: "14px",
          padding: "40px 20px",
        };
      case "large":
        return {
          iconSize: "96px",
          iconFontSize: "40px",
          titleSize: "24px",
          descriptionSize: "16px",
          padding: "80px 24px",
        };
      default: // medium
        return {
          iconSize: "80px",
          iconFontSize: "32px",
          titleSize: "20px",
          descriptionSize: "15px",
          padding: "60px 24px",
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <div className="empty-state">
      <div className="empty-icon-container">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>

      {(actionText || secondaryAction) && (
        <div className="actions">
          {actionText && onAction && (
            <button className="primary-action" onClick={onAction}>
              {actionText}
            </button>
          )}

          {secondaryAction && (
            <button
              className="secondary-action"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.text}
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: ${sizeStyles.padding};
          text-align: center;
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .empty-icon-container {
          width: ${sizeStyles.iconSize};
          height: ${sizeStyles.iconSize};
          background: ${theme.backgroundSecondary};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          color: ${theme.textTertiary};
          font-size: ${sizeStyles.iconFontSize};
          transition: all 0.2s;
        }

        .empty-state:hover .empty-icon-container {
          background: ${theme.primaryLight};
          color: ${theme.primary};
          transform: scale(1.05);
        }

        h3 {
          font-size: ${sizeStyles.titleSize};
          font-weight: 600;
          color: ${theme.text};
          margin: 0 0 8px 0;
        }

        p {
          font-size: ${sizeStyles.descriptionSize};
          color: ${theme.textSecondary};
          margin: 0 0 24px 0;
          max-width: 400px;
          line-height: 1.5;
        }

        .actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .primary-action {
          padding: 10px 20px;
          background: ${theme.primary};
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .primary-action:hover {
          background: ${theme.primaryDark};
          transform: translateY(-2px);
          box-shadow: 0 2px 8px ${theme.shadowLight};
        }

        .secondary-action {
          padding: 10px 20px;
          background: ${theme.backgroundTertiary};
          color: ${theme.textSecondary};
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .secondary-action:hover {
          background: ${theme.backgroundSelected};
          color: ${theme.text};
        }

        @media (max-width: 640px) {
          h3 {
            font-size: calc(${sizeStyles.titleSize} - 2px);
          }

          p {
            font-size: calc(${sizeStyles.descriptionSize} - 1px);
          }

          .actions {
            flex-direction: column;
            width: 100%;
            max-width: 280px;
          }

          .primary-action,
          .secondary-action {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default EmptyState;
