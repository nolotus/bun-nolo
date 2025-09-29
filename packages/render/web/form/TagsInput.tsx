// features/web/form/TagsInput.tsx

import React, { useState, forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { XIcon } from "@primer/octicons-react";

interface TagsInputProps {
  value?: string;
  onChange: (newValue: string) => void;
  error?: { message?: string };
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  size?: "small" | "medium" | "large";
  variant?: "default" | "filled" | "ghost";
  maxTags?: number;
  allowDuplicates?: boolean;
  separator?: string | RegExp;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

export const TagsInput = forwardRef<HTMLInputElement, TagsInputProps>(
  (
    {
      value = "",
      onChange,
      error,
      placeholder,
      disabled = false,
      label,
      helperText,
      size = "medium",
      variant = "default",
      maxTags,
      allowDuplicates = false,
      separator = /[,\s]+/,
      className = "",
      style,
      id,
    },
    ref
  ) => {
    const { t } = useTranslation("ai");

    const [inputValue, setInputValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const tagsArray = String(value)
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const inputId =
      id || `tags-input-${Math.random().toString(36).substr(2, 9)}`;
    const helperTextId = helperText || error ? `${inputId}-helper` : undefined;

    const addTag = (tagToAdd: string) => {
      const trimmedTag = tagToAdd.trim();
      if (
        !trimmedTag ||
        (maxTags && tagsArray.length >= maxTags) ||
        (!allowDuplicates && tagsArray.includes(trimmedTag))
      )
        return;
      onChange([...tagsArray, trimmedTag].join(", "));
      setInputValue("");
    };

    const removeTag = (indexToRemove: number) => {
      const newTags = tagsArray
        .filter((_, index) => index !== indexToRemove)
        .join(", ");
      onChange(newTags);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        addTag(inputValue);
      } else if (e.key === "Backspace" && !inputValue && tagsArray.length) {
        removeTag(tagsArray.length - 1);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    };

    const handleBlur = () => {
      setIsFocused(false);
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text");
      pastedText.split(separator).forEach(addTag);
    };

    const finalPlaceholder = placeholder || t("form.tagsPlaceholder");

    return (
      <>
        <TagsInputStyles />
        <div className={`ti-container ${className}`} style={style}>
          {label && (
            <label
              htmlFor={inputId}
              className={`ti-label ${error ? "error" : ""}`}
            >
              {label}
            </label>
          )}
          <div
            className={`ti-wrapper ${size} ${variant} ${isFocused ? "focused" : ""} ${error ? "error" : ""} ${disabled ? "disabled" : ""}`}
          >
            {tagsArray.map((tag, index) => (
              <span key={`${tag}-${index}`} className={`ti-tag ${size}`}>
                <span title={tag}>{tag}</span>
                {!disabled && (
                  <button
                    type="button"
                    className={`ti-remove ${size}`}
                    onClick={() => removeTag(index)}
                    aria-label={t("form.removeTag", { tag })}
                    tabIndex={-1}
                  >
                    <XIcon
                      size={size === "small" ? 10 : size === "large" ? 14 : 12}
                    />
                  </button>
                )}
              </span>
            ))}
            <input
              ref={ref}
              id={inputId}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              onFocus={() => setIsFocused(true)}
              onPaste={handlePaste}
              placeholder={tagsArray.length === 0 ? finalPlaceholder : ""}
              disabled={disabled}
              className={`ti-input ${size}`}
              aria-invalid={!!error}
              aria-describedby={helperTextId}
              autoComplete="off"
            />
            {maxTags && (
              <div
                className={`ti-counter ${tagsArray.length >= maxTags ? "warning" : ""}`}
              >
                {tagsArray.length}/{maxTags}
              </div>
            )}
          </div>
          {(helperText || error?.message) && (
            <div
              id={helperTextId}
              className={`ti-helper ${error ? "error" : ""}`}
              role={error ? "alert" : "note"}
            >
              {error?.message || helperText}
            </div>
          )}
        </div>
      </>
    );
  }
);

const TagsInputStyles = () => {
  return (
    <style href="tags-input" precedence="medium">{`
      .ti-container {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
        width: 100%;
      }

      .ti-label {
        font-size: 0.875rem;
        font-weight: 550;
        color: var(--text);
        letter-spacing: -0.01em;
        line-height: 1.4;
      }

      .ti-label.error {
        color: var(--error);
      }

      .ti-wrapper {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--space-1);
        border: 1px solid var(--border);
        border-radius: var(--space-3);
        background: var(--background);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
        box-shadow: 0 1px 3px var(--shadowLight);
      }

      /* 尺寸变体 */
      .ti-wrapper.small {
        min-height: 36px;
        padding: var(--space-1) var(--space-3);
        border-radius: var(--space-2);
      }

      .ti-wrapper.medium {
        min-height: 42px;
        padding: var(--space-2) var(--space-4);
      }

      .ti-wrapper.large {
        min-height: 48px;
        padding: var(--space-2) var(--space-5);
        border-radius: var(--space-4);
      }

      /* 样式变体 */
      .ti-wrapper.filled {
        background: var(--backgroundSecondary);
        border-color: var(--borderLight);
      }

      .ti-wrapper.ghost {
        background: transparent;
        border-color: var(--borderLight);
        box-shadow: none;
      }

      /* 状态 */
      .ti-wrapper.focused {
        border-color: var(--primary);
        box-shadow: 0 0 0 3px var(--focus), 0 2px 8px var(--shadowMedium);
        transform: translateY(-1px);
      }

      .ti-wrapper.error {
        border-color: var(--error);
        box-shadow: 0 1px 3px rgba(239, 68, 68, 0.2);
      }

      .ti-wrapper.error.focused {
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2), 0 2px 8px rgba(239, 68, 68, 0.15);
      }

      .ti-wrapper.disabled {
        background: var(--backgroundTertiary);
        opacity: 0.6;
        cursor: not-allowed;
        box-shadow: none;
      }

      .ti-wrapper:hover:not(.disabled):not(.focused) {
        border-color: var(--hover);
        box-shadow: 0 2px 6px var(--shadowLight);
      }

      /* 标签 */
      .ti-tag {
        display: flex;
        align-items: center;
        background: var(--primaryGhost);
        color: var(--primary);
        border: 1px solid var(--borderAccent);
        border-radius: var(--space-2);
        font-weight: 520;
        line-height: 1.4;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .ti-tag.small {
        padding: 3px var(--space-2);
        font-size: 0.75rem;
        border-radius: var(--space-1);
      }

      .ti-tag.medium {
        padding: 4px var(--space-2);
        font-size: 0.8125rem;
      }

      .ti-tag.large {
        padding: var(--space-1) var(--space-3);
        font-size: 0.875rem;
      }

      .ti-tag:hover {
        background: var(--primaryHover);
        border-color: var(--borderAccent);
        transform: scale(1.02);
      }

      .ti-remove {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: var(--space-1);
        background: none;
        border: none;
        cursor: pointer;
        color: var(--primary);
        opacity: 0.7;
        border-radius: 50%;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        flex-shrink: 0;
      }

      .ti-remove.small {
        width: 16px;
        height: 16px;
        padding: 2px;
      }

      .ti-remove.medium {
        width: 18px;
        height: 18px;
        padding: 2px;
      }

      .ti-remove.large {
        width: 20px;
        height: 20px;
        padding: 3px;
      }

      .ti-remove:hover {
        opacity: 1;
        background: var(--primaryHover);
        transform: scale(1.1);
      }

      /* 输入框 */
      .ti-input {
        border: none;
        outline: none;
        flex-grow: 1;
        background: transparent;
        color: var(--text);
        min-width: 120px;
        font-family: inherit;
        letter-spacing: -0.01em;
      }

      .ti-input.small {
        font-size: 0.875rem;
        padding: 3px 0;
      }

      .ti-input.medium {
        font-size: 0.925rem;
        padding: 4px 0;
      }

      .ti-input.large {
        font-size: 1rem;
        padding: var(--space-1) 0;
      }

      .ti-input::placeholder {
        color: var(--placeholder);
      }

      .ti-input:disabled {
        cursor: not-allowed;
        color: var(--textQuaternary);
      }

      /* 计数器 */
      .ti-counter {
        position: absolute;
        top: calc(-1 * var(--space-1));
        right: var(--space-2);
        font-size: 0.75rem;
        color: var(--textTertiary);
        background: var(--background);
        padding: 0 var(--space-1);
        font-weight: 500;
      }

      .ti-counter.warning {
        color: var(--error);
      }

      /* 帮助文本 */
      .ti-helper {
        font-size: 0.8125rem;
        line-height: 1.4;
        margin-top: var(--space-1);
        letter-spacing: -0.01em;
        color: var(--textTertiary);
      }

      .ti-helper.error {
        color: var(--error);
      }

      /* 响应式 */
      @media (max-width: 768px) {
        .ti-input.medium {
          font-size: 1rem;
        }
        
        .ti-tag {
          max-width: 150px;
        }
      }

      @media (max-width: 480px) {
        .ti-wrapper {
          border-radius: var(--space-2);
        }
        
        .ti-wrapper.large {
          border-radius: var(--space-3);
        }
        
        .ti-tag {
          max-width: 120px;
        }
        
        .ti-input {
          min-width: 80px;
        }
      }

      @media (prefers-contrast: high) {
        .ti-wrapper,
        .ti-tag {
          border-width: 2px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .ti-wrapper,
        .ti-tag,
        .ti-remove {
          transition: border-color 0.1s ease, box-shadow 0.1s ease;
        }
        
        .ti-wrapper.focused,
        .ti-tag:hover,
        .ti-remove:hover {
          transform: none;
        }
      }
    `}</style>
  );
};

TagsInput.displayName = "TagsInput";
