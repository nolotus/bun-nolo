import type React from "react";
import type { ReactNode } from "react";
import { useTheme } from "app/theme";

import { Label } from "./Label";

interface FormFieldProps {
  children: ReactNode;
  className?: string;
  label?: string;
  required?: boolean;
  error?: string;
  horizontal?: boolean;
  labelWidth?: number | string;
  help?: string;
  disabled?: boolean;
  hideLabel?: boolean;
  style?: React.CSSProperties;
}

export const FormField: React.FC<FormFieldProps> = ({
  children,
  className,
  label,
  required,
  error,
  horizontal,
  labelWidth,
  help,
  disabled,
  hideLabel,
  style,
}) => {
  const theme = useTheme();

  return (
    <div
      className={`form-field ${horizontal ? "horizontal" : ""} ${disabled ? "disabled" : ""} ${className || ""}`}
      style={style}
    >
      {!hideLabel && label && (
        <Label required={required} className="form-label">
          {label}
        </Label>
      )}

      <div className="form-control">
        {children}
        {help && <div className="form-help">{help}</div>}
        {error && <div className="form-error">{error}</div>}
      </div>

      <style jsx>{`
        .form-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
          min-width: 0;
        }

        .form-field.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .form-field.horizontal {
          flex-direction: row;
          align-items: flex-start;
          gap: 16px;
        }

        .form-field.horizontal .form-label {
          flex: 0 0 ${labelWidth || "140px"};
          flex-shrink: 0;
          white-space: nowrap;
          text-align: right;
          padding-top: 6px;
          margin-right: 16px;
        }

        .form-field.horizontal .form-control {
          flex: 1;
          min-width: 0;
        }

        .form-label {
          display: inline-block;
          font-size: 14px;
          line-height: 20px;
          color: ${theme.text};
        }

        .form-control {
          min-width: 0;
        }

        .form-help {
          color: ${theme.textDim};
          font-size: 12px;
          margin-top: 4px;
        }

        .form-error {
          color: ${theme.error};
          font-size: 12px;
          margin-top: 4px;
        }

        @media (max-width: 640px) {
          .form-field.horizontal {
            flex-direction: column;
            align-items: stretch;
          }

          .form-field.horizontal .form-label {
            flex: none;
            text-align: left;
            width: 100%;
            padding-top: 0;
            margin-right: 0;
          }

          .form-label {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};
