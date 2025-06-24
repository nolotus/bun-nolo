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
    } = useController({
      name,
      control,
      defaultValue,
      rules,
    });

    const [inputValue, setInputValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const tagsArray = value
      ? (typeof value === "string" ? value : String(value))
          .split(",")
          .map((tag: string) => tag.trim())
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
      if (!trimmedTag) return;

      // 检查是否达到最大标签数
      if (maxTags && tagsArray.length >= maxTags) return;

      // 检查重复
      if (!allowDuplicates && tagsArray.includes(trimmedTag)) return;

      const newTags = [...tagsArray, trimmedTag].join(", ");
      onChange(newTags);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "Enter":
        case "Tab":
          e.preventDefault();
          addTag(inputValue);
          setInputValue("");
          break;
        case "Backspace":
          if (inputValue === "" && tagsArray.length > 0) {
            removeTag(tagsArray.length - 1);
          }
          break;
        case "Escape":
          setInputValue("");
          break;
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      // 处理分隔符输入
      if (
        typeof separator === "string"
          ? newValue.includes(separator)
          : separator.test(newValue)
      ) {
        const parts = newValue.split(separator);
        const tagsToAdd = parts.slice(0, -1);
        const remainingText = parts[parts.length - 1];

        tagsToAdd.forEach((tag) => addTag(tag));
        setInputValue(remainingText);
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
      const tags = pastedText
        .split(separator)
        .map((tag) => tag.trim())
        .filter(Boolean);

      tags.forEach((tag) => addTag(tag));
      setInputValue("");
    };

    return (
      <>
        <style href="tags-input" precedence="medium">{`
        .tags-input-container {
          display: flex;
          flex-direction: column;
          gap: ${theme.space[1]};
          width: 100%;
        }

        .tags-input-label {
          font-size: 0.875rem;
          font-weight: 550;
          color: ${theme.text};
          margin-bottom: ${theme.space[1]};
          letter-spacing: -0.01em;
          line-height: 1.4;
        }

        .tags-input-label.error {
          color: ${theme.error};
        }

        .tags-display {
          display: flex;
          flex-wrap: wrap;
          gap: ${theme.space[1]};
          border: 1px solid ${theme.border};
          border-radius: ${theme.space[3]};
          background: ${theme.background};
          align-items: center;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          box-shadow: 
            0 1px 3px ${theme.shadow1},
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        /* 尺寸系统 */
        .tags-display.size-small {
          min-height: 36px;
          padding: ${theme.space[1]} ${theme.space[3]};
          border-radius: ${theme.space[2]};
        }

        .tags-display.size-medium {
          min-height: 42px;
          padding: ${theme.space[2]} ${theme.space[4]};
        }

        .tags-display.size-large {
          min-height: 48px;
          padding: ${theme.space[2]} ${theme.space[5]};
          border-radius: ${theme.space[4]};
        }

        /* 变体样式 */
        .tags-display.variant-filled {
          background: ${theme.backgroundSecondary};
          border-color: ${theme.borderLight};
        }

        .tags-display.variant-ghost {
          background: transparent;
          border-color: ${theme.borderLight};
          box-shadow: none;
        }

        /* 状态样式 */
        .tags-display.focused {
          border-color: ${theme.primary};
          box-shadow: 
            0 0 0 3px ${theme.primary}20,
            0 2px 8px ${theme.shadow2},
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .tags-display.error {
          border-color: ${theme.error};
          box-shadow: 
            0 1px 3px ${theme.error}20,
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .tags-display.error.focused {
          box-shadow: 
            0 0 0 3px ${theme.error}20,
            0 2px 8px ${theme.error}15,
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .tags-display.disabled {
          background: ${theme.backgroundTertiary};
          border-color: ${theme.borderLight};
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }

        .tags-display:hover:not(.disabled):not(.focused) {
          border-color: ${theme.primary}40;
          box-shadow: 
            0 2px 6px ${theme.shadow1},
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }

        /* 标签样式 */
        .tag {
          display: flex;
          align-items: center;
          background: linear-gradient(135deg, ${theme.primary}12 0%, ${theme.primary}08 100%);
          color: ${theme.primary};
          border-radius: ${theme.space[2]};
          font-weight: 520;
          line-height: 1.4;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          border: 1px solid ${theme.primary}20;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }

        .tag.size-small {
          padding: 3px ${theme.space[2]};
          font-size: 0.75rem;
          border-radius: ${theme.space[1]};
        }

        .tag.size-medium {
          padding: 4px ${theme.space[2]};
          font-size: 0.8125rem;
        }

        .tag.size-large {
          padding: ${theme.space[1]} ${theme.space[3]};
          font-size: 0.875rem;
          border-radius: ${theme.space[2]};
        }

        .tag:hover {
          background: linear-gradient(135deg, ${theme.primary}18 0%, ${theme.primary}12 100%);
          border-color: ${theme.primary}30;
          transform: scale(1.02);
        }

        .remove-tag {
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

        .remove-tag.size-small {
          width: 16px;
          height: 16px;
          padding: 2px;
        }

        .remove-tag.size-medium {
          width: 18px;
          height: 18px;
          padding: 2px;
        }

        .remove-tag.size-large {
          width: 20px;
          height: 20px;
          padding: 3px;
        }

        .remove-tag:hover {
          opacity: 1;
          background: ${theme.primary}15;
          transform: scale(1.1);
        }

        .remove-tag:active {
          transform: scale(0.95);
        }

        /* 输入框 */
        .tags-input {
          border: none;
          outline: none;
          flex-grow: 1;
          background: transparent;
          color: ${theme.text};
          min-width: 120px;
          font-family: inherit;
          letter-spacing: -0.01em;
        }

        .tags-input.size-small {
          font-size: 0.875rem;
          padding: 3px 0;
        }

        .tags-input.size-medium {
          font-size: 0.925rem;
          padding: 4px 0;
        }

        .tags-input.size-large {
          font-size: 1rem;
          padding: ${theme.space[1]} 0;
        }

        .tags-input::placeholder {
          color: ${theme.placeholder || theme.textQuaternary};
          opacity: 1;
        }

        .tags-input:disabled {
          cursor: not-allowed;
          color: ${theme.textQuaternary};
        }

        /* 帮助文本 */
        .tags-input-helper {
          font-size: 0.8125rem;
          line-height: 1.4;
          margin-top: ${theme.space[1]};
          letter-spacing: -0.01em;
        }

        .tags-input-helper.error {
          color: ${theme.error};
        }

        .tags-input-helper.normal {
          color: ${theme.textTertiary};
        }

        /* 计数器 */
        .tags-counter {
          position: absolute;
          top: -${theme.space[1]};
          right: ${theme.space[2]};
          font-size: 0.75rem;
          color: ${theme.textTertiary};
          background: ${theme.background};
          padding: 0 ${theme.space[1]};
          font-weight: 500;
        }

        .tags-counter.warning {
          color: ${theme.error};
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .tags-input.size-medium {
            font-size: 1rem; /* 防止 iOS 缩放 */
          }
          
          .tag {
            max-width: 150px;
          }
        }

        @media (max-width: 480px) {
          .tags-display {
            border-radius: ${theme.space[2]};
          }

          .tags-display.size-large {
            border-radius: ${theme.space[3]};
          }

          .tag {
            max-width: 120px;
          }

          .tags-input {
            min-width: 80px;
          }
        }

        /* 高对比度支持 */
        @media (prefers-contrast: high) {
          .tags-display {
            border-width: 2px;
          }
          
          .tag {
            border-width: 2px;
          }
        }

        /* 减少动画偏好 */
        @media (prefers-reduced-motion: reduce) {
          .tags-display,
          .tag,
          .remove-tag {
            transition: border-color 0.1s ease, box-shadow 0.1s ease;
          }
          
          .tags-display.focused {
            transform: none;
          }
          
          .tag:hover,
          .remove-tag:hover {
            transform: none;
          }
        }
      `}</style>

        <div className={`tags-input-container ${className}`} style={style}>
          {label && (
            <label
              htmlFor={inputId}
              className={`tags-input-label ${error ? "error" : ""}`}
            >
              {label}
            </label>
          )}

          <div
            className={`tags-display size-${size} variant-${variant} ${
              isFocused ? "focused" : ""
            } ${error ? "error" : ""} ${disabled ? "disabled" : ""}`}
          >
            {tagsArray.map((tag, index) => (
              <span key={`${tag}-${index}`} className={`tag size-${size}`}>
                <span title={tag}>{tag}</span>
                {!disabled && (
                  <button
                    type="button"
                    className={`remove-tag size-${size}`}
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
              className={`tags-input size-${size}`}
              aria-invalid={error ? true : undefined}
              aria-describedby={helperTextId}
              autoComplete="off"
            />

            {maxTags && (
              <div
                className={`tags-counter ${tagsArray.length >= maxTags ? "warning" : ""}`}
              >
                {tagsArray.length}/{maxTags}
              </div>
            )}
          </div>

          {(helperText || error) && (
            <div
              id={helperTextId}
              className={`tags-input-helper ${error ? "error" : "normal"}`}
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
