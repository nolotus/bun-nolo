import React, { useState, useEffect } from "react";
import { useController, UseControllerProps } from "react-hook-form";
import { XIcon } from "@primer/octicons-react";
import { useTheme } from "app/theme";

interface TagsInputProps extends UseControllerProps {
  placeholder?: string;
  disabled?: boolean;
}

export const TagsInput: React.FC<TagsInputProps> = ({
  name,
  control,
  defaultValue,
  rules,
  placeholder = "Enter tags",
  disabled = false,
}) => {
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
    ? value
        .split(",")
        .map((tag: string) => tag.trim())
        .filter(Boolean)
    : [];

  // 同步输入框和标签状态
  useEffect(() => {
    setInputValue("");
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) {
        const newTags = [...tagsArray, inputValue.trim()].join(", ");
        onChange(newTags);
        setInputValue("");
      }
    } else if (
      e.key === "Backspace" &&
      inputValue === "" &&
      tagsArray.length > 0
    ) {
      // 当输入框为空且按下Backspace时，删除最后一个标签
      removeTag(tagsArray.length - 1);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (inputValue.trim()) {
      const newTags = [...tagsArray, inputValue.trim()].join(", ");
      onChange(newTags);
      setInputValue("");
    }
  };

  const removeTag = (indexToRemove: number) => {
    const newTags = tagsArray
      .filter((_, index) => index !== indexToRemove)
      .join(", ");
    onChange(newTags);
  };

  return (
    <div className="tags-input-container">
      <div
        className={`tags-display ${isFocused ? "focused" : ""} ${error ? "error" : ""} ${disabled ? "disabled" : ""}`}
      >
        {tagsArray.map((tag, index) => (
          <span key={index} className="tag">
            {tag}
            {!disabled && (
              <button
                type="button"
                className="remove-tag"
                onClick={() => removeTag(index)}
                aria-label={`Remove ${tag}`}
              >
                <XIcon size={12} />
              </button>
            )}
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => setIsFocused(true)}
          placeholder={tagsArray.length === 0 ? placeholder : ""}
          disabled={disabled}
          className="tags-input"
        />
      </div>
      {error && <span className="error-message">{error.message}</span>}

      <style jsx>{`
        .tags-input-container {
          position: relative;
          width: 100%;
        }

        .tags-display {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 8px 10px;
          border: 1px solid ${theme.border};
          border-radius: 8px;
          background: ${theme.backgroundSecondary};
          min-height: 42px;
          align-items: center;
          transition: all 0.2s ease;
        }

        .tags-display.focused {
          border-color: ${theme.primary};
          box-shadow: 0 0 0 2px
            ${theme.primaryGhost || "rgba(22, 119, 255, 0.1)"};
          background: ${theme.background};
        }

        .tags-display.error {
          border-color: ${theme.error};
        }

        .tags-display.disabled {
          background: ${theme.backgroundTertiary || theme.backgroundSecondary};
          opacity: 0.8;
          cursor: not-allowed;
        }

        .tag {
          display: flex;
          align-items: center;
          background: ${theme.primaryGhost || "rgba(22, 119, 255, 0.08)"};
          color: ${theme.primary};
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.4;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          box-shadow: 0 1px 2px ${theme.shadowLight};
        }

        .remove-tag {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 6px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px;
          color: ${theme.primary};
          opacity: 0.7;
          border-radius: 50%;
          transition: all 0.15s ease;
        }

        .remove-tag:hover {
          opacity: 1;
          background: rgba(0, 0, 0, 0.05);
        }

        .tags-input {
          border: none;
          outline: none;
          flex-grow: 1;
          background: transparent;
          color: ${theme.text};
          font-size: 14px;
          min-width: 80px;
          padding: 4px 0;
        }

        .tags-input::placeholder {
          color: ${theme.textTertiary};
        }

        .tags-input:disabled {
          cursor: not-allowed;
        }

        .error-message {
          color: ${theme.error};
          font-size: 12px;
          margin-top: 6px;
          display: block;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};
