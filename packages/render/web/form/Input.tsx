import { EyeClosedIcon, EyeIcon } from "@primer/octicons-react";
import React, { forwardRef, useState, useEffect, useCallback } from "react";

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

const CSS = `
  .input-container { display: flex; flex-direction: column; gap: var(--space-1); width: 100%; }
  .input-label { font-size: 0.875rem; font-weight: 550; color: var(--text); margin-bottom: var(--space-1); letter-spacing: -0.01em; line-height: 1.4; }
  .input-label.error { color: var(--error); }
  .input-wrapper, .textarea-wrapper { position: relative; width: 100%; display: flex; align-items: flex-start; }
  .input-field, .textarea-field { width: 100%; border-radius: var(--space-3); border: 1px solid var(--border); font-size: 0.925rem; font-weight: 500; color: var(--text); background: var(--background); outline: none; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; letter-spacing: -0.01em; line-height: 1.4; box-shadow: 0 1px 3px var(--shadowLight), inset 0 1px 0 rgba(255, 255, 255, 0.1); }
  .input-field.error, .textarea-field.error { border-color: var(--error); }
  
  .input-field.size-small { height: 36px; border-radius: var(--space-2); font-size: 0.875rem; padding: 0 var(--space-3); }
  .input-field.size-small.has-icon { padding-left: 40px; }
  .input-field.size-small.has-password { padding-right: 40px; }
  .input-field.size-medium { height: 42px; font-size: 0.925rem; padding: 0 var(--space-4); }
  .input-field.size-medium.has-icon { padding-left: 44px; }
  .input-field.size-medium.has-password { padding-right: 44px; }
  .input-field.size-large { height: 48px; font-size: 1rem; border-radius: var(--space-4); padding: 0 var(--space-5); }
  .input-field.size-large.has-icon { padding-left: 48px; }
  .input-field.size-large.has-password { padding-right: 48px; }

  .textarea-field { min-height: 100px; resize: vertical; padding: var(--space-3) var(--space-4); }
  .textarea-field.size-small { min-height: 80px; padding: var(--space-2) var(--space-3); font-size: 0.875rem; border-radius: var(--space-2); }
  .textarea-field.size-small.has-icon { padding-left: 40px; }
  .textarea-field.size-medium.has-icon { padding-left: 44px; }
  .textarea-field.size-large { min-height: 120px; padding: var(--space-4) var(--space-5); font-size: 1rem; border-radius: var(--space-4); }
  .textarea-field.size-large.has-icon { padding-left: 48px; }
  .textarea-field.auto-resize { resize: none; overflow-y: hidden; }

  .variant-filled { background: var(--backgroundSecondary); border-color: var(--borderLight); }
  .variant-ghost { background: transparent; border-color: var(--borderLight); box-shadow: none; }
  
  .input-field:hover:not(:disabled), .textarea-field:hover:not(:disabled) { border-color: var(--hover); box-shadow: 0 2px 6px var(--shadowLight), inset 0 1px 0 rgba(255, 255, 255, 0.15); }
  .input-field:focus:not(:disabled), .textarea-field:focus:not(:disabled) { border-color: var(--primary); box-shadow: 0 0 0 3px var(--focus), 0 2px 8px var(--shadowMedium), inset 0 1px 0 rgba(255, 255, 255, 0.2); transform: translateY(-1px); }
  .input-field.error:focus:not(:disabled), .textarea-field.error:focus:not(:disabled) { border-color: var(--error); box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2), 0 2px 8px rgba(239, 68, 68, 0.15); }
  
  .input-field:focus:not(:disabled) ~ .input-icon, .textarea-field:focus:not(:disabled) ~ .textarea-icon { color: var(--primary); transform: translateY(-50%) scale(1.05); }
  .input-field:focus:not(:disabled) ~ .password-toggle { color: var(--primary); }
  .input-field:disabled, .textarea-field:disabled { background: var(--backgroundTertiary); color: var(--textQuaternary); cursor: not-allowed; opacity: 0.6; box-shadow: none; }

  .input-icon, .textarea-icon { position: absolute; color: var(--textSecondary); display: flex; align-items: center; justify-content: center; pointer-events: none; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); z-index: 1; }
  .input-icon { top: 50%; transform: translateY(-50%); }
  .textarea-icon { top: var(--space-3); left: 50%; transform: translateX(-50%); }
  .input-icon.size-small, .textarea-icon.size-small { left: var(--space-3); width: 16px; height: 16px; }
  .input-icon.size-medium, .textarea-icon.size-medium { left: var(--space-4); width: 18px; height: 18px; }
  .input-icon.size-large, .textarea-icon.size-large { left: var(--space-5); width: 20px; height: 20px; }
  .input-icon.error, .textarea-icon.error { color: var(--error); }

  .password-toggle { position: absolute; right: var(--space-2); top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--textSecondary); cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: var(--space-1); transition: all 0.3s; z-index: 2; }
  .password-toggle:hover:not(:disabled) { color: var(--text); background: var(--backgroundHover); }
  .password-toggle.size-small { width: 28px; height: 28px; }
  .password-toggle.size-medium { width: 32px; height: 32px; }
  .password-toggle.size-large { width: 36px; height: 36px; }

  .input-helper { font-size: 0.8125rem; line-height: 1.4; margin-top: var(--space-1); letter-spacing: -0.01em; }
  .input-helper.error { color: var(--error); }
  .input-helper.normal { color: var(--textTertiary); }
  .input-field::placeholder, .textarea-field::placeholder { color: var(--placeholder); transition: opacity 0.3s; }
  .input-field:focus::placeholder, .textarea-field:focus::placeholder { opacity: 0.6; }

  @media (max-width: 768px) {
    .input-field.size-medium { height: 44px; font-size: 1rem; }
    .password-toggle { min-width: 44px; min-height: 44px; }
  }
`;

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
    const [show, setShow] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    return (
      <div className={`input-container ${className}`} style={style}>
        <style href="ui-input" precedence="medium">
          {CSS}
        </style>
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
            <div className={`input-icon size-${size} ${error ? "error" : ""}`}>
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={password ? (show ? "text" : "password") : propType}
            className={`input-field size-${size} variant-${variant} ${error ? "error" : ""} ${icon ? "has-icon" : ""} ${password ? "has-password" : ""}`}
            aria-invalid={error}
            aria-describedby={helperId}
            {...props}
          />
          {password && (
            <button
              type="button"
              onClick={() => setShow(!show)}
              className={`password-toggle size-${size} ${error ? "error" : ""}`}
              disabled={props.disabled}
            >
              {show ? (
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
            id={helperId}
            className={`input-helper ${error ? "error" : "normal"}`}
            role={error ? "alert" : "note"}
          >
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, onChange, decimal = 0, placeholder = "", ...props }, ref) => {
    const [display, setDisplay] = useState("");
    useEffect(() => {
      setDisplay(
        value === undefined || value === 0
          ? ""
          : decimal > 0
            ? value.toFixed(decimal).replace(/\.?0+$/, "")
            : value.toString()
      );
    }, [value, decimal]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        if (
          raw === "" ||
          new RegExp(
            `^${raw.startsWith("-") ? "-?" : ""}\\d*(\\.\\d{0,${decimal}})?$`
          ).test(raw)
        ) {
          setDisplay(raw);
          onChange(parseFloat(raw) || 0);
        }
      },
      [onChange, decimal]
    );

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        value={display}
        onChange={handleChange}
        placeholder={!value ? placeholder : ""}
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
    const setRef = useCallback(
      (n: HTMLTextAreaElement) => {
        setInternalRef(n);
        if (typeof ref === "function") ref(n);
        else if (ref) ref.current = n;
      },
      [ref]
    );
    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    useEffect(() => {
      if (autoResize && internalRef) {
        const adjust = () => {
          internalRef.style.height = "auto";
          internalRef.style.height = `${internalRef.scrollHeight}px`;
        };
        adjust();
        internalRef.addEventListener("input", adjust);
        return () => internalRef.removeEventListener("input", adjust);
      }
    }, [autoResize, internalRef, props.value]);

    return (
      <div className={`input-container ${className}`} style={style}>
        <style href="ui-input" precedence="medium">
          {CSS}
        </style>
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
            ref={setRef}
            id={inputId}
            rows={rows}
            className={`textarea-field size-${size} variant-${variant} ${error ? "error" : ""} ${icon ? "has-icon" : ""} ${autoResize ? "auto-resize" : ""}`}
            aria-invalid={error}
            aria-describedby={helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
        </div>
        {helperText && (
          <div
            id={`${inputId}-helper`}
            className={`input-helper ${error ? "error" : "normal"}`}
          >
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

export const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<InputProps, "password">
>((props, ref) => <Input {...props} password ref={ref} />);
Input.displayName = "Input";
NumberInput.displayName = "NumberInput";
TextArea.displayName = "TextArea";
PasswordInput.displayName = "PasswordInput";
