// web/form/Input.tsx
import { EyeClosedIcon, EyeIcon } from "@primer/octicons-react";
import type React from "react";
import { forwardRef, useState, useEffect, useCallback } from "react";

export interface BaseInputProps {
  icon?: React.ReactNode;
  error?: boolean;
  helperText?: string;
  label?: string;
  size?: "small" | "medium" | "large";
  variant?: "default" | "filled" | "ghost";
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    BaseInputProps {
  password?: boolean;
}

export interface NumberInputProps
  extends Omit<InputProps, "onChange" | "type" | "value"> {
  value?: number;
  onChange: (value: number) => void;
  decimal?: number;
}

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    BaseInputProps {
  autoResize?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      icon,
      error,
      helperText,
      label,
      size = "medium",
      variant = "default",
      password = false,
      type: propType,
      className = "",
      style,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const inputType = password
      ? showPassword
        ? "text"
        : "password"
      : propType;
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const helperTextId = helperText ? `${inputId}-helper` : undefined;

    return (
      <>
        <InputStyles />
        <div className={`input-container ${className}`} style={style}>
          {label && (
            <label
              htmlFor={inputId}
              className={`input-label ${error ? "error" : ""}`}
            >
              {label}
            </label>
          )}

          <div className="input-wrapper">
            {icon && (
              <div
                className={`input-icon size-${size} ${error ? "error" : ""}`}
              >
                {icon}
              </div>
            )}

            <input
              ref={ref}
              id={inputId}
              type={inputType}
              className={`input-field size-${size} variant-${variant} ${error ? "error" : ""} ${
                icon ? "has-icon" : ""
              } ${password ? "has-password" : ""} ${!icon && !password ? "has-none" : ""}`}
              aria-invalid={error}
              aria-describedby={helperTextId}
              {...props}
            />

            {password && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`password-toggle size-${size} ${error ? "error" : ""}`}
                aria-label={showPassword ? "隐藏密码" : "显示密码"}
                disabled={props.disabled}
              >
                {showPassword ? (
                  <EyeClosedIcon
                    size={size === "small" ? 14 : size === "large" ? 18 : 16}
                  />
                ) : (
                  <EyeIcon
                    size={size === "small" ? 14 : size === "large" ? 18 : 16}
                  />
                )}
              </button>
            )}
          </div>

