// features/web/form/TagsInput.tsx

import React, { useState } from "react";
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
  variant?: "default" | "filled" | "ghost";
  maxTags?: number;
  allowDuplicates?: boolean;
  separator?: string | RegExp;
  className?: string;
  style?: React.CSSProperties;
  id?: string;

  // React 19: 直接以 prop 形式接收 ref
  ref?: React.Ref<HTMLInputElement>;
}

export const TagsInput = ({
  value = "",
  onChange,
  error,
  placeholder,
  disabled = false,
  label,
  helperText,
  variant = "default",
  maxTags,
  allowDuplicates = false,
  separator = /[,\s]+/,
  className = "",
  style,
  id,
  ref,
}: TagsInputProps) => {
  const { t } = useTranslation("ai");

  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const tagsArray = String(value)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const inputId = id || `tags-input-${Math.random().toString(36).substr(2, 9)}`;
  const helperTextId =
    helperText || error?.message ? `${inputId}-helper` : undefined;

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

  const wrapperClasses = [
    "ti-wrapper",
    variant, // default | filled | ghost
    isFocused ? "focused" : "",
    error ? "error" : "",
    disabled ? "disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

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

        <div className={wrapperClasses}>
          {tagsArray.map((tag, index) => (
            <span key={`${tag}-${index}`} className="ti-tag">
              <span title={tag}>{tag}</span>
              {!disabled && (
                <button
                  type="button"
                  className="ti-remove"
                  onClick={() => removeTag(index)}
                  aria-label={t("form.removeTag", { tag })}
                  tabIndex={-1}
                >
                  <XIcon size={12} />
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
            className="ti-input"
            aria-invalid={!!error}
            aria-describedby={helperTextId}
            autoComplete="off"
          />

          {maxTags && (
            <div
              className={`ti-counter ${
                tagsArray.length >= maxTags ? "warning" : ""
              }`}
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
};

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
        min-height: 42px;
        padding: var(--space-2) var(--space-4);
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
        box-shadow:
          0 0 0 3px rgba(239, 68, 68, 0.2),
          0 2px 8px rgba(239, 68, 68, 0.15);
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
        padding: 4px var(--space-2);
        font-size: 0.8125rem;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
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
        width: 18px;
        height: 18px;
        padding: 2px;
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
        font-size: 0.925rem;
        padding: 4px 0;
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
        .ti-input {
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
