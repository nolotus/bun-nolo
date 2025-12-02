import { EyeClosedIcon, EyeIcon } from "@primer/octicons-react";
import React, { forwardRef, useState, useEffect, useCallback } from "react";

// --- Types ---

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

// --- Styles (BEM & Design System) ---

const CSS = `
  /* 基础变量与重置 (建议在全局定义，此处作为Fallback) */
  .input {
    --input-radius: var(--space-3, 6px);
    --input-border: var(--border, #e2e8f0);
    --input-bg: var(--background, #ffffff);
    --input-text: var(--text, #1e293b);
    --input-placeholder: var(--text-quaternary, #94a3b8);
    --input-focus: var(--primary, #3b82f6);
    --input-error: var(--error, #ef4444);
    --input-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --input-shadow-inner: inset 0 2px 4px 0 rgba(0,0,0,0.02);
    --transition-smooth: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  /* Label */
  .input__label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--input-text);
    line-height: 1.2;
    margin-bottom: 2px;
    transition: var(--transition-smooth);
  }
  .input__label--error { color: var(--input-error); }

  /* Wrapper */
  .input__wrapper {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
  }
  
  /* Control (Input/Textarea) */
  .input__control {
    width: 100%;
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: var(--input-radius);
    color: var(--input-text);
    font-size: 0.9375rem;
    line-height: 1.5;
    transition: var(--transition-smooth);
    outline: none;
    box-shadow: var(--input-shadow-sm);
    /* 拟物感：微弱的内部光泽 */
    background-image: linear-gradient(to bottom, rgba(255,255,255,1), rgba(255,255,255,0.5)); 
  }

  /* 尺寸修饰符 */
  .input__control--small {
    height: 32px;
    font-size: 0.8125rem;
    padding: 0 12px;
    border-radius: 4px; /* 更纤细的圆角 */
  }
  .input__control--medium {
    height: 40px;
    font-size: 0.875rem;
    padding: 0 14px;
  }
  .input__control--large {
    height: 48px;
    font-size: 1rem;
    padding: 0 16px;
  }

  /* Padding compensation for icons */
  .input__control--has-icon.input__control--small { padding-left: 32px; }
  .input__control--has-icon.input__control--medium { padding-left: 38px; }
  .input__control--has-icon.input__control--large { padding-left: 44px; }
  
  .input__control--has-toggle.input__control--small { padding-right: 32px; }
  .input__control--has-toggle.input__control--medium { padding-right: 38px; }
  .input__control--has-toggle.input__control--large { padding-right: 44px; }

  /* Textarea Specific */
  textarea.input__control {
    min-height: 80px;
    padding: 10px 14px;
    resize: vertical;
  }
  textarea.input__control--auto-resize {
    resize: none;
    overflow-y: hidden;
  }
  textarea.input__control--has-icon { text-indent: 24px; } /* Icon alignment fix for textarea */

  /* 状态交互 */
  .input__control:hover:not(:disabled) {
    border-color: var(--input-text); /* 提高对比度 */
    background-color: #fcfcfc;
  }

  .input__control:focus:not(:disabled) {
    border-color: var(--input-focus);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15), var(--input-shadow-inner); /* 扩散阴影 + 内阴影 */
    transform: translateY(-0.5px); /* 微动效 */
  }

  .input__control--error {
    border-color: var(--input-error);
  }
  .input__control--error:focus {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
  }

  .input__control:disabled {
    background: #f1f5f9;
    color: var(--input-placeholder);
    cursor: not-allowed;
    box-shadow: none;
    border-color: transparent;
  }

  /* Icons */
  .input__icon {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--input-placeholder);
    pointer-events: none;
    z-index: 2;
    transition: var(--transition-smooth);
    left: 12px;
  }
  .input__control:focus ~ .input__icon { color: var(--input-focus); }
  .input__icon--error { color: var(--input-error); }

  /* Password Toggle */
  .input__toggle {
    position: absolute;
    right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--input-placeholder);
    cursor: pointer;
    border-radius: 4px;
    padding: 4px;
    transition: var(--transition-smooth);
  }
  .input__toggle:hover {
    color: var(--input-text);
    background: rgba(0,0,0,0.04);
  }

  /* Helper Text */
  .input__helper {
    font-size: 0.75rem;
    color: var(--input-placeholder);
    margin-left: 1px;
    line-height: 1.4;
  }
  .input__helper--error { color: var(--input-error); }
  
  /* Variant: Filled */
  .input__control--filled {
    background-color: #f8fafc;
    border-color: transparent;
  }
  .input__control--filled:hover:not(:disabled) {
    background-color: #f1f5f9;
  }
  .input__control--filled:focus:not(:disabled) {
    background-color: #fff;
    border-color: var(--input-focus);
  }

  /* Variant: Ghost */
  .input__control--ghost {
    background: transparent;
    border-color: transparent;
    box-shadow: none;
  }
  .input__control--ghost:hover:not(:disabled) {
    background: rgba(0,0,0,0.03);
  }
`;

