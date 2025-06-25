import React, { useState, useEffect, forwardRef } from "react";
import { useController, UseControllerProps } from "react-hook-form";
import { XIcon } from "@primer/octicons-react";
import { useTheme } from "app/theme";

interface TagsInputProps extends UseControllerProps {
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
      name,
      control,
      defaultValue,
      rules,
      placeholder = "输入标签后按回车添加",
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
    const theme = useTheme();
    const {
      field: { onChange, value },
      fieldState: { error },
    } = useController({ name, control, defaultValue, rules });

    const [inputValue, setInputValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const tagsArray = value
      ? String(value)
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

    const inputId =
      id || `tags-input-${Math.random().toString(36).substr(2, 9)}`;
    const helperTextId = helperText || error ? `${inputId}-helper` : undefined;

    useEffect(() => {
      setInputValue("");
    }, [value]);

    const addTag = (tagToAdd: string) => {
      const trimmedTag = tagToAdd.trim();
      if (
        !trimmedTag ||
        (maxTags && tagsArray.length >= maxTags) ||
        (!allowDuplicates && tagsArray.includes(trimmedTag))
      )
        return;

      onChange([...tagsArray, trimmedTag].join(", "));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        addTag(inputValue);
        setInputValue("");
      } else if (e.key === "Backspace" && !inputValue && tagsArray.length) {
        removeTag(tagsArray.length - 1);
      } else if (e.key === "Escape") {
        setInputValue("");
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      const hasSeperator =
        typeof separator === "string"
          ? newValue.includes(separator)
          : separator.test(newValue);

      if (hasSeperator) {
        const parts = newValue.split(separator);
        parts.slice(0, -1).forEach(addTag);
        setInputValue(parts[parts.length - 1]);
      } else {
        setInputValue(newValue);
      }
    };

    const handleBlur = () => {
      setIsFocused(false);
      if (inputValue.trim()) {
        addTag(inputValue);
        setInputValue("");
      }
    };

    const removeTag = (indexToRemove: number) => {
      const newTags = tagsArray
        .filter((_, index) => index !== indexToRemove)
        .join(", ");
      onChange(newTags);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text");
      pastedText
        .split(separator)
        .map((tag) => tag.trim())
        .filter(Boolean)
        .forEach(addTag);
      setInputValue("");
    };

    return (
      <>
        <style href="tags-input" precedence="medium">{`
        .ti-container {
          display: flex;
          flex-direction: column;
          gap: ${theme.space[1]};
          width: 100%;
        }

        .ti-label {
          font-size: 0.875rem;
          font-weight: 550;
          color: ${theme.text};
          letter-spacing: -0.01em;
          line-height: 1.4;
        }
        .ti-label.error { color: ${theme.error}; }

        .ti-wrapper {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: ${theme.space[1]};
          border: 1px solid ${theme.border};
          border-radius: ${theme.space[3]};
          background: ${theme.background};
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          box-shadow: 0 1px 3px ${theme.shadow1};
        }

        /* 尺寸变体 */
        .ti-wrapper.small { min-height: 36px; padding: ${theme.space[1]} ${theme.space[3]}; border-radius: ${theme.space[2]}; }
        .ti-wrapper.medium { min-height: 42px; padding: ${theme.space[2]} ${theme.space[4]}; }
        .ti-wrapper.large { min-height: 48px; padding: ${theme.space[2]} ${theme.space[5]}; border-radius: ${theme.space[4]}; }

        /* 样式变体 */
        .ti-wrapper.filled { background: ${theme.backgroundSecondary}; border-color: ${theme.borderLight}; }
        .ti-wrapper.ghost { background: transparent; border-color: ${theme.borderLight}; box-shadow: none; }

        /* 状态 */
        .ti-wrapper.focused {
          border-color: ${theme.primary};
          box-shadow: 0 0 0 3px ${theme.primary}20, 0 2px 8px ${theme.shadow2};
          transform: translateY(-1px);
        }
        .ti-wrapper.error { border-color: ${theme.error}; box-shadow: 0 1px 3px ${theme.error}20; }
        .ti-wrapper.error.focused { box-shadow: 0 0 0 3px ${theme.error}20, 0 2px 8px ${theme.error}15; }
        .ti-wrapper.disabled { background: ${theme.backgroundTertiary}; opacity: 0.6; cursor: not-allowed; box-shadow: none; }
        .ti-wrapper:hover:not(.disabled):not(.focused) { border-color: ${theme.primary}40; box-shadow: 0 2px 6px ${theme.shadow1}; }

        /* 标签 */
        .ti-tag {
          display: flex;
          align-items: center;
          background: linear-gradient(135deg, ${theme.primary}12 0%, ${theme.primary}08 100%);
          color: ${theme.primary};
          border: 1px solid ${theme.primary}20;
          border-radius: ${theme.space[2]};
          font-weight: 520;
          line-height: 1.4;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ti-tag.small { padding: 3px ${theme.space[2]}; font-size: 0.75rem; border-radius: ${theme.space[1]}; }
        .ti-tag.medium { padding: 4px ${theme.space[2]}; font-size: 0.8125rem; }
        .ti-tag.large { padding: ${theme.space[1]} ${theme.space[3]}; font-size: 0.875rem; }

        .ti-tag:hover {
          background: linear-gradient(135deg, ${theme.primary}18 0%, ${theme.primary}12 100%);
          border-color: ${theme.primary}30;
          transform: scale(1.02);
        }

        .ti-remove {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: ${theme.space[1]};
          background: none;
          border: none;
          cursor: pointer;
          color: ${theme.primary};
          opacity: 0.7;
          border-radius: 50%;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
        }

        .ti-remove.small { width: 16px; height: 16px; padding: 2px; }
        .ti-remove.medium { width: 18px; height: 18px; padding: 2px; }
        .ti-remove.large { width: 20px; height: 20px; padding: 3px; }

        .ti-remove:hover { opacity: 1; background: ${theme.primary}15; transform: scale(1.1); }

        /* 输入框 */
        .ti-input {
          border: none;
          outline: none;
          flex-grow: 1;
          background: transparent;
          color: ${theme.text};
          min-width: 120px;
          font-family: inherit;
          letter-spacing: -0.01em;
        }

        .ti-input.small { font-size: 0.875rem; padding: 3px 0; }
        .ti-input.medium { font-size: 0.925rem; padding: 4px 0; }
        .ti-input.large { font-size: 1rem; padding: ${theme.space[1]} 0; }

        .ti-input::placeholder { color: ${theme.placeholder || theme.textQuaternary}; }
        .ti-input:disabled { cursor: not-allowed; color: ${theme.textQuaternary}; }

        /* 计数器 */
        .ti-counter {
          position: absolute;
          top: -${theme.space[1]};
          right: ${theme.space[2]};
          font-size: 0.75rem;
          color: ${theme.textTertiary};
          background: ${theme.background};
          padding: 0 ${theme.space[1]};
          font-weight: 500;
        }
        .ti-counter.warning { color: ${theme.error}; }

        /* 帮助文本 */
        .ti-helper {
          font-size: 0.8125rem;
          line-height: 1.4;
          margin-top: ${theme.space[1]};
          letter-spacing: -0.01em;
          color: ${theme.textTertiary};
        }
        .ti-helper.error { color: ${theme.error}; }

        /* 响应式 */
        @media (max-width: 768px) {
          .ti-input.medium { font-size: 1rem; }
          .ti-tag { max-width: 150px; }
        }

        @media (max-width: 480px) {
          .ti-wrapper { border-radius: ${theme.space[2]}; }
          .ti-wrapper.large { border-radius: ${theme.space[3]}; }
          .ti-tag { max-width: 120px; }
          .ti-input { min-width: 80px; }
        }

        @media (prefers-contrast: high) {
          .ti-wrapper, .ti-tag { border-width: 2px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ti-wrapper, .ti-tag, .ti-remove { transition: border-color 0.1s ease, box-shadow 0.1s ease; }
          .ti-wrapper.focused, .ti-tag:hover, .ti-remove:hover { transform: none; }
        }
      `}</style>

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
                    aria-label={`删除标签 ${tag}`}
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
              placeholder={tagsArray.length === 0 ? placeholder : ""}
              disabled={disabled}
              className={`ti-input ${size}`}
              aria-invalid={error ? true : undefined}
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

          {(helperText || error) && (
            <div
              id={helperTextId}
              className={`ti-helper ${error ? "error" : ""}`}
              role={error ? "alert" : "note"}
            >
              {error ? error.message : helperText}
            </div>
          )}
        </div>
      </>
    );
  }
);

TagsInput.displayName = "TagsInput";
