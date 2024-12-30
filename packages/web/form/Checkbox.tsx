import { useTheme } from "app/theme";
import type React from "react";


interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}


export const Checkbox = ({
  label,
  className,
  style,
  disabled,
  checked,
  ...props
}: CheckboxProps) => {
  const theme = useTheme();


  return (
    <>
      <style>
        {`
          .checkbox-wrapper {
            display: inline-flex;
            align-items: center;
            position: relative;
            cursor: ${disabled ? "not-allowed" : "pointer"};
            opacity: ${disabled ? "0.5" : "1"};
            gap: 8px;
            padding: 2px;
          }


          .checkbox-input {
            position: absolute;
            opacity: 0;
            width: 0;
            height: 0;
          }


          .checkbox-box {
            position: relative;
            width: 16px;
            height: 16px;
            border-radius: 4px;
            transition: all 0.2s ease;
            background: ${theme.background};
            border: 1.5px solid ${theme.border};
          }


          .checkbox-input:checked ~ .checkbox-box {
            background: ${theme.primary};
            border-color: ${theme.primary};
          }


          .checkbox-box::after {
            content: '';
            position: absolute;
            left: 5px;
            top: 2px;
            width: 4px;
            height: 8px;
            border: solid white;
            border-width: 0 2px 2px 0;
            opacity: 0;
            transform: rotate(45deg) scale(0.8);
            transition: all 0.2s ease;
          }


          .checkbox-input:checked ~ .checkbox-box::after {
            opacity: 1;
            transform: rotate(45deg) scale(1);
          }


          .checkbox-wrapper:hover .checkbox-box:not(:disabled) {
            border-color: ${theme.primaryLight};
          }


          .checkbox-wrapper:hover .checkbox-input:checked ~ .checkbox-box {
            background: ${theme.primaryLight};
            border-color: ${theme.primaryLight};
          }


          .checkbox-label {
            font-size: 14px;
            color: ${theme.textSecondary};
            user-select: none;
          }


          .checkbox-input:focus-visible ~ .checkbox-box {
            box-shadow: 0 0 0 2px ${theme.primaryGhost};
          }


          .checkbox-input:disabled ~ .checkbox-box {
            background: ${theme.backgroundSecondary};
            border-color: ${theme.border};
          }


          .checkbox-input:disabled ~ .checkbox-label {
            color: ${theme.textTertiary};
          }
        `}
      </style>


      <label className={`checkbox-wrapper ${className || ""}`} style={style}>
        <input
          type="checkbox"
          className="checkbox-input"
          disabled={disabled}
          checked={checked}
          {...props}
        />
        <span className="checkbox-box" />
        {label && <span className="checkbox-label">{label}</span>}
      </label>
    </>
  );
};


export default Checkbox;
