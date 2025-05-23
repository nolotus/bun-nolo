import { GoPlus } from "react-icons/go";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";

interface CreateSpaceButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const CreateSpaceButton = ({
  onClick,
  disabled = false,
}: CreateSpaceButtonProps) => {
  const theme = useTheme();
  const { t } = useTranslation("space");

  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <button
      type="button"
      className={`space-create-button ${disabled ? "is-disabled" : ""}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={t("create")}
      disabled={disabled}
    >
      <GoPlus size={14} />
      <span>{t("create")}</span>

      <style>{`
        .space-create-button {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          margin: 2px 0;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: ${theme.textSecondary};
          font-size: 13px;
          font-weight: 400;
          cursor: pointer;
          transition: all 0.15s ease;
          outline: none;
          min-height: 32px;
        }

        .space-create-button:hover {
          background: ${theme.backgroundHover};
          color: ${theme.text};
        }

        .space-create-button:focus-visible {
          background: ${theme.backgroundHover};
          color: ${theme.text};
          box-shadow: 0 0 0 1px ${theme.primary};
        }

        .space-create-button:active {
          transform: scale(0.98);
        }

        .space-create-button.is-disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </button>
  );
};
