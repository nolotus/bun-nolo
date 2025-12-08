import React from "react";

interface RadioGroupProps {
  options: { value: string; label: string; disabled?: boolean }[];
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  label?: string;
  disabled?: boolean;
  direction?: "row" | "column";
  className?: string; // 允许外部微调
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  onChange,
  name = "rg",
  label,
  disabled,
  direction = "column",
  className = "",
}) => {
  return (
    <div
      className={`radio-group ${className}`}
      data-direction={direction}
      role="radiogroup"
    >
      {label && <span className="group-label">{label}</span>}

      <div className="group-options">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`radio-label ${opt.disabled || disabled ? "disabled" : ""}`}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              disabled={opt.disabled || disabled}
              checked={value === opt.value}
              onChange={() =>
                !disabled && !opt.disabled && onChange?.(opt.value)
              }
            />
            <div className="radio-surface">
              <span className="radio-dot" />
              <span className="radio-text">{opt.label}</span>
            </div>
          </label>
        ))}
      </div>

      <style href="radio-group" precedence="medium">{`
        .radio-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          --r-color: var(--primary);
          --r-bg: var(--background);
          --r-border: var(--border);
        }

        .group-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
        }

        .group-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .radio-group[data-direction="row"] .group-options {
          flex-direction: row;
          flex-wrap: wrap;
        }

        /* 核心交互项 */
        .radio-label {
          position: relative;
          cursor: pointer;
          user-select: none;
        }

        /* 隐藏原生 Input，利用兄弟选择器控制样式 */
        .radio-label input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .radio-surface {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: var(--r-bg);
          border: 1px solid var(--r-border);
          border-radius: 8px;
          transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
          min-height: 44px;
          color: var(--textTertiary);
        }

        .radio-dot {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid var(--borderHover);
          position: relative;
          transition: border-color 0.2s;
        }

        .radio-dot::after {
          content: "";
          position: absolute;
          inset: 3px;
          border-radius: 50%;
          background: var(--r-color);
          transform: scale(0);
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* 悬停态：轻微浮起 */
        .radio-label:not(.disabled):hover .radio-surface {
          background: var(--backgroundHover);
          color: var(--text);
        }

        /* 选中态：Input:checked 触发 */
        .radio-label input:checked + .radio-surface {
          background: var(--primaryBg);
          border-color: var(--r-color);
          color: var(--r-color);
          box-shadow: 0 2px 5px var(--shadowLight); /* 40% 拟物感 */
        }

        .radio-label input:checked + .radio-surface .radio-dot {
          border-color: var(--r-color);
        }

        .radio-label input:checked + .radio-surface .radio-dot::after {
          transform: scale(1);
        }

        /* 禁用态 */
        .radio-label.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default RadioGroup;
