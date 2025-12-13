// render/web/form/TextArea.tsx
import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { BaseInputProps, InputStyles } from "./Input";

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    BaseInputProps {
  autoResize?: boolean;
  ref?: React.Ref<HTMLTextAreaElement>;
}

export const TextArea = ({
  icon,
  error,
  helperText,
  label,
  variant = "default",
  autoResize = false,
  className = "",
  style,
  id,
  rows = 4,
  ref,
  ...props
}: TextAreaProps) => {
  const [internalRef, setInternalRef] = useState<HTMLTextAreaElement | null>(
    null
  );

  const textareaRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      setInternalRef(node);
      if (typeof ref === "function") {
        ref(node);
      } else if (ref && "current" in ref) {
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current =
          node;
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
            <div className={`textarea-icon ${error ? "error" : ""}`}>
              {icon}
            </div>
          )}

          <textarea
            ref={textareaRef}
            id={inputId}
            rows={rows}
            className={`textarea-field variant-${variant} ${
              error ? "error" : ""
            } ${icon ? "has-icon" : "has-none"} ${
              autoResize ? "auto-resize" : ""
            }`}
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
};

TextArea.displayName = "TextArea";
