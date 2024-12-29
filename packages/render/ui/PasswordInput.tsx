import { useTheme } from "app/theme";
import type React from "react";
import { useState } from "react";
import { GoEye, GoEyeClosed } from "react-icons/go";

interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const PasswordInput = ({ error, style, ...props }: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();
  return (
    <>
      <style>
        {`
          .password-input-wrapper {
            position: relative;
            width: 100%;
          }

          .password-input {
            width: 100%;
            height: 40px;
            padding: 0 40px 0 12px;
            border-radius: 8px;
            border: 1px solid ${theme.border};
            font-size: 13px;
            font-weight: 500;
            color: ${theme.text};
            background: ${theme.background};
            outline: none;
            transition: all 0.15s ease;
          }

          .password-input:focus {
            border-color: ${theme.primary};
            box-shadow: 0 0 0 3.5px ${theme.focus};
          }

          .password-input:hover {
            border-color: ${theme.hover};
          }

          .password-input:disabled {
            background: ${theme.disabled};
            cursor: not-allowed;
          }

          .password-input::placeholder {
            color: ${theme.placeholder};
          }

          .password-input.error {
            border-color: ${theme.error};
          }

          .toggle-button {
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: ${theme.placeholder};
            cursor: pointer;
            padding: 8px;
            display: flex;
            align-items: center;
            transition: color 0.15s ease;
          }

          .toggle-button:hover {
            color: ${theme.text};
          }

          .toggle-button:disabled {
            cursor: not-allowed;
            color: ${theme.disabled};
          }
        `}
      </style>

      <div className="password-input-wrapper">
        <input
          {...props}
          type={showPassword ? "text" : "password"}
          className={`password-input ${error ? "error" : ""}`}
          style={style}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="toggle-button"
          disabled={props.disabled}
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <GoEye size={16} /> : <GoEyeClosed size={16} />}
        </button>
      </div>
    </>
  );
};

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
