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
    }
  };

  const handleBlur = () => {
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
      <div className="tags-display">
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
          placeholder={tagsArray.length === 0 ? placeholder : ""}
          disabled={disabled}
          className="tags-input"
        />
      </div>
      {error && <span className="error-message">{error.message}</span>}

      <style>{`
        .tags-input-container {
          position: relative;
          width: 100%;
        }
        .tags-display {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 8px;
          border: 1px solid ${theme.border};
          border-radius: 4px;
          background: ${theme.background};
          min-height: 40px;
          align-items: center;
        }
        .tag {
          display: flex;
          align-items: center;
          background: ${theme.primaryLight};
          color: ${theme.text};
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        .remove-tag {
          margin-left: 4px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          color: ${theme.textDim};
        }
        .remove-tag:hover {
          color: ${theme.text};
        }
        .tags-input {
          border: none;
          outline: none;
          flex-grow: 1;
          background: transparent;
          color: ${theme.text};
          font-size: 14px;
          min-width: 100px;
        }
        .tags-input:disabled {
          background: ${theme.disabled};
          cursor: not-allowed;
        }
        .error-message {
          color: ${theme.error};
          font-size: 12px;
          margin-top: 4px;
          display: block;
        }
      `}</style>
    </div>
  );
};
