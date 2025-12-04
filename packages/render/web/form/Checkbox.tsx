// web/form/Checkbox.tsx
import type React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: boolean;
  variant?: "default" | "filled";

  // React 19: ref 作为普通 prop 传入
  ref?: React.Ref<HTMLInputElement>;
}

export const Checkbox = ({
  label,
  helperText,
  error = false,
  variant = "default",
  className = "",
  style,
  disabled,
  checked,
  id,
  ref,
  ...props
}: CheckboxProps) => {
  const inputId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  const helperTextId = helperText ? `${inputId}-helper` : undefined;

  return (
    <>
      <CheckboxStyles />
      <div className={`checkbox-container ${className}`} style={style}>
        <label
          htmlFor={inputId}
          className={[
            "checkbox-wrapper",
            `variant-${variant}`,
            disabled ? "disabled" : "",
            error ? "error" : "",
          ]
            .filter(Boolean)
            .join(" ")}
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
};

const CheckboxStyles = () => {
  return (
    <style href="checkbox" precedence="medium">{`
      .checkbox-container {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
      }

      .checkbox-wrapper {
        display: inline-flex;
        align-items: flex-start;
        position: relative;
        cursor: pointer;
        transition: opacity 0.3s ease;
        gap: var(--space-2);
        padding: 2px;
      }

      .checkbox-wrapper.disabled {
        opacity: 0.6;
        cursor: not-allowed;
        pointer-events: none;
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
        border-radius: var(--space-1);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        background: var(--background);
        border: 1.5px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 1px 3px var(--shadowLight);
        width: 16px;
        height: 16px;
      }

      .checkbox-wrapper.variant-filled .checkbox-box {
        background: var(--backgroundSecondary);
        border-color: var(--borderLight);
      }

      .checkbox-wrapper.error .checkbox-box {
        border-color: var(--error);
      }

      .checkbox-input:checked + .checkbox-box {
        background: var(--primary);
        border-color: var(--primary);
        box-shadow:
          0 2px 6px color-mix(in srgb, var(--primary) 30%, transparent),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }

      .checkbox-wrapper.error .checkbox-input:checked + .checkbox-box {
        background: var(--error);
        border-color: var(--error);
      }

      .checkbox-checkmark {
        opacity: 0;
        transform: rotate(45deg) scale(0.6);
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border: solid white;
        border-width: 0 2px 2px 0;
        width: 4px;
        height: 7px;
      }

      .checkbox-input:checked + .checkbox-box .checkbox-checkmark {
        opacity: 1;
        transform: rotate(45deg) scale(1);
      }

      .checkbox-wrapper:hover .checkbox-box {
        border-color: color-mix(in srgb, var(--primary) 60%, transparent);
        transform: scale(1.05);
      }

      .checkbox-wrapper.error:hover .checkbox-box {
        border-color: color-mix(in srgb, var(--error) 60%, transparent);
      }

      .checkbox-wrapper:hover .checkbox-input:checked + .checkbox-box {
        background: color-mix(in srgb, var(--primary) 90%, transparent);
        box-shadow:
          0 3px 8px color-mix(in srgb, var(--primary) 40%, transparent),
          inset 0 1px 0 rgba(255, 255, 255, 0.3);
      }

      .checkbox-wrapper.error:hover .checkbox-input:checked + .checkbox-box {
        background: color-mix(in srgb, var(--error) 90%, transparent);
      }

      .checkbox-label {
        color: var(--textSecondary);
        user-select: none;
        line-height: 1.4;
        letter-spacing: -0.01em;
        margin-top: 1px;
        font-size: 0.875rem;
      }

      .checkbox-wrapper.error .checkbox-label {
        color: var(--error);
      }

      .checkbox-input:focus-visible + .checkbox-box {
        box-shadow:
          0 0 0 2px var(--background),
          0 0 0 4px color-mix(in srgb, var(--primary) 40%, transparent);
      }

      .checkbox-wrapper.error .checkbox-input:focus-visible + .checkbox-box {
        box-shadow:
          0 0 0 2px var(--background),
          0 0 0 4px color-mix(in srgb, var(--error) 40%, transparent);
      }

      .checkbox-helper {
        font-size: 0.8125rem;
        line-height: 1.4;
        margin-left: calc(16px + var(--space-2) + 2px);
        letter-spacing: -0.01em;
      }

      .checkbox-helper.error {
        color: var(--error);
      }

      .checkbox-helper.normal {
        color: var(--textTertiary);
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
