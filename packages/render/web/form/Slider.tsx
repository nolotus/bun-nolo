// render/web/form/Slider.tsx
import type React from "react";
import { useCallback, useState, useEffect } from "react";

export interface SliderProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "value" | "onChange"
  > {
  value: number;
  onChange: (value: number) => void;

  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  label?: string;
  showValue?: boolean;
  size?: "small" | "medium" | "large";
  className?: string;
  helperText?: string;
  error?: boolean;

  // React 19: ref 作为普通 prop
  ref?: React.Ref<HTMLInputElement>;
}

export const Slider = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  label,
  showValue = false,
  size = "medium",
  className = "",
  helperText,
  error = false,
  ref,
  id,
  ...inputProps
}: SliderProps) => {
  const [localValue, setLocalValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const inputId = id || `slider-${Math.random().toString(36).substr(2, 9)}`;
  const helperTextId = helperText ? `${inputId}-helper` : undefined;

  const progress = ((localValue - min) / (max - min)) * 100;

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      setLocalValue(val);
      if (!isDragging) setIsDragging(true);
    },
    [isDragging]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      setLocalValue(val);
      onChange(val);
      setIsDragging(false);
    },
    [onChange]
  );

  useEffect(() => {
    if (!isDragging) setLocalValue(value);
  }, [value, isDragging]);

  const displayValue =
    step < 1 ? localValue.toFixed(1) : Math.round(localValue).toString();

  return (
    <>
      <SliderStyles />
      <div
        className={[
          "slider-container",
          `size-${size}`,
          disabled ? "disabled" : "",
          error ? "error" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {(label || showValue) && (
          <div className="slider-header">
            {label && <span className="slider-label">{label}</span>}
            {showValue && <span className="slider-value">{displayValue}</span>}
          </div>
        )}

        <div
          className="slider-track-container"
          onMouseEnter={() => !disabled && setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={`slider-track-bg ${isHovered ? "hovered" : ""}`} />
          <div
            className={[
              "slider-track-fill",
              isDragging ? "dragging" : "",
              isHovered ? "hovered" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ width: `${progress}%` }}
          />
          <input
            ref={ref}
            id={inputId}
            type="range"
            value={localValue}
            onInput={handleInput}
            onChange={handleChange}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className={[
              "slider-input",
              isDragging ? "dragging" : "",
              isHovered ? "hovered" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-label={label}
            aria-describedby={helperTextId}
            {...inputProps}
          />
        </div>

        {helperText && (
          <div id={helperTextId} className="slider-helper">
            {helperText}
          </div>
        )}
      </div>
    </>
  );
};

const SliderStyles = () => {
  return (
    <style href="slider" precedence="medium">{`
      .slider-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
      }

      .slider-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--space-1);
      }

      .slider-label {
        font-size: 0.875rem;
        font-weight: 550;
        color: var(--text);
        letter-spacing: -0.01em;
        line-height: 1.4;
      }

      .slider-container.error .slider-label {
        color: var(--error);
      }

      .slider-value {
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--primary);
        font-variant-numeric: tabular-nums;
        background: var(--backgroundSecondary);
        padding: var(--space-1) var(--space-2);
        border-radius: var(--space-1);
        border: 1px solid var(--borderLight);
        min-width: 40px;
        text-align: center;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 1px 3px var(--shadowLight);
      }

      .slider-container.error .slider-value {
        color: var(--error);
        border-color: color-mix(in srgb, var(--error) 40%, transparent);
      }

      /* 理论上想在拖拽时放大数值显示（保持原逻辑写法） */
      .slider-value:has(.dragging) {
        transform: scale(1.05);
        box-shadow: 0 2px 6px var(--shadowMedium);
      }

      .slider-track-container {
        position: relative;
        display: flex;
        align-items: center;
        cursor: pointer;
      }

      .slider-container.size-small .slider-track-container {
        height: 24px;
        padding: var(--space-1) 0;
      }

      .slider-container.size-medium .slider-track-container {
        height: 28px;
        padding: var(--space-2) 0;
      }

      .slider-container.size-large .slider-track-container {
        height: 32px;
        padding: var(--space-2) 0;
      }

      .slider-track-bg {
        position: absolute;
        width: 100%;
        background: var(--backgroundTertiary);
        border-radius: 2px;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        border: 1px solid var(--borderLight);
      }

      .slider-container.size-small .slider-track-bg {
        height: 3px;
      }

      .slider-container.size-medium .slider-track-bg {
        height: 4px;
      }

      .slider-container.size-large .slider-track-bg {
        height: 5px;
      }

      .slider-track-bg.hovered {
        background: var(--backgroundSelected);
        transform: scaleY(1.2);
      }

      .slider-track-fill {
        position: absolute;
        background: linear-gradient(
          90deg,
          var(--primary) 0%,
          color-mix(in srgb, var(--primary) 90%, transparent) 100%
        );
        border-radius: 2px;
        transition:
          width 0.15s cubic-bezier(0.16, 1, 0.3, 1),
          transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
          box-shadow 0.3s ease;
        box-shadow: 0 1px 3px color-mix(in srgb, var(--primary) 20%, transparent);
      }

      .slider-container.size-small .slider-track-fill {
        height: 3px;
      }

      .slider-container.size-medium .slider-track-fill {
        height: 4px;
      }

      .slider-container.size-large .slider-track-fill {
        height: 5px;
      }

      .slider-container.error .slider-track-fill {
        background: linear-gradient(
          90deg,
          var(--error) 0%,
          color-mix(in srgb, var(--error) 90%, transparent) 100%
        );
        box-shadow: 0 1px 3px color-mix(in srgb, var(--error) 20%, transparent);
      }

      .slider-track-fill.hovered {
        transform: scaleY(1.2);
      }

      .slider-track-fill.dragging {
        transition: none;
        box-shadow: 0 0 12px color-mix(in srgb, var(--primary) 40%, transparent);
      }

      .slider-container.error .slider-track-fill.dragging {
        box-shadow: 0 0 12px color-mix(in srgb, var(--error) 40%, transparent);
      }

      .slider-input {
        width: 100%;
        height: 100%;
        background: transparent;
        -webkit-appearance: none;
        appearance: none;
        outline: none;
        cursor: pointer;
        position: relative;
        z-index: 1;
      }

      .slider-input:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }

      .slider-container.disabled {
        opacity: 0.6;
        pointer-events: none;
      }

      /* WebKit Thumb */
      .slider-input::-webkit-slider-thumb {
        -webkit-appearance: none;
        border-radius: 50%;
        background: var(--background);
        border: 2px solid var(--primary);
        cursor: grab;
        box-shadow: 0 2px 6px var(--shadowLight), 0 0 0 0 transparent;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      .slider-container.size-small .slider-input::-webkit-slider-thumb {
        width: 14px;
        height: 14px;
      }

      .slider-container.size-medium .slider-input::-webkit-slider-thumb {
        width: 16px;
        height: 16px;
      }

      .slider-container.size-large .slider-input::-webkit-slider-thumb {
        width: 18px;
        height: 18px;
      }

      .slider-container.error .slider-input::-webkit-slider-thumb {
        border-color: var(--error);
      }

      .slider-input.hovered::-webkit-slider-thumb {
        transform: scale(1.1);
        box-shadow: 0 3px 8px var(--shadowMedium);
      }

      .slider-input.dragging::-webkit-slider-thumb {
        cursor: grabbing;
        transform: scale(1.15);
        box-shadow:
          0 4px 12px var(--shadowMedium),
          0 0 0 4px color-mix(in srgb, var(--primary) 20%, transparent);
      }

      .slider-container.error .slider-input.dragging::-webkit-slider-thumb {
        box-shadow:
          0 4px 12px var(--shadowMedium),
          0 0 0 4px color-mix(in srgb, var(--error) 20%, transparent);
      }

      .slider-input:focus-visible::-webkit-slider-thumb {
        box-shadow:
          0 2px 8px var(--shadowMedium),
          0 0 0 3px color-mix(in srgb, var(--primary) 30%, transparent);
      }

      .slider-container.error .slider-input:focus-visible::-webkit-slider-thumb {
        box-shadow:
          0 2px 8px var(--shadowMedium),
          0 0 0 3px color-mix(in srgb, var(--error) 30%, transparent);
      }

      .slider-input:disabled::-webkit-slider-thumb {
        border-color: var(--textQuaternary);
        background: var(--textQuaternary);
        transform: scale(1);
        box-shadow: none;
        cursor: not-allowed;
      }

      /* Firefox Thumb */
      .slider-input::-moz-range-thumb {
        border-radius: 50%;
        background: var(--background);
        border: 2px solid var(--primary);
        cursor: grab;
        box-shadow: 0 2px 6px var(--shadowLight);
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      .slider-container.size-small .slider-input::-moz-range-thumb {
        width: 14px;
        height: 14px;
      }

      .slider-container.size-medium .slider-input::-moz-range-thumb {
        width: 16px;
        height: 16px;
      }

      .slider-container.size-large .slider-input::-moz-range-thumb {
        width: 18px;
        height: 18px;
      }

      .slider-container.error .slider-input::-moz-range-thumb {
        border-color: var(--error);
      }

      .slider-input.hovered::-moz-range-thumb {
        transform: scale(1.1);
        box-shadow: 0 3px 8px var(--shadowMedium);
      }

      .slider-input.dragging::-moz-range-thumb {
        cursor: grabbing;
        transform: scale(1.15);
        box-shadow:
          0 4px 12px var(--shadowMedium),
          0 0 0 4px color-mix(in srgb, var(--primary) 20%, transparent);
      }

      .slider-input:disabled::-moz-range-thumb {
        border-color: var(--textQuaternary);
        background: var(--textQuaternary);
        transform: scale(1);
        box-shadow: none;
        cursor: not-allowed;
      }

      .slider-helper {
        font-size: 0.8125rem;
        line-height: 1.4;
        margin-top: var(--space-1);
        letter-spacing: -0.01em;
        color: var(--textTertiary);
      }

      .slider-container.error .slider-helper {
        color: var(--error);
      }

      /* 响应式：小屏 thumb 稍微大一点 */
      @media (max-width: 768px) {
        .slider-input::-webkit-slider-thumb {
          width: 18px;
          height: 18px;
        }

        .slider-input::-moz-range-thumb {
          width: 18px;
          height: 18px;
        }
      }

      /* 减少动画偏好 */
      @media (prefers-reduced-motion: reduce) {
        .slider-track-bg,
        .slider-track-fill,
        .slider-value,
        .slider-input::-webkit-slider-thumb,
        .slider-input::-moz-range-thumb {
          transition: none;
        }
      }
    `}</style>
  );
};

Slider.displayName = "Slider";
