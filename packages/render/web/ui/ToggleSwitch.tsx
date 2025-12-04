// render/web/ui/ToggleSwitch.tsx

import type React from "react";
import { useEffect, useState } from "react";
import LoadingSpinner from "render/web/ui/LoadingSpinner";

interface ToggleSwitchProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "onChange" | "size" | "checked" | "defaultChecked"
  > {
  loading?: boolean;
  helperText?: string;
  error?: boolean;
  label?: string;

  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;

  className?: string;

  // React 19: ref 作为 prop
  ref?: React.Ref<HTMLInputElement>;
}

function ToggleSwitch(props: ToggleSwitchProps) {
  const {
    disabled = false,
    loading = false,
    checked,
    defaultChecked = false,
    onChange,
    label,
    helperText,
    error = false,
    id,
    className = "",
    ref,
    ...inputProps
  } = props;

  const [isChecked, setIsChecked] = useState<boolean>(
    checked ?? defaultChecked ?? false
  );

  useEffect(() => {
    if (typeof checked === "boolean") {
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
          className={[
            "toggle-wrapper",
            disabled ? "disabled" : "",
            loading ? "loading" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          htmlFor={inputId}
        >
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className="toggle-input"
            {...inputProps}
            checked={isChecked}
            onChange={handleToggle}
            disabled={disabled || loading}
            aria-describedby={helperTextId}
            aria-invalid={error}
          />

          <div
            className={[
              "toggle-switch",
              isChecked ? "checked" : "",
              error ? "error" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="toggle-background" />
            {!loading ? (
              <span className="toggle-handle" />
            ) : (
              <span className="toggle-loading">
                {/* 使用公共 LoadingSpinner */}
                <LoadingSpinner size={12} />
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
        height: 24px;
        width: 44px;
      }

      .toggle-switch.checked {
        background: var(--primary);
        border-color: var(--primary);
        box-shadow: 
          0 2px 8px rgba(22, 119, 255, 0.3),
          0 1px 3px var(--shadowLight),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }

      .toggle-switch.error {
        border-color: var(--error);
        background: rgba(239, 68, 68, 0.1);
      }

      .toggle-switch.error.checked {
        background: var(--error);
        border-color: var(--error);
      }

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

      .toggle-background {
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
        height: 20px;
        width: 20px;
        left: 2px;
      }

      .toggle-switch.checked .toggle-handle {
        left: 22px;
        background: white;
        box-shadow: 
          0 2px 6px rgba(0, 0, 0, 0.2),
          0 0 0 1px rgba(0, 0, 0, 0.05),
          inset 0 1px 0 rgba(255, 255, 255, 1);
      }

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

      .toggle-input {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
        pointer-events: none;
      }

      .toggle-input:focus-visible + .toggle-switch {
        box-shadow: 
          0 0 0 2px var(--background),
          0 0 0 4px var(--primary),
          0 1px 3px var(--shadowLight);
      }

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

      @media (max-width: 768px) {
        .toggle-switch {
          height: 26px;
          width: 46px;
        }

        .toggle-handle {
          height: 22px;
          width: 22px;
        }

        .toggle-switch.checked .toggle-handle {
          left: 22px;
        }
      }

      @media (prefers-contrast: high) {
        .toggle-switch {
          border-width: 2px;
        }
        
        .toggle-handle {
          border: 1px solid var(--border);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .toggle-switch,
        .toggle-handle,
        .toggle-background {
          transition: none;
        }
      }

      @media (hover: none) and (pointer: coarse) {
        .toggle-wrapper {
          padding: var(--space-1);
          margin: calc(-1 * var(--space-1));
        }
        
        .toggle-wrapper:hover:not(.disabled):not(.loading) .toggle-switch {
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
