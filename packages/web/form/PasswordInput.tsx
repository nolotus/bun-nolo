// web/form/PasswordInput.tsx
import { EyeClosedIcon, EyeIcon } from "@primer/octicons-react";
import { useTheme } from "app/theme";
import type React from "react";
import { useState } from "react";

interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: boolean;
}

const PasswordInput = ({
  icon,
  error,
  style,
  ...props
}: PasswordInputProps) => {
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
            height: 42px;
            padding: ${icon ? "0 42px 0 42px" : "0 42px 0 12px"};
            border-radius: 8px;
            border: 1px solid ${error ? theme.error : theme.border};
            font-size: 15px;
            font-weight: 500;
            color: ${theme.text};
            background: ${theme.background};
            outline: none;
            transition: all 0.2s ease;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen;
          }


          .password-input:focus {
            border-color: ${error ? theme.error : theme.primary};
            box-shadow: 0 0 0 3px ${error ? `${theme.error}20` : theme.primaryGhost};
          }


          .password-input:hover {
            border-color: ${error ? theme.error : theme.hover};
          }


          .input-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: ${theme.textSecondary};
            display: flex;
            align-items: center;
            pointer-events: none;
          }


          .toggle-button {
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: ${theme.textSecondary};
            cursor: pointer;
            padding: 8px;
            display: flex;
            align-items: center;
            transition: color 0.2s ease;
          }


          .toggle-button:hover {
            color: ${theme.text};
          }
        `}
      </style>

      <div className="password-input-wrapper">
        {icon && <div className="input-icon">{icon}</div>}
        <input
          {...props}
          type={showPassword ? "text" : "password"}
          className="password-input"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="toggle-button"
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeClosedIcon size={20} /> : <EyeIcon size={20} />}
        </button>
      </div>
    </>
  );
};

export default PasswordInput;
