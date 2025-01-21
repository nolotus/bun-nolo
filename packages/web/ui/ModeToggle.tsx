// web/ui/ModeToggle.tsx
import { useTheme } from "app/theme";
import { PencilIcon, EyeIcon } from "@primer/octicons-react";
import type React from "react";

interface ModeToggleProps {
  isEdit: boolean;
  onChange: (isEdit: boolean) => void;
  disabled?: boolean;
}

const ModeToggle: React.FC<ModeToggleProps> = ({
  isEdit,
  onChange,
  disabled = false,
}) => {
  const theme = useTheme();

  return (
    <>
      <div className="mode-toggle">
        <div className="slider-track" />
        <div className={`active-slider ${isEdit ? "edit" : ""}`} />
        <button
          className={`toggle-button ${!isEdit ? "active" : ""}`}
          onClick={() => onChange(false)}
          disabled={disabled}
          type="button"
          aria-label="阅读模式"
        >
          <EyeIcon size={16} />
        </button>
        <button
          className={`toggle-button ${isEdit ? "active" : ""}`}
          onClick={() => onChange(true)}
          disabled={disabled}
          type="button"
          aria-label="编辑模式"
        >
          <PencilIcon size={16} />
        </button>
      </div>

      <style>{`
        .mode-toggle {
          position: relative;
          display: flex;
          background: ${theme.backgroundSecondary};
          padding: 2px;
          border-radius: 8px;
          gap: 2px;
          border: 1px solid ${theme.border};
        }

        .slider-track {
          position: absolute;
          top: 2px;
          left: 2px;
          right: 2px;
          bottom: 2px;
          border-radius: 6px;
        }

        .active-slider {
          position: absolute;
          width: calc(50% - 2px);
          top: 2px;
          bottom: 2px;
          left: 2px;
          background: ${theme.background};
          border-radius: 6px;
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 3px ${theme.shadowLight};
        }

        .active-slider.edit {
          transform: translateX(100%);
        }

        .toggle-button {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          padding: 6px;
          border-radius: 6px;
          color: ${theme.textSecondary};
          cursor: pointer;
          transition: all 0.15s ease;
          width: 32px;
          height: 32px;
        }

        .toggle-button:hover:not(:disabled) {
          color: ${theme.textPrimary};
        }

        .toggle-button.active {
          color: ${theme.primary};
        }

        .toggle-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .mode-toggle:hover .active-slider {
          background: ${theme.backgroundTertiary};
        }
      `}</style>
    </>
  );
};

export default ModeToggle;
