// render/web/form/Slider.tsx
import React, { useCallback, useState, forwardRef } from "react";
import { useTheme } from "app/theme";

export interface SliderProps {
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
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
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
    },
    ref
  ) => {
    const theme = useTheme();
    const [localValue, setLocalValue] = useState(value);
    const [isDragging, setIsDragging] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

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

    React.useEffect(() => {
      if (!isDragging) setLocalValue(value);
    }, [value, isDragging]);

    const displayValue =
      step < 1 ? localValue.toFixed(1) : Math.round(localValue).toString();

    return (
      <>
        <SliderStyles />
        <div
          className={`slider-container size-${size} ${disabled ? "disabled" : ""} ${error ? "error" : ""} ${className}`}
        >
          {(label || showValue) && (
            <div className="slider-header">
              {label && <span className="slider-label">{label}</span>}
              {showValue && (
                <span className="slider-value">{displayValue}</span>
              )}
            </div>
          )}

          <div
            className="slider-track-container"
            onMouseEnter={() => !disabled && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className={`slider-track-bg ${isHovered ? "hovered" : ""}`} />
            <div
              className={`slider-track-fill ${isDragging ? "dragging" : ""} ${isHovered ? "hovered" : ""}`}
              style={{ width: `${progress}%` }}
            />
            <input
              ref={ref}
              type="range"
              value={localValue}
              onInput={handleInput}
              onChange={handleChange}
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              className={`slider-input ${isDragging ? "dragging" : ""} ${isHovered ? "hovered" : ""}`}
              aria-label={label}
              aria-describedby={helperText ? "slider-helper" : undefined}
            />
          </div>

          {helperText && (
            <div id="slider-helper" className="slider-helper">
              {helperText}
            </div>
          )}
        </div>
      </>
    );
  }
);

const SliderStyles = () => {
  const theme = useTheme();

  return (
    <style href="slider" precedence="medium">{`
      .slider-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: ${theme.space[2]};
      }

      .slider-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: ${theme.space[1]};
      }

      .slider-label {
        font-size: 0.875rem;
        font-weight: 550;
        color: ${theme.text};
        letter-spacing: -0.01em;
        line-height: 1.4;
      }

      .slider-container.error .slider-label {
        color: ${theme.error};
      }

      .slider-value {
        font-size: 0.8125rem;
        font-weight: 600;
        color: ${theme.primary};
        font-variant-numeric: tabular-nums;
        background: ${theme.backgroundSecondary};
        padding: ${theme.space[1]} ${theme.space[2]};
        border-radius: ${theme.space[1]};
        border: 1px solid ${theme.borderLight};
        min-width: 40px;
        text-align: center;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 1px 3px ${theme.shadow1};
      }

      .slider-container.error .slider-value {
        color: ${theme.error};
        border-color: ${theme.error}40;
      }

      .slider-value:has(.dragging) {
        transform: scale(1.05);
        box-shadow: 0 2px 6px ${theme.shadow2};
      }

      .slider-track-container {
        position: relative;
        display: flex;
        align-items: center;
        cursor: pointer;
      }

      .slider-container.size-small .slider-track-container {
        height: 24px;
        padding: ${theme.space[1]} 0;
      }

      .slider-container.size-medium .slider-track-container {
        height: 28px;
        padding: ${theme.space[2]} 0;
      }

      .slider-container.size-large .slider-track-container {
        height: 32px;
        padding: ${theme.space[2]} 0;
      }

      .slider-track-bg {
        position: absolute;
        width: 100%;
        background: ${theme.backgroundTertiary};
        border-radius: 2px;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        border: 1px solid ${theme.borderLight};
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
        background: ${theme.backgroundSelected || theme.backgroundHover};
        transform: scaleY(1.2);
      }

      .slider-track-fill {
        position: absolute;
        background: linear-gradient(90deg, ${theme.primary} 0%, ${theme.primary}90 100%);
        border-radius: 2px;
        transition: width 0.15s cubic-bezier(0.16, 1, 0.3, 1), 
                    transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                    box-shadow 0.3s ease;
        box-shadow: 0 1px 3px ${theme.primary}20;
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
        background: linear-gradient(90deg, ${theme.error} 0%, ${theme.error}90 100%);
      }

      .slider-track-fill.hovered {
        transform: scaleY(1.2);
      }

      .slider-track-fill.dragging {
        transition: none;
        box-shadow: 0 0 12px ${theme.primary}40;
      }

      .slider-container.error .slider-track-fill.dragging {
        box-shadow: 0 0 12px ${theme.error}40;
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

      /* Webkit Thumb 样式 */
      .slider-input::-webkit-slider-thumb {
        -webkit-appearance: none;
        border-radius: 50%;
        background: ${theme.background};
        border: 2px solid ${theme.primary};
        cursor: grab;
        box-shadow: 0 2px 6px ${theme.shadow1}, 0 0 0 0 ${theme.primary}00;
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
        border-color: ${theme.error};
      }

      .slider-input.hovered::-webkit-slider-thumb {
        transform: scale(1.1);
        box-shadow: 0 3px 8px ${theme.shadow2};
      }

      .slider-input.dragging::-webkit-slider-thumb {
        cursor: grabbing;
        transform: scale(1.15);
        box-shadow: 0 4px 12px ${theme.shadow2}, 0 0 0 4px ${theme.primary}20;
      }

      .slider-container.error .slider-input.dragging::-webkit-slider-thumb {
        box-shadow: 0 4px 12px ${theme.shadow2}, 0 0 0 4px ${theme.error}20;
      }

      .slider-input:focus-visible::-webkit-slider-thumb {
        box-shadow: 0 2px 8px ${theme.shadow2}, 0 0 0 3px ${theme.primary}30;
      }

      .slider-container.error .slider-input:focus-visible::-webkit-slider-thumb {
        box-shadow: 0 2px 8px ${theme.shadow2}, 0 0 0 3px ${theme.error}30;
      }

      .slider-input:disabled::-webkit-slider-thumb {
        border-color: ${theme.textQuaternary};
        background: ${theme.textQuaternary};
        transform: scale(1);
        box-shadow: none;
        cursor: not-allowed;
      }

      /* Mozilla Thumb 样式 */
      .slider-input::-moz-range-thumb {
        border-radius: 50%;
        background: ${theme.background};
        border: 2px solid ${theme.primary};
        cursor: grab;
        box-shadow: 0 2px 6px ${theme.shadow1};
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
        border-color: ${theme.error};
      }

      .slider-input.hovered::-moz-range-thumb {
        transform: scale(1.1);
        box-shadow: 0 3px 8px ${theme.shadow2};
      }

      .slider-input.dragging::-moz-range-thumb {
        cursor: grabbing;
        transform: scale(1.15);
        box-shadow: 0 4px 12px ${theme.shadow2}, 0 0 0 4px ${theme.primary}20;
      }

      .slider-helper {
        font-size: 0.8125rem;
        line-height: 1.4;
        margin-top: ${theme.space[1]};
        letter-spacing: -0.01em;
        color: ${theme.textTertiary};
      }

      .slider-container.error .slider-helper {
        color: ${theme.error};
      }

      /* 响应式设计 */
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
