// web/ui/ToggleSwitch.tsx

import { useTheme } from "app/theme";
import type React from "react";
import { useEffect, useState } from "react";

interface ToggleSwitchProps {
  disabled?: boolean;
  loading?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  value?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  disabled = false,
  loading = false,
  checked,
  defaultChecked = false,
  onChange,
  ariaLabelledby,
  ariaDescribedby,
  value,
}) => {
  const theme = useTheme();
  const [isChecked, setIsChecked] = useState<boolean>(value ?? defaultChecked);

  useEffect(() => {
    if (checked !== undefined) {
      setIsChecked(checked);
    }
  }, [checked]);

  const handleToggle = () => {
    if (!loading && !disabled) {
      const newChecked = !isChecked;
      setIsChecked(newChecked);
      onChange?.(newChecked);
    }
  };

  return (
    <>
      <label
        className="toggle-wrapper"
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
      >
        <input
          type="checkbox"
          className="toggle-input"
          checked={isChecked}
          onChange={handleToggle}
          disabled={disabled || loading}
        />
        <div className={`toggle-switch ${isChecked ? "checked" : ""}`}>
          <span className="toggle-background"></span>
          {!loading ? (
            <span className="toggle-handle"></span>
          ) : (
            <span className="toggle-loading">Loading...</span>
          )}
        </div>
      </label>
      <style>
        {`
          .toggle-wrapper {
            display: inline-block;
            cursor: ${disabled ? "not-allowed" : "pointer"};
          }

          .toggle-switch {
            user-select: none;
            transition: 0.2s ease;
            display: inline-block;
            height: 30px;
            width: 51px;
            position: relative;
            box-shadow: inset 0 0 0px 2px ${disabled ? theme.disabled : theme.border};
            border-radius: 60px;
            opacity: ${disabled ? 0.5 : 1};
            pointer-events: ${loading ? "none" : "auto"};
          }

          .toggle-switch.checked {
            box-shadow: none;
          }

          .toggle-background {
            content: '';
            position: absolute;
            display: block;
            height: 30px;
            width: 51px;
            top: 0;
            left: 0;
            border-radius: 15px;
            background: ${theme.border};
            transition: 0.2s cubic-bezier(.24,0,.5,1);
          }

          .toggle-switch.checked .toggle-background {
            background: ${theme.primary};
          }

          .toggle-handle {
            content: '';
            position: absolute;
            display: block;
            height: 28px;
            width: 28px;
            top: 50%;
            margin-top: -14px;
            left: 1px;
            border-radius: 60px;
            background: ${theme.background};
            box-shadow: 0 0 0 1px hsla(0, 0%, 0%, 0.1),
                       0 4px 0px 0 hsla(0, 0%, 0%, 0.04),
                       0 4px 9px hsla(0, 0%, 0%, 0.13),
                       0 3px 3px hsla(0, 0%, 0%, 0.05);
            transition: 0.35s cubic-bezier(.54,1.60,.5,1);
            opacity: ${loading ? 0.6 : 1};
          }

          .toggle-switch.checked .toggle-handle {
            left: 22px;
          }

          .toggle-loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: ${theme.textSecondary};
            font-size: 12px;
          }

          .toggle-input {
            position: absolute;
            opacity: 0;
            width: 0;
            height: 0;
          }
        `}
      </style>
    </>
  );
};

export default ToggleSwitch;
