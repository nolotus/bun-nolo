// web/form/Checkbox.tsx
import { useTheme } from "app/theme";
import type React from "react";
import { forwardRef } from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: boolean;
  size?: "small" | "medium" | "large";
  variant?: "default" | "filled";
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      helperText,
      error = false,
      size = "medium",
      variant = "default",
      className = "",
      style,
      disabled,
      checked,
      id,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();
    const inputId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    const helperTextId = helperText ? `${inputId}-helper` : undefined;

    return (
      <>
        <CheckboxStyles />
        <div className={`checkbox-container ${className}`} style={style}>
          <label
            htmlFor={inputId}
            className={`checkbox-wrapper size-${size} variant-${variant} ${disabled ? "disabled" : ""} ${error ? "error" : ""}`}
          >
            <input
              ref={ref}
              id={inputId}
              type="checkbox"
              className="checkbox-input"
              disabled={disabled}
              checked={checked}
              aria-invalid={error}
              aria-describedby={helperTextId}
              {...props}
            />
            <span className="checkbox-box">
              <span className="checkbox-checkmark" />
            </span>
            {label && <span className="checkbox-label">{label}</span>}
          </label>

          {helperText && (
            <div
              id={helperTextId}
              className={`checkbox-helper ${error ? "error" : "normal"}`}
              role={error ? "alert" : "note"}
            >
              {helperText}
            </div>
          )}
        </div>
      </>
    );
  }
);

const CheckboxStyles = () => {
  const theme = useTheme();

  return (
    <style href="checkbox" precedence="medium">{`
      .checkbox-container {
        display: flex;
        flex-direction: column;
        gap: ${theme.space[1]};
      }

      .checkbox-wrapper {
        display: inline-flex;
        align-items: flex-start;
        position: relative;
        cursor: pointer;
        transition: opacity 0.3s ease;
      }

      .checkbox-wrapper.disabled {
        opacity: 0.6;
        cursor: not-allowed;
        pointer-events: none;
      }

      .checkbox-wrapper.size-small {
        gap: ${theme.space[2]};
        padding: ${theme.space[1]};
      }

      .checkbox-wrapper.size-medium {
        gap: ${theme.space[2]};
        padding: 2px;
      }

      .checkbox-wrapper.size-large {
        gap: ${theme.space[3]};
        padding: ${theme.space[1]};
      }

      .checkbox-input {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
        margin: 0;
      }

      .checkbox-box {
        position: relative;
        border-radius: ${theme.space[1]};
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        background: ${theme.background};
        border: 1.5px solid ${theme.border};
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 1px 3px ${theme.shadow1};
      }

      .checkbox-wrapper.size-small .checkbox-box {
        width: 14px;
        height: 14px;
        border-radius: 3px;
      }

      .checkbox-wrapper.size-medium .checkbox-box {
        width: 16px;
        height: 16px;
        border-radius: ${theme.space[1]};
      }

      .checkbox-wrapper.size-large .checkbox-box {
        width: 18px;
        height: 18px;
        border-radius: 5px;
      }

      .checkbox-wrapper.variant-filled .checkbox-box {
        background: ${theme.backgroundSecondary};
        border-color: ${theme.borderLight};
      }

      .checkbox-wrapper.error .checkbox-box {
        border-color: ${theme.error};
      }

      .checkbox-input:checked + .checkbox-box {
        background: ${theme.primary};
        border-color: ${theme.primary};
        box-shadow: 0 2px 6px ${theme.primary}30, inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }

      .checkbox-wrapper.error .checkbox-input:checked + .checkbox-box {
        background: ${theme.error};
        border-color: ${theme.error};
      }

      .checkbox-checkmark {
        opacity: 0;
        transform: rotate(45deg) scale(0.6);
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border: solid white;
        border-width: 0 2px 2px 0;
      }

      .checkbox-wrapper.size-small .checkbox-checkmark {
        width: 3px;
        height: 6px;
      }

      .checkbox-wrapper.size-medium .checkbox-checkmark {
        width: 4px;
        height: 7px;
      }

      .checkbox-wrapper.size-large .checkbox-checkmark {
        width: 5px;
        height: 8px;
      }

      .checkbox-input:checked + .checkbox-box .checkbox-checkmark {
        opacity: 1;
        transform: rotate(45deg) scale(1);
      }

      .checkbox-wrapper:hover .checkbox-box {
        border-color: ${theme.primary}60;
        transform: scale(1.05);
      }

      .checkbox-wrapper.error:hover .checkbox-box {
        border-color: ${theme.error}60;
      }

      .checkbox-wrapper:hover .checkbox-input:checked + .checkbox-box {
        background: ${theme.primary}90;
        box-shadow: 0 3px 8px ${theme.primary}40, inset 0 1px 0 rgba(255, 255, 255, 0.3);
      }

      .checkbox-wrapper.error:hover .checkbox-input:checked + .checkbox-box {
        background: ${theme.error}90;
      }

      .checkbox-label {
        color: ${theme.textSecondary};
        user-select: none;
        line-height: 1.4;
        letter-spacing: -0.01em;
        margin-top: 1px;
      }

      .checkbox-wrapper.size-small .checkbox-label {
        font-size: 0.8125rem;
      }

      .checkbox-wrapper.size-medium .checkbox-label {
        font-size: 0.875rem;
      }

      .checkbox-wrapper.size-large .checkbox-label {
        font-size: 0.925rem;
      }

      .checkbox-wrapper.error .checkbox-label {
        color: ${theme.error};
      }

      .checkbox-input:focus-visible + .checkbox-box {
        box-shadow: 0 0 0 2px ${theme.background}, 0 0 0 4px ${theme.primary}40;
      }

      .checkbox-wrapper.error .checkbox-input:focus-visible + .checkbox-box {
        box-shadow: 0 0 0 2px ${theme.background}, 0 0 0 4px ${theme.error}40;
      }

      .checkbox-helper {
        font-size: 0.8125rem;
        line-height: 1.4;
        margin-left: calc(16px + ${theme.space[2]} + 2px);
        letter-spacing: -0.01em;
      }

      .checkbox-wrapper.size-small ~ .checkbox-helper {
        margin-left: calc(14px + ${theme.space[2]} + ${theme.space[1]});
      }

      .checkbox-wrapper.size-large ~ .checkbox-helper {
        margin-left: calc(18px + ${theme.space[3]} + ${theme.space[1]});
      }

      .checkbox-helper.error {
        color: ${theme.error};
      }

      .checkbox-helper.normal {
        color: ${theme.textTertiary};
      }

      /* 响应式设计 */
      @media (max-width: 768px) {
        .checkbox-wrapper {
          min-height: 44px;
        }

        .checkbox-box {
          margin-top: 2px;
        }
      }

      /* 高对比度支持 */
      @media (prefers-contrast: high) {
        .checkbox-box {
          border-width: 2px;
        }
        
        .checkbox-input:checked + .checkbox-box {
          border-width: 2px;
        }
      }

      /* 减少动画偏好 */
      @media (prefers-reduced-motion: reduce) {
        .checkbox-box,
        .checkbox-checkmark {
          transition: none;
        }
        
        .checkbox-wrapper:hover .checkbox-box {
          transform: none;
        }
      }
    `}</style>
  );
};

Checkbox.displayName = "Checkbox";

export default Checkbox;
