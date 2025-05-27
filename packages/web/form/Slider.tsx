import React, { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  label?: string;
  showValue?: boolean;
  className?: string;
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
  className = "",
}: SliderProps) => {
  const theme = useSelector(selectTheme);
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
    <div className={`slider ${className}`}>
      {(label || showValue) && (
        <div className="header">
          {label && <span className="label">{label}</span>}
          {showValue && <span className="value">{displayValue}</span>}
        </div>
      )}

      <div
        className="track-container"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="track-bg" />
        <div className="track-fill" style={{ width: `${progress}%` }} />
        <input
          type="range"
          value={localValue}
          onInput={handleInput}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="slider-input"
        />
      </div>

      <style jsx>{`
        .slider {
          width: 100%;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .label {
          font-size: 13px;
          font-weight: 500;
          color: ${theme.text};
          transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .value {
          font-size: 13px;
          font-weight: 600;
          color: ${theme.primary};
          font-variant-numeric: tabular-nums;
          background: ${theme.backgroundSecondary};
          padding: 2px 8px;
          border-radius: 4px;
          min-width: 32px;
          text-align: center;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          transform: ${isDragging ? "scale(1.05)" : "scale(1)"};
        }

        .track-container {
          position: relative;
          height: 28px;
          display: flex;
          align-items: center;
          padding: 4px 0;
        }

        .track-bg {
          position: absolute;
          width: 100%;
          height: 4px;
          background: ${theme.backgroundTertiary};
          border-radius: 2px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform: ${isHovered ? "scaleY(1.2)" : "scaleY(1)"};
        }

        .track-fill {
          position: absolute;
          height: 4px;
          background: linear-gradient(
            90deg,
            ${theme.primary},
            ${theme.primary}dd
          );
          border-radius: 2px;
          transition: ${isDragging
            ? "none"
            : "width 0.15s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"};
          transform: ${isHovered ? "scaleY(1.2)" : "scaleY(1)"};
          box-shadow: ${isDragging ? `0 0 8px ${theme.primary}40` : "none"};
        }

        .slider-input {
          width: 100%;
          height: 28px;
          background: transparent;
          -webkit-appearance: none;
          appearance: none;
          outline: none;
          cursor: ${disabled ? "not-allowed" : "pointer"};
          opacity: ${disabled ? 0.6 : 1};
          position: relative;
          z-index: 1;
        }

        .slider-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: ${theme.background};
          border: 2px solid ${theme.primary};
          cursor: ${disabled ? "not-allowed" : "grab"};
          box-shadow:
            0 2px 4px ${theme.shadowLight},
            0 0 0 0 ${theme.primary}00;
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transform: ${isDragging
            ? "scale(1.1)"
            : isHovered
              ? "scale(1.05)"
              : "scale(1)"};
        }

        .slider-input::-webkit-slider-thumb:active {
          cursor: grabbing;
          box-shadow:
            0 4px 8px ${theme.shadowMedium},
            0 0 0 4px ${theme.primary}20;
        }

        .slider-input::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: ${theme.background};
          border: 2px solid ${theme.primary};
          cursor: ${disabled ? "not-allowed" : "grab"};
          box-shadow: 0 2px 4px ${theme.shadowLight};
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transform: ${isDragging
            ? "scale(1.1)"
            : isHovered
              ? "scale(1.05)"
              : "scale(1)"};
        }

        .slider-input::-moz-range-thumb:active {
          cursor: grabbing;
          box-shadow:
            0 4px 8px ${theme.shadowMedium},
            0 0 0 4px ${theme.primary}20;
        }

        .slider-input:focus {
          outline: none;
        }

        .slider-input:focus::-webkit-slider-thumb {
          box-shadow:
            0 2px 6px ${theme.shadowMedium},
            0 0 0 3px ${theme.primary}30;
        }

        .slider-input:focus::-moz-range-thumb {
          box-shadow:
            0 2px 6px ${theme.shadowMedium},
            0 0 0 3px ${theme.primary}30;
        }

        /* 禁用状态 */
        .slider-input:disabled::-webkit-slider-thumb {
          border-color: ${theme.textQuaternary};
          background: ${theme.textQuaternary};
          transform: scale(1);
          box-shadow: none;
          transition: none;
        }

        .slider-input:disabled::-moz-range-thumb {
          border-color: ${theme.textQuaternary};
          background: ${theme.textQuaternary};
          transform: scale(1);
          box-shadow: none;
          transition: none;
        }

        .slider-input:disabled ~ .track-fill {
          background: ${theme.textQuaternary};
          box-shadow: none;
          transform: scaleY(1);
        }

        .slider-input:disabled ~ .track-bg {
          transform: scaleY(1);
        }

        /* 微妙的脉冲效果 - 仅在拖拽时 */
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 ${theme.primary}40;
          }
          70% {
            box-shadow: 0 0 0 4px ${theme.primary}00;
          }
          100% {
            box-shadow: 0 0 0 0 ${theme.primary}00;
          }
        }

        .track-fill {
          animation: ${isDragging ? "pulse 1s infinite" : "none"};
        }
      `}</style>
    </div>
  );
};