          {helperText && (
            <div
              id={helperTextId}
              className={`input-helper ${error ? "error" : "normal"}`}
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

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, onChange, decimal = 0, placeholder = "", ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState("");

    useEffect(() => {
      if (value === undefined || value === 0) {
        setDisplayValue("");
      } else {
        const formatted =
          decimal > 0
            ? value.toFixed(decimal).replace(/\.?0+$/, "")
            : value.toString();
        setDisplayValue(formatted);
      }
    }, [value, decimal]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const pattern = new RegExp(
          `^${raw.startsWith("-") ? "-?" : ""}\\d*(\\.\\d{0,${decimal}})?$`
        );

        if (raw === "" || pattern.test(raw)) {
          setDisplayValue(raw);
          const numericValue = parseFloat(raw) || 0;
          onChange(numericValue);
        }
      },
      [onChange, decimal]
    );

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={value === undefined || value === 0 ? placeholder : ""}
        inputMode={decimal > 0 ? "decimal" : "numeric"}
      />
    );
  }
);

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      icon,
      error,
      helperText,
      label,
      size = "medium",
      variant = "default",
      autoResize = false,
      className = "",
      style,
      id,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const [internalRef, setInternalRef] = useState<HTMLTextAreaElement | null>(
      null
    );

    const textareaRef = useCallback(
      (node: HTMLTextAreaElement) => {
        setInternalRef(node);
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    useEffect(() => {
      if (autoResize && internalRef) {
        const adjustHeight = () => {
          internalRef.style.height = "auto";
          internalRef.style.height = `${internalRef.scrollHeight}px`;
        };

        adjustHeight();
        internalRef.addEventListener("input", adjustHeight);
        return () => internalRef.removeEventListener("input", adjustHeight);
      }
    }, [autoResize, internalRef, props.value]);

    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const helperTextId = helperText ? `${inputId}-helper` : undefined;

    return (
      <>
        <InputStyles />
        <div className={`input-container ${className}`} style={style}>
          {label && (
            <label
              htmlFor={inputId}
              className={`input-label ${error ? "error" : ""}`}
            >
              {label}
            </label>
          )}

          <div className="textarea-wrapper">
            {icon && (
              <div
                className={`textarea-icon size-${size} ${error ? "error" : ""}`}
              >
                {icon}
              </div>
            )}

            <textarea
              ref={textareaRef}
              id={inputId}
              rows={rows}
              className={`textarea-field size-${size} variant-${variant} ${error ? "error" : ""} ${
                icon ? "has-icon" : "has-none"
              } ${autoResize ? "auto-resize" : ""}`}
              aria-invalid={error}
              aria-describedby={helperTextId}
              {...props}
            />
          </div>

          {helperText && (
            <div
              id={helperTextId}
              className={`input-helper ${error ? "error" : "normal"}`}
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

const InputStyles = () => {
  return (
    <style href="input" precedence="medium">{`
      .input-container {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
        width: 100%;
      }

      .input-label {
        font-size: 0.875rem;
        font-weight: 550;
        color: var(--text);
        margin-bottom: var(--space-1);
        letter-spacing: -0.01em;
        line-height: 1.4;
      }

      .input-label.error {
        color: var(--error);
      }

      .input-wrapper, .textarea-wrapper {
        position: relative;
        width: 100%;
        display: flex;
        align-items: flex-start;
      }

      .input-field, .textarea-field {
        width: 100%;
        border-radius: var(--space-3);
        border: 1px solid var(--border);
        font-size: 0.925rem;
        font-weight: 500;
        color: var(--text);
        background: var(--background);
        outline: none;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif;
        letter-spacing: -0.01em;
        line-height: 1.4;
        box-shadow: 0 1px 3px var(--shadowLight), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }

      .input-field.error, .textarea-field.error {
        border-color: var(--error);
      }

      /* 尺寸系统 */
      .input-field.size-small {
        height: 36px;
        border-radius: var(--space-2);
        font-size: 0.875rem;
      }

      .input-field.size-small.has-icon { padding: 0 var(--space-3) 0 40px; }
      .input-field.size-small.has-password { padding: 0 40px 0 var(--space-3); }
      .input-field.size-small.has-icon.has-password { padding: 0 40px 0 40px; }
      .input-field.size-small.has-none { padding: 0 var(--space-3); }

      .input-field.size-medium {
        height: 42px;
        font-size: 0.925rem;
      }

      .input-field.size-medium.has-icon { padding: 0 var(--space-4) 0 44px; }
      .input-field.size-medium.has-password { padding: 0 44px 0 var(--space-4); }
      .input-field.size-medium.has-icon.has-password { padding: 0 44px 0 44px; }
      .input-field.size-medium.has-none { padding: 0 var(--space-4); }

      .input-field.size-large {
        height: 48px;
        font-size: 1rem;
        border-radius: var(--space-4);
      }

      .input-field.size-large.has-icon { padding: 0 var(--space-5) 0 48px; }
      .input-field.size-large.has-password { padding: 0 48px 0 var(--space-5); }
      .input-field.size-large.has-icon.has-password { padding: 0 48px 0 48px; }
      .input-field.size-large.has-none { padding: 0 var(--space-5); }

      /* 文本域 */
      .textarea-field {
        min-height: 100px;
        resize: vertical;
      }

      .textarea-field.size-small {
        min-height: 80px;
        padding: var(--space-2) var(--space-3);
        font-size: 0.875rem;
        border-radius: var(--space-2);
      }

      .textarea-field.size-small.has-icon { padding: var(--space-2) var(--space-3) var(--space-2) 40px; }

      .textarea-field.size-medium {
        min-height: 100px;
        padding: var(--space-3) var(--space-4);
      }

      .textarea-field.size-medium.has-icon { padding: var(--space-3) var(--space-4) var(--space-3) 44px; }

      .textarea-field.size-large {
        min-height: 120px;
        padding: var(--space-4) var(--space-5);
        font-size: 1rem;
        border-radius: var(--space-4);
      }

      .textarea-field.size-large.has-icon { padding: var(--space-4) var(--space-5) var(--space-4) 48px; }

      .textarea-field.auto-resize {
        resize: none;
        overflow-y: hidden;
      }

      /* 变体样式 */
      .variant-filled {
        background: var(--backgroundSecondary);
        border-color: var(--borderLight);
      }

      .variant-ghost {
        background: transparent;
        border-color: var(--borderLight);
        box-shadow: none;
      }

      /* 交互状态 */
      .input-field:hover:not(:disabled), .textarea-field:hover:not(:disabled) {
        border-color: var(--hover);
        box-shadow: 0 2px 6px var(--shadowLight), inset 0 1px 0 rgba(255, 255, 255, 0.15);
      }

      .input-field:focus:not(:disabled), .textarea-field:focus:not(:disabled) {
        border-color: var(--primary);
        box-shadow: 0 0 0 3px var(--focus), 0 2px 8px var(--shadowMedium), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        transform: translateY(-1px);
      }

      .input-field.error:focus:not(:disabled), .textarea-field.error:focus:not(:disabled) {
        border-color: var(--error);
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2), 0 2px 8px rgba(239, 68, 68, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }

      .input-field:focus:not(:disabled) ~ .input-icon, .textarea-field:focus:not(:disabled) ~ .textarea-icon {
        color: var(--primary);
        transform: translateY(-50%) scale(1.05);
      }

      .input-field:focus:not(:disabled) ~ .password-toggle {
        color: var(--primary);
      }

      /* 禁用状态 */
      .input-field:disabled, .textarea-field:disabled {
        background: var(--backgroundTertiary);
        color: var(--textQuaternary);
        cursor: not-allowed;
        opacity: 0.6;
        box-shadow: none;
      }

      /* 图标样式 */
      .input-icon, .textarea-icon {
        position: absolute;
        color: var(--textSecondary);
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 1;
      }

      .input-icon {
        top: 50%;
        transform: translateY(-50%);
      }

      .textarea-icon {
        top: var(--space-3);
        left: 50%;
        transform: translateX(-50%);
      }

      .input-icon.size-small, .textarea-icon.size-small {
        left: var(--space-3);
        width: 16px;
        height: 16px;
      }

      .input-icon.size-medium, .textarea-icon.size-medium {
        left: var(--space-4);
        width: 18px;
        height: 18px;
      }

      .input-icon.size-large, .textarea-icon.size-large {
        left: var(--space-5);
        width: 20px;
        height: 20px;
      }

      .input-icon.error, .textarea-icon.error {
        color: var(--error);
      }

      /* 密码切换按钮 */
      .password-toggle {
        position: absolute;
        right: var(--space-2);
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: var(--textSecondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--space-1);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 2;
      }

      .password-toggle.size-small { width: 28px; height: 28px; }
      .password-toggle.size-medium { width: 32px; height: 32px; }
      .password-toggle.size-large { width: 36px; height: 36px; }

      .password-toggle:hover:not(:disabled) {
        color: var(--text);
        background: var(--backgroundHover);
      }

      .password-toggle:focus-visible {
        outline: none;
        box-shadow: 0 0 0 2px var(--focus);
        color: var(--primary);
      }

      .password-toggle.error {
        color: var(--error);
      }

      /* 帮助文本 */
      .input-helper {
        font-size: 0.8125rem;
        line-height: 1.4;
        margin-top: var(--space-1);
        letter-spacing: -0.01em;
      }

      .input-helper.error {
        color: var(--error);
      }

      .input-helper.normal {
        color: var(--textTertiary);
      }

      /* 占位符 */
      .input-field::placeholder, .textarea-field::placeholder {
        color: var(--placeholder);
        opacity: 1;
        transition: opacity 0.3s ease;
      }

      .input-field:focus::placeholder, .textarea-field:focus::placeholder {
        opacity: 0.6;
      }

      /* 响应式 */
      @media (max-width: 768px) {
        .input-field.size-medium, .textarea-field.size-medium {
          font-size: 1rem;
        }

        .input-field.size-medium {
          height: 44px;
        }

        .password-toggle {
          min-width: 44px;
          min-height: 44px;
        }
      }

      @media (max-width: 480px) {
        .input-field, .textarea-field {
          border-radius: var(--space-2);
        }

        .input-field.size-large, .textarea-field.size-large {
          border-radius: var(--space-3);
        }
      }

      /* 减少动画偏好 */
      @media (prefers-reduced-motion: reduce) {
        .input-field, .textarea-field, .input-icon, .textarea-icon, .password-toggle {
          transition: border-color 0.1s ease, box-shadow 0.1s ease, color 0.1s ease;
        }
        
        .input-field:focus:not(:disabled), .textarea-field:focus:not(:disabled) {
          transform: none;
        }
      }
    `}</style>
  );
};

export const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<InputProps, "password">
>((props, ref) => <Input {...props} password ref={ref} />);

Input.displayName = "Input";
NumberInput.displayName = "NumberInput";
TextArea.displayName = "TextArea";
PasswordInput.displayName = "PasswordInput";
