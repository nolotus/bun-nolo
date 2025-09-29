// web/form/FormField.tsx
import type React from "react";
import type { ReactNode, LabelHTMLAttributes } from "react";

interface FormFieldProps {
  children: ReactNode;
  className?: string;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string; // 改回 helperText
  horizontal?: boolean;
  labelWidth?: string;
  disabled?: boolean;
  hideLabel?: boolean;
  style?: React.CSSProperties;
  htmlFor?: string;
}

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  error?: boolean;
}

// 内部 Label 组件 - 简化实现
const Label: React.FC<LabelProps> = ({
  children,
  required,
  error,
  className = "",
  ...props
}) => (
  <label
    className={`form-label ${error ? "has-error" : ""} ${className}`}
    {...props}
  >
    {children}
    {required && <span className="required">*</span>}
  </label>
);

export const FormField: React.FC<FormFieldProps> = ({
  children,
  className = "",
  label,
  required = false,
  error,
  helperText, // 改回 helperText
  horizontal = false,
  labelWidth = "140px",
  disabled = false,
  hideLabel = false,
  style,
  htmlFor,
}) => {
  const hasError = Boolean(error);

  // 构建CSS类名
  const fieldClasses = [
    "form-field",
    horizontal && "horizontal",
    disabled && "disabled",
    hasError && "error",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={fieldClasses} style={style}>
      {!hideLabel && label && (
        <Label
          required={required}
          error={hasError}
          htmlFor={htmlFor}
          style={horizontal ? { flexBasis: labelWidth } : undefined}
        >
          {label}
        </Label>
      )}

      <div className="form-content">
        {children}
        {helperText && !hasError && (
          <div className="form-help">{helperText}</div>
        )}
        {hasError && error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
      </div>

      <style href="form-field" precedence="medium">{`
        .form-field {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          margin-bottom: var(--space-5);
          min-width: 0;
        }

        .form-field.horizontal {
          flex-direction: row;
          align-items: flex-start;
          gap: var(--space-4);
        }

        .form-field.disabled {
          opacity: 0.65;
          pointer-events: none;
        }

        /* 标签样式 */
        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          line-height: 1.4;
          color: var(--text);
          margin: 0;
          transition: color 0.2s ease;
        }

        .form-field.horizontal .form-label {
          flex-shrink: 0;
          padding-top: calc(var(--space-2) + 1px); /* 与输入框视觉对齐 */
          white-space: nowrap;
        }

        .form-label.has-error {
          color: var(--error);
        }

        .required {
          color: var(--error);
          margin-left: var(--space-1);
          font-weight: 600;
          font-size: 0.9em;
        }

        /* 内容区域 */
        .form-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        /* 帮助文本和错误信息 */
        .form-help,
        .form-error {
          font-size: 13px;
          line-height: 1.4;
          margin: 0;
          padding-left: var(--space-1);
        }

        .form-help {
          color: var(--textTertiary);
        }

        .form-error {
          color: var(--error);
          font-weight: 500;
        }

        /* 错误状态的字段样式继承 */
        .form-field.error {
          --field-border: var(--error);
          --field-focus: var(--error);
        }

        .form-field .input-field,
        .form-field .textarea-field,
        .form-field .select-field {
          border-color: var(--field-border, var(--border));
        }

        .form-field .input-field:focus,
        .form-field .textarea-field:focus,
        .form-field .select-field:focus {
          border-color: var(--field-focus, var(--primary));
          box-shadow: 0 0 0 3px var(--focus);
        }

        .form-field.error .input-field:focus,
        .form-field.error .textarea-field:focus,
        .form-field.error .select-field:focus {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        /* 交互状态 */
        .form-field:focus-within .form-label:not(.has-error) {
          color: var(--primary);
        }

        .form-field:hover:not(.disabled) .form-label:not(.has-error) {
          color: var(--textSecondary);
        }

        .form-field.disabled .form-label,
        .form-field.disabled .required {
          color: var(--textQuaternary);
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .form-field {
            gap: var(--space-1);
            margin-bottom: var(--space-4);
          }

          .form-field.horizontal {
            flex-direction: column;
            gap: var(--space-2);
          }

          .form-field.horizontal .form-label {
            padding-top: 0;
          }

          .form-label {
            font-size: 13px;
          }

          .form-help,
          .form-error {
            font-size: 12px;
            padding-left: 0;
          }
        }

        @media (max-width: 480px) {
          .form-field {
            margin-bottom: var(--space-3);
          }
        }

        /* 可访问性增强 */
        @media (prefers-contrast: high) {
          .form-label {
            font-weight: 600;
          }
          
          .required,
          .form-error {
            font-weight: 700;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .form-label {
            transition: none;
          }
        }

        /* 细节优化 */
        .form-field + .form-field {
          margin-top: calc(var(--space-1) * -1); /* 减少相邻字段间距 */
        }

        /* 当字段获得焦点时，微妙的整体提升 */
        .form-field:focus-within {
          position: relative;
          z-index: 1;
        }

        /* 帮助文本的微妙动画 */
        .form-help,
        .form-error {
          opacity: 0.9;
          transition: opacity 0.2s ease;
        }

        .form-field:focus-within .form-help,
        .form-field:focus-within .form-error {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export { Label };

FormField.displayName = "FormField";
Label.displayName = "Label";
