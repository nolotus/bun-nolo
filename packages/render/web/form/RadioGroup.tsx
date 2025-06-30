import React from "react";
import { useAppSelector } from "app/hooks";
import { selectTheme } from "app/settings/settingSlice";

interface RadioOption {
  id: string;
  value: string;
  label: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  options: RadioOption[];
  value?: string;
  name?: string;
  onChange?: (value: string) => void;
  className?: string;
  label?: string;
  error?: boolean;
  helperText?: string;
  size?: "small" | "medium" | "large";
  direction?: "row" | "column";
  disabled?: boolean;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  name = "radio-group",
  onChange,
  className = "",
  label,
  error = false,
  helperText,
  size = "medium",
  direction = "column",
  disabled = false,
}) => {
  const theme = useAppSelector(selectTheme);

  const handleChange = (newValue: string) => {
    if (disabled) return;
    onChange?.(newValue);
  };

  const groupId = `radio-group-${Math.random().toString(36).substr(2, 9)}`;
  const helperTextId = helperText ? `${groupId}-helper` : undefined;

  return (
    <>
      <style href="radio-group" precedence="medium">{`
        .radio-group {
          display: flex;
          flex-direction: column;
          gap: ${theme.space[1]};
          width: 100%;
        }

        .radio-group-label {
          font-size: 0.875rem;
          font-weight: 550;
          color: ${error ? theme.error : theme.text};
          margin-bottom: ${theme.space[1]};
          letter-spacing: -0.01em;
          line-height: 1.4;
        }

        .radio-options {
          display: flex;
          gap: ${theme.space[2]};
          flex-direction: ${direction === "row" ? "row" : "column"};
          flex-wrap: wrap;
        }

        .radio-option {
          position: relative;
          display: flex;
          align-items: center;
          cursor: pointer;
          font-weight: 500;
          letter-spacing: -0.01em;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          border-radius: ${theme.space[4]};
        }

        .radio-option:hover:not(.disabled) .radio-content {
          background: ${theme.primary}08;
          border-color: ${theme.primary}30;
        }

        .radio-option.disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .radio-input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .radio-content {
          display: flex;
          align-items: center;
          border: 1px solid ${error ? theme.error : theme.border};
          border-radius: ${theme.space[4]};
          background: ${theme.background};
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 1px 3px ${theme.shadow1}, inset 0 1px 0 rgba(255, 255, 255, 0.1);
          padding: ${
            size === "small"
              ? `${theme.space[2]} ${theme.space[3]}`
              : size === "large"
                ? `${theme.space[3]} ${theme.space[5]}`
                : `${theme.space[2]} ${theme.space[4]}`
          };
          gap: ${size === "large" ? theme.space[3] : theme.space[2]};
        }

        .radio-content.selected {
          background: linear-gradient(135deg, ${error ? theme.error : theme.primary}08 0%, ${theme.background} 60%);
          border-color: ${error ? theme.error : theme.primary};
          box-shadow: 
            0 2px 8px ${error ? theme.error : theme.primary}20,
            0 1px 3px ${theme.shadow1},
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .radio-circle {
          flex-shrink: 0;
          width: ${size === "small" ? "16px" : size === "large" ? "24px" : "20px"};
          height: ${size === "small" ? "16px" : size === "large" ? "24px" : "20px"};
          border-radius: 50%;
          border: 2px solid ${error ? theme.error : theme.primary};
          background: ${theme.background};
          position: relative;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 1px 3px ${theme.shadow1}, inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .radio-circle::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0);
          width: ${size === "small" ? "6px" : size === "large" ? "10px" : "8px"};
          height: ${size === "small" ? "6px" : size === "large" ? "10px" : "8px"};
          border-radius: 50%;
          background: ${error ? theme.error : theme.primary};
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .radio-content.selected .radio-circle::after {
          transform: translate(-50%, -50%) scale(1);
        }

        .radio-text {
          color: ${theme.text};
          transition: color 0.3s ease;
          line-height: 1.4;
          font-size: ${size === "small" ? "0.875rem" : size === "large" ? "1rem" : "0.925rem"};
        }

        .radio-content.selected .radio-text {
          color: ${error ? theme.error : theme.primary};
          font-weight: 600;
        }

        .radio-helper {
          font-size: 0.8125rem;
          line-height: 1.4;
          margin-top: ${theme.space[1]};
          letter-spacing: -0.01em;
          color: ${error ? theme.error : theme.textTertiary};
        }

        /* 聚焦状态 */
        .radio-option:focus-within .radio-content {
          box-shadow: 
            0 0 0 3px ${error ? theme.error : theme.primary}20,
            0 2px 8px ${theme.shadow2},
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .radio-options {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .radio-content {
            border-radius: ${theme.space[3]};
          }
        }

        /* 减少动画偏好 */
        @media (prefers-reduced-motion: reduce) {
          .radio-option, .radio-content, .radio-circle, .radio-circle::after, .radio-text {
            transition: none;
          }
        }

        /* 高对比度支持 */
        @media (prefers-contrast: high) {
          .radio-content { border-width: 2px; }
          .radio-circle { border-width: 3px; }
        }
      `}</style>

      <div className={`radio-group ${className}`}>
        {label && <div className="radio-group-label">{label}</div>}

        <div
          className="radio-options"
          role="radiogroup"
          aria-labelledby={label ? groupId : undefined}
          aria-describedby={helperTextId}
          aria-invalid={error}
        >
          {options.map((option) => {
            const isSelected = value === option.value;
            const isOptionDisabled = disabled || option.disabled;

            return (
              <label
                key={option.id}
                className={`radio-option ${isOptionDisabled ? "disabled" : ""}`}
              >
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  onChange={() => handleChange(option.value)}
                  disabled={isOptionDisabled}
                  className="radio-input"
                  aria-describedby={helperTextId}
                />

                <div
                  className={`radio-content ${isSelected ? "selected" : ""}`}
                >
                  <div className="radio-circle" />
                  <span className="radio-text">{option.label}</span>
                </div>
              </label>
            );
          })}
        </div>

        {helperText && (
          <div
            id={helperTextId}
            className="radio-helper"
            role={error ? "alert" : "note"}
          >
            {helperText}
          </div>
        )}
      </div>
    </>
  );
};

export default RadioGroup;
