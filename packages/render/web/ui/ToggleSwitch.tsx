// render/web/ui/ToggleSwitch.tsx

import { useTheme } from "app/theme";
import type React from "react";
import { useEffect, useState, forwardRef } from "react";

interface ToggleSwitchProps {
  disabled?: boolean;
  loading?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  value?: boolean;
  size?: "small" | "medium" | "large";
  label?: string;
  helperText?: string;
  error?: boolean;
  id?: string;
  className?: string;
}

const ToggleSwitch = forwardRef<HTMLInputElement, ToggleSwitchProps>(
  (
    {
      disabled = false,
      loading = false,
      checked,
      defaultChecked = false,
      onChange,
      ariaLabelledby,
      ariaDescribedby,
      value,
      size = "medium",
      label,
      helperText,
      error = false,
      id,
      className = "",
    },
    ref
  ) => {
    const [isChecked, setIsChecked] = useState<boolean>(
      value ?? defaultChecked
    );

    useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(checked);
      }
    }, [checked]);

    const handleToggle = () => {
      if (!loading && !disabled) {
        const newChecked = !isChecked;
        setIsChecked(newChecked);
        onChange?.(newChecked);
      }
    };

    const inputId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;
    const helperTextId = helperText ? `${inputId}-helper` : undefined;

    return (
      <>
        <ToggleSwitchStyles />
        <div className={`toggle-container ${className}`}>
          {label && (
            <label
              htmlFor={inputId}
              className={`toggle-label ${error ? "error" : ""}`}
            >
              {label}
            </label>
          )}

          <label
            className={`toggle-wrapper size-${size} ${disabled ? "disabled" : ""} ${loading ? "loading" : ""}`}
            aria-labelledby={ariaLabelledby}
            aria-describedby={ariaDescribedby}
            htmlFor={inputId}
          >
            <input
              ref={ref}
              id={inputId}
              type="checkbox"
              className="toggle-input"
              checked={isChecked}
              onChange={handleToggle}
              disabled={disabled || loading}
              aria-describedby={helperTextId}
              aria-invalid={error}
            />

            <div
              className={`toggle-switch ${isChecked ? "checked" : ""} ${error ? "error" : ""}`}
            >
              <span className="toggle-background"></span>
              {!loading ? (
                <span className="toggle-handle"></span>
              ) : (
                <span className="toggle-loading">
                  <LoadingSpinner />
                </span>
              )}
            </div>
          </label>

          {helperText && (
            <div
              id={helperTextId}
              className={`toggle-helper ${error ? "error" : "normal"}`}
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

const LoadingSpinner = () => (
  <svg
    className="spinner"
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
  >
    <circle
      cx="6"
      cy="6"
      r="4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.25"
    />
    <path
      d="M10 6A4 4 0 016 2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const ToggleSwitchStyles = () => {
  return (
    <style href="toggle-switch" precedence="medium">{`
      .toggle-container {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
        width: fit-content;
      }

      .toggle-label {
        font-size: 0.875rem;
        font-weight: 550;
        color: var(--text);
        margin-bottom: var(--space-1);
        letter-spacing: -0.01em;
        line-height: 1.4;
        cursor: pointer;
        user-select: none;
      }

      .toggle-label.error {
        color: var(--error);
      }

      .toggle-wrapper {
        display: inline-block;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .toggle-wrapper.disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      .toggle-wrapper.loading {
        cursor: wait;
      }

      .toggle-switch {
        user-select: none;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        display: inline-block;
        position: relative;
        border-radius: 100px;
        border: 1px solid var(--border);
        background: var(--backgroundSecondary);
        box-shadow: 
          0 1px 3px var(--shadowLight),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }

      /* 尺寸系统 */
      .toggle-wrapper.size-small .toggle-switch {
        height: 20px;
        width: 36px;
      }

      .toggle-wrapper.size-medium .toggle-switch {
        height: 24px;
        width: 44px;
      }

      .toggle-wrapper.size-large .toggle-switch {
        height: 28px;
        width: 52px;
      }

      /* 激活状态 */
      .toggle-switch.checked {
        background: var(--primary);
        border-color: var(--primary);
        box-shadow: 
          0 2px 8px rgba(22, 119, 255, 0.3),
          0 1px 3px var(--shadowLight),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }

      /* 错误状态 */
      .toggle-switch.error {
        border-color: var(--error);
        background: rgba(239, 68, 68, 0.1);
      }

      .toggle-switch.error.checked {
        background: var(--error);
        border-color: var(--error);
      }

      /* 悬浮效果 */
      .toggle-wrapper:hover:not(.disabled):not(.loading) .toggle-switch {
        border-color: rgba(22, 119, 255, 0.4);
        box-shadow: 
          0 2px 6px var(--shadowLight),
          inset 0 1px 0 rgba(255, 255, 255, 0.15);
      }

      .toggle-wrapper:hover:not(.disabled):not(.loading) .toggle-switch.checked {
        box-shadow: 
          0 4px 12px rgba(22, 119, 255, 0.4),
          0 2px 6px var(--shadowMedium),
          inset 0 1px 0 rgba(255, 255, 255, 0.25);
      }

      /* 背景渐变 */
      .toggle-background {
        content: '';
        position: absolute;
        display: block;
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        border-radius: inherit;
        background: linear-gradient(135deg, rgba(22, 119, 255, 0.08) 0%, transparent 50%);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .toggle-switch.checked .toggle-background {
        opacity: 1;
      }

      /* 滑块手柄 */
      .toggle-handle {
        position: absolute;
        display: block;
        top: 50%;
        transform: translateY(-50%);
        border-radius: 50%;
        background: var(--background);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 
          0 1px 3px rgba(0, 0, 0, 0.15),
          0 0 0 1px rgba(0, 0, 0, 0.05),
          inset 0 1px 0 rgba(255, 255, 255, 0.8);
      }

      /* 小尺寸手柄 */
      .toggle-wrapper.size-small .toggle-handle {
        height: 16px;
        width: 16px;
        left: 2px;
      }

      .toggle-wrapper.size-small .toggle-switch.checked .toggle-handle {
        left: 18px;
      }

      /* 中等尺寸手柄 */
      .toggle-wrapper.size-medium .toggle-handle {
        height: 20px;
        width: 20px;
        left: 2px;
      }

      .toggle-wrapper.size-medium .toggle-switch.checked .toggle-handle {
        left: 22px;
      }

      /* 大尺寸手柄 */
      .toggle-wrapper.size-large .toggle-handle {
        height: 24px;
        width: 24px;
        left: 2px;
      }

      .toggle-wrapper.size-large .toggle-switch.checked .toggle-handle {
        left: 26px;
      }

      /* 激活时的手柄样式 */
      .toggle-switch.checked .toggle-handle {
        background: white;
        box-shadow: 
          0 2px 6px rgba(0, 0, 0, 0.2),
          0 0 0 1px rgba(0, 0, 0, 0.05),
          inset 0 1px 0 rgba(255, 255, 255, 1);
      }

      /* 加载状态 */
      .toggle-loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--textSecondary);
      }

      .toggle-switch.checked .toggle-loading {
        color: white;
      }

      .spinner {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      /* 隐藏原生 input */
      .toggle-input {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
        pointer-events: none;
      }

      /* 焦点状态 */
      .toggle-input:focus-visible + .toggle-switch {
        box-shadow: 
          0 0 0 2px var(--background),
          0 0 0 4px var(--primary),
          0 1px 3px var(--shadowLight);
      }

      /* 帮助文本 */
      .toggle-helper {
        font-size: 0.8125rem;
        line-height: 1.4;
        margin-top: var(--space-1);
        letter-spacing: -0.01em;
      }

      .toggle-helper.error {
        color: var(--error);
      }

      .toggle-helper.normal {
        color: var(--textTertiary);
      }

      /* 响应式设计 */
      @media (max-width: 768px) {
        .toggle-wrapper.size-medium .toggle-switch {
          height: 26px;
          width: 46px;
        }

        .toggle-wrapper.size-medium .toggle-handle {
          height: 22px;
          width: 22px;
        }

        .toggle-wrapper.size-medium .toggle-switch.checked .toggle-handle {
          left: 22px;
        }
      }

      /* 高对比度支持 */
      @media (prefers-contrast: high) {
        .toggle-switch {
          border-width: 2px;
        }
        
        .toggle-handle {
          border: 1px solid var(--border);
        }
      }

      /* 减少动画偏好 */
      @media (prefers-reduced-motion: reduce) {
        .toggle-switch,
        .toggle-handle,
        .toggle-background {
          transition: none;
        }
        
        .spinner {
          animation: none;
        }
        
        .spinner::after {
          content: '...';
        }
      }

      /* 触摸设备优化 */
      @media (hover: none) and (pointer: coarse) {
        .toggle-wrapper {
          /* 增大触摸区域 */
          padding: var(--space-1);
          margin: calc(-1 * var(--space-1));
        }
        
        .toggle-wrapper:hover:not(.disabled):not(.loading) .toggle-switch {
          /* 移除悬浮效果 */
          border-color: var(--border);
          box-shadow: 
            0 1px 3px var(--shadowLight),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
      }
    `}</style>
  );
};

ToggleSwitch.displayName = "ToggleSwitch";

export default ToggleSwitch;
