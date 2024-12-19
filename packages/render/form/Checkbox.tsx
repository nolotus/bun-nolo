import React from "react";
import { defaultTheme } from "render/styles/colors";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
	({ label, className, style, disabled, checked, ...props }, ref) => {
		return (
			<>
				<style>
					{`
            .checkbox-wrapper {
              display: inline-flex;
              align-items: center;
              position: relative;
              padding: 8px;
              min-height: 36px;
              cursor: ${disabled ? "not-allowed" : "pointer"};
              user-select: none;
              opacity: ${disabled ? "0.5" : "1"};
            }

            .checkbox-input {
              position: absolute;
              opacity: 0;
              width: 0;
              height: 0;
            }

            .checkbox-box {
              position: relative;
              width: 22px;
              height: 22px;
              margin-right: 12px;
              border-radius: 6px;
              transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
              box-shadow: inset 0 0 0 1.5px ${defaultTheme.border};
              background: ${defaultTheme.background};
            }

            .checkbox-input:checked ~ .checkbox-box {
              background: ${defaultTheme.primary};
              box-shadow: none;
              transform: scale(1.05);
            }

            .checkbox-input:checked ~ .checkbox-box::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              border-radius: 5px;
              box-shadow: 0 2px 8px ${defaultTheme.primary}50;
              transition: box-shadow 0.3s ease;
            }

            .checkbox-box::after {
              content: '';
              position: absolute;
              left: 8px;
              top: 4px;
              width: 6px;
              height: 11px;
              border: solid white;
              border-width: 0 2.5px 2.5px 0;
              opacity: 0;
              transform: rotate(45deg) scale(0.8);
              transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            }

            .checkbox-input:checked ~ .checkbox-box::after {
              opacity: 1;
              transform: rotate(45deg) scale(1);
            }

            .checkbox-box::before {
              content: '';
              position: absolute;
              top: -5px;
              left: -5px;
              right: -5px;
              bottom: -5px;
              border-radius: 8px;
              background: ${defaultTheme.focus};
              opacity: 0;
              transform: scale(0.8);
              transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
              z-index: -1;
            }

            .checkbox-input:focus ~ .checkbox-box::before {
              opacity: 1;
              transform: scale(1);
            }

            .checkbox-wrapper:hover .checkbox-box:not(:disabled) {
              box-shadow: inset 0 0 0 1.5px ${defaultTheme.hover};
              transform: scale(1.05);
            }

            .checkbox-wrapper:hover .checkbox-input:checked ~ .checkbox-box::before {
              box-shadow: 0 2px 8px ${defaultTheme.primary}60;
            }

            .checkbox-wrapper:active .checkbox-box {
              transform: scale(0.95);
            }

            .checkbox-label {
              font-size: 14px;
              font-weight: 600;
              color: ${defaultTheme.text};
              letter-spacing: -0.1px;
              line-height: 1.4;
            }

            .checkbox-input:disabled ~ .checkbox-box {
              background: ${defaultTheme.disabled};
              box-shadow: none;
            }

            .checkbox-input:disabled ~ .checkbox-label {
              color: ${defaultTheme.textSecondary};
            }
          `}
				</style>

				<label className={`checkbox-wrapper ${className || ""}`} style={style}>
					<input
						type="checkbox"
						className="checkbox-input"
						ref={ref}
						disabled={disabled}
						checked={checked}
						{...props}
					/>
					<span className="checkbox-box" />
					{label && <span className="checkbox-label">{label}</span>}
				</label>
			</>
		);
	},
);