// --- Components ---

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
    const uniqueId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
    const helperId = helperText ? `${uniqueId}-helper` : undefined;

    // Class Construction using BEM
    const block = "input";
    const controlClasses = [
      `${block}__control`,
      `${block}__control--${size}`,
      `${block}__control--${variant}`,
      error ? `${block}__control--error` : "",
      icon ? `${block}__control--has-icon` : "",
      password ? `${block}__control--has-toggle` : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={`${block} ${className}`} style={style}>
        <style href="ui-input-styles" precedence="medium">
          {CSS}
        </style>

        {label && (
          <label
            htmlFor={uniqueId}
            className={`${block}__label ${error ? `${block}__label--error` : ""}`}
          >
            {label}
          </label>
        )}

        <div className={`${block}__wrapper`}>
          {icon && (
            <span
              className={`${block}__icon ${error ? `${block}__icon--error` : ""}`}
            >
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={uniqueId}
            type={password ? (showPassword ? "text" : "password") : propType}
            className={controlClasses}
            aria-invalid={error}
            aria-describedby={helperId}
            placeholder={props.placeholder}
            {...props}
          />

          {password && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`${block}__toggle`}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={props.disabled}
            >
              {showPassword ? (
                <EyeIcon size={16} />
              ) : (
                <EyeClosedIcon size={16} />
              )}
            </button>
          )}
        </div>

        {helperText && (
          <span
            id={helperId}
            className={`${block}__helper ${error ? `${block}__helper--error` : ""}`}
            role={error ? "alert" : "note"}
          >
            {helperText}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, onChange, decimal = 0, placeholder = "", ...props }, ref) => {
    // 状态与显示值解耦，处理浮点数输入体验
    const [display, setDisplay] = useState("");

    useEffect(() => {
      if (value === undefined || value === null) {
        setDisplay("");
        return;
      }
      // 仅在非输入中状态时同步外部值，防止光标跳动问题（简化版逻辑）
      // 实际生产中可能需要更复杂的焦点判断，这里保持“简洁性”原则
      const formatted =
        decimal > 0
          ? value.toFixed(decimal).replace(/\.?0+$/, "")
          : value.toString();
      // 简单判断：只有当解析后的值不一致时才重置display，允许用户输入 "1."
      if (parseFloat(display) !== value && display !== formatted + ".") {
        setDisplay(formatted === "0" && !value ? "" : formatted);
      }
    }, [value, decimal]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        // 正则允许输入负号、数字和小数点
        const regex = new RegExp(
          `^${raw.startsWith("-") ? "-?" : ""}\\d*(\\.\\d{0,${decimal}})?$`
        );

        if (raw === "" || regex.test(raw)) {
          setDisplay(raw);
          const parsed = parseFloat(raw);
          if (!isNaN(parsed)) {
            onChange(parsed);
          } else if (raw === "") {
            // 处理空值情况，根据业务需求可能需要传 null 或 0，此处保持原有逻辑
            onChange(0);
          }
        }
      },
      [onChange, decimal]
    );

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode={decimal > 0 ? "decimal" : "numeric"}
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
      />
    );
  }
);
NumberInput.displayName = "NumberInput";

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
      rows = 3,
      ...props
    },
    ref
  ) => {
    const uniqueId = id || `textarea-${Math.random().toString(36).slice(2, 9)}`;
    const innerRef = React.useRef<HTMLTextAreaElement | null>(null);

    // 组合 Ref
    const setRef = useCallback(
      (node: HTMLTextAreaElement) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    useEffect(() => {
      if (!autoResize || !innerRef.current) return;
      const el = innerRef.current;
      const adjustHeight = () => {
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight + 2}px`; // +2 for border compensation
      };

      el.addEventListener("input", adjustHeight);
      // 初始化调整
      if (props.value) adjustHeight();

      return () => el.removeEventListener("input", adjustHeight);
    }, [autoResize, props.value]);

    // BEM Class Construction
    const block = "input";
    const controlClasses = [
      `${block}__control`,
      `${block}__control--${size}`,
      `${block}__control--${variant}`,
      error ? `${block}__control--error` : "",
      icon ? `${block}__control--has-icon` : "",
      autoResize ? `${block}__control--auto-resize` : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={`${block} ${className}`} style={style}>
        <style href="ui-input-styles" precedence="medium">
          {CSS}
        </style>
        {label && (
          <label
            htmlFor={uniqueId}
            className={`${block}__label ${error ? `${block}__label--error` : ""}`}
          >
            {label}
          </label>
        )}
        <div className={`${block}__wrapper`}>
          {icon && (
            <span
              className={`${block}__icon ${error ? `${block}__icon--error` : ""}`}
              style={{ top: "12px", transform: "none" }} // 特殊处理 Textarea icon 位置
            >
              {icon}
            </span>
          )}
          <textarea
            ref={setRef}
            id={uniqueId}
            rows={rows}
            className={controlClasses}
            aria-invalid={error}
            aria-describedby={helperText ? `${uniqueId}-helper` : undefined}
            {...props}
          />
        </div>
        {helperText && (
          <span
            id={`${uniqueId}-helper`}
            className={`${block}__helper ${error ? `${block}__helper--error` : ""}`}
          >
            {helperText}
          </span>
        )}
      </div>
    );
  }
);
TextArea.displayName = "TextArea";

export const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<InputProps, "password">
>((props, ref) => <Input {...props} password ref={ref} />);
PasswordInput.displayName = "PasswordInput";
