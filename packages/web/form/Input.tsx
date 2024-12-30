// web/form/Input.tsx:
import { useTheme } from "app/theme";
import type React from "react";


interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: boolean;
}


export const Input = ({ icon, error, style, ...props }: InputProps) => {
  const theme = useTheme();


  return (
    <>
      <style>
        {`
          .input-wrapper {
            position: relative;
            width: 100%;
          }


          .input-field {
            width: 100%;
            height: 42px;
            padding: ${icon ? "0 12px 0 42px" : "0 12px"};
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


          .input-field:focus {
            border-color: ${error ? theme.error : theme.primary};
            box-shadow: 0 0 0 3px ${error ? `${theme.error}20` : theme.primaryGhost};
          }


          .input-field:hover {
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
        `}
      </style>
      <div className="input-wrapper">
        {icon && <div className="input-icon">{icon}</div>}
        <input className="input-field" {...props} />
      </div>
    </>
  );
};
