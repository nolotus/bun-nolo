// web/form/FormField.tsx
import type React from "react";
import type { ReactNode, LabelHTMLAttributes } from "react";
import { useTheme } from "app/theme";

interface FormFieldProps {
  children: ReactNode;
  className?: string;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  horizontal?: boolean;
  labelWidth?: number | string;
  disabled?: boolean;
  hideLabel?: boolean;
  style?: React.CSSProperties;
  htmlFor?: string;
}

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  error?: boolean;
}

// 内部 Label 组件
const Label: React.FC<LabelProps> = ({
  children,
  required,
  error,
  className = "",
  ...props
}) => {
  return (
    <label
      className={`form-label ${error ? "error" : ""} ${className}`}
      {...props}
    >
      {children}
      {required && <span className="required-indicator">*</span>}
    </label>
  );
};

export const FormField: React.FC<FormFieldProps> = ({
  children,
  className = "",
  label,
  required = false,
  error,
  helperText,
  horizontal = false,
  labelWidth = "140px",
  disabled = false,
  hideLabel = false,
  style,
  htmlFor,
}) => {
  const theme = useTheme();
  const hasError = Boolean(error);

  return (
    <>
      <style href="form-field" precedence="medium">{`
        .form-field {
          display: flex;
          flex-direction: column;
          gap: ${theme.space[2]};
          margin-bottom: ${theme.space[4]};
          min-width: 0;
          position: relative;
        }

        .form-field.horizontal {
          flex-direction: row;
          align-items: flex-start;
          gap: ${theme.space[4]};
        }

        .form-field.disabled {
          opacity: 0.6;
          cursor: not-allowed;
          pointer-events: none;
        }

        .form-field.error {
          --field-border-color: ${theme.error};
          --field-focus-color: ${theme.error};
        }

        .form-label {
          display: inline-block;
          font-size: 0.875rem;
          font-weight: 550;
          line-height: 1.4;
          color: ${theme.text};
          letter-spacing: -0.01em;
          transition: color 0.3s ease;
          cursor: default;
          margin: 0;
        }

        .form-label.error {
          color: ${theme.error};
        }

        .form-field.horizontal .form-label {
          flex: 0 0 ${typeof labelWidth === "number" ? `${labelWidth}px` : labelWidth};
          flex-shrink: 0;
          white-space: nowrap;
          text-align: left;
          padding-top: ${theme.space[1]};
          line-height: 1.5;
        }

        .required-indicator {
          color: ${theme.error};
          margin-left: ${theme.space[1]};
          font-weight: 600;
        }

        .form-control {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: ${theme.space[1]};
        }

        .form-helper {
          font-size: 0.8125rem;
          line-height: 1.4;
          color: ${theme.textTertiary};
          margin: 0;
          letter-spacing: -0.01em;
        }

        .form-error {
          font-size: 0.8125rem;
          line-height: 1.4;
          color: ${theme.error};
          margin: 0;
          letter-spacing: -0.01em;
          font-weight: 500;
        }

        /* 输入框样式继承 */
        .form-field .input-field,
        .form-field .textarea-field {
          border-color: var(--field-border-color, ${theme.border});
        }

        .form-field .input-field:focus,
        .form-field .textarea-field:focus {
          border-color: var(--field-focus-color, ${theme.primary});
          box-shadow: 0 0 0 3px var(--field-focus-color, ${theme.primary})20;
        }

        .form-field.error .input-field:focus,
        .form-field.error .textarea-field:focus {
          box-shadow: 0 0 0 3px ${theme.error}20;
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .form-field {
            gap: ${theme.space[1]};
            margin-bottom: ${theme.space[3]};
          }

          .form-field.horizontal {
            flex-direction: column;
            align-items: stretch;
            gap: ${theme.space[2]};
          }

          .form-field.horizontal .form-label {
            flex: none;
            text-align: left;
            width: 100%;
            padding-top: 0;
          }

          .form-label {
            font-size: 0.8125rem;
          }

          .form-helper,
          .form-error {
            font-size: 0.75rem;
          }
        }

        @media (max-width: 480px) {
          .form-field {
            margin-bottom: ${theme.space[2]};
          }
          
          .form-field.horizontal {
            gap: ${theme.space[1]};
          }
        }

        /* 高对比度支持 */
        @media (prefers-contrast: high) {
          .form-label {
            font-weight: 600;
          }
          
          .required-indicator {
            font-weight: 700;
          }
          
          .form-error {
            font-weight: 600;
          }
        }

        /* 减少动画偏好 */
        @media (prefers-reduced-motion: reduce) {
          .form-label,
          .form-field .input-field,
          .form-field .textarea-field {
            transition: none;
          }
        }

        /* 聚焦时突出标签 */
        .form-field:focus-within .form-label:not(.error) {
          color: ${theme.primary};
        }

        .form-field.error:focus-within .form-label {
          color: ${theme.error};
        }

        /* 悬浮效果 */
        .form-field:hover:not(.disabled) .form-label:not(.error) {
          color: ${theme.textSecondary};
        }

        /* 禁用状态下的标签 */
        .form-field.disabled .form-label {
          color: ${theme.textQuaternary};
        }

        .form-field.disabled .required-indicator {
          color: ${theme.textQuaternary};
        }
      `}</style>

      <div
        className={`form-field ${horizontal ? "horizontal" : ""} ${
          disabled ? "disabled" : ""
        } ${hasError ? "error" : ""} ${className}`}
        style={style}
      >
        {!hideLabel && label && (
          <Label required={required} error={hasError} htmlFor={htmlFor}>
            {label}
          </Label>
        )}

        <div className="form-control">
          {children}
          {helperText && !hasError && (
            <p className="form-helper">{helperText}</p>
          )}
          {hasError && error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

// 导出 Label 组件以便独立使用
export { Label };

FormField.displayName = "FormField";
Label.displayName = "Label";
