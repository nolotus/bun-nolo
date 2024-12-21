import React, { useState } from "react";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { defaultTheme } from "render/styles/colors";

interface PasswordInputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	error?: boolean;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
	({ error, style, ...props }, ref) => {
		const [showPassword, setShowPassword] = useState(false);

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
              border: 1px solid ${defaultTheme.border};
              font-size: 13px;
              font-weight: 500;
              color: ${defaultTheme.text};
              background: ${defaultTheme.background};
              outline: none;
              transition: all 0.15s ease;
            }

            .password-input:focus {
              border-color: ${defaultTheme.primary};
              box-shadow: 0 0 0 3.5px ${defaultTheme.focus};
            }

            .password-input:hover {
              border-color: ${defaultTheme.hover};
            }
            
            .password-input:disabled {
              background: ${defaultTheme.disabled};
              cursor: not-allowed;
            }

            .password-input::placeholder {
              color: ${defaultTheme.placeholder};
            }

            .password-input.error {
              border-color: ${defaultTheme.error};
            }

            .toggle-button {
              position: absolute;
              right: 8px;
              top: 50%;
              transform: translateY(-50%);
              background: none;
              border: none;
              color: ${defaultTheme.placeholder};
              cursor: pointer;
              padding: 8px;
              display: flex;
              align-items: center;
              transition: color 0.15s ease;
            }

            .toggle-button:hover {
              color: ${defaultTheme.text};
            }

            .toggle-button:disabled {
              cursor: not-allowed;
              color: ${defaultTheme.disabled};
            }
          `}
				</style>

				<div className="password-input-wrapper">
					<input
						{...props}
						ref={ref}
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
	},
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
