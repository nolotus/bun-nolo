import { EyeClosedIcon, EyeIcon } from "@primer/octicons-react";
import { useTheme } from "app/theme";
import type React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getLogger } from "utils/logger";

const i18nLogger = getLogger("i18n");

const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export const FormField: React.FC = ({
    id,
    type,
    register,
    errors,
    label,
    options,
    readOnly,
    optional,
    defaultValue,
    className,
    icon,
}) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const translatedLabel = capitalizeFirstLetter(t(label));
    const [showPassword, setShowPassword] = useState(false);

    i18nLogger.info({ label, translatedLabel }, "Translated label");

    const fieldStyles = `
    .input-field {
      width: 100%;
      height: 42px;
      font-size: 15px;
      border: 1px solid ${theme.border};
      border-radius: 8px;
      background-color: ${theme.background};
      transition: all 0.2s;
      padding: ${icon ? "0 42px" : "0 12px"};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen;
      color: ${theme.text};
    }

    .input-field:focus {
      border-color: ${theme.primary};
      box-shadow: 0 0 0 3px ${theme.primaryGhost};
      outline: none;
    }
    
    .input-field::placeholder {
      color: ${theme.placeholder};
      font-size: 15px;
    }
    
    .field-container {
      position: relative;
      max-width: 420px;
      margin: 10px auto;
    }
    
    .field-icon {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      color: ${theme.textSecondary};
      display: flex;
      align-items: center;
    }
    
    .field-icon-left {
      left: 12px;
    }
    
    .field-icon-right {
      right: 12px;
      cursor: pointer;
      padding: 8px;
    }
    
    .field-error {
      margin-top: 8px;
      font-size: 14px;
      color: ${theme.error};
    }
  `;

    let FieldComponent;
    switch (type) {
        case "password":
            FieldComponent = (
                <div className="field-container">
                    {icon && <div className="field-icon field-icon-left">{icon}</div>}
                    <input
                        type={showPassword ? "text" : "password"}
                        id={id}
                        placeholder={t("enterPassword")}
                        {...register(id)}
                        className="input-field"
                        required
                    />
                    <div
                        onClick={() => setShowPassword(!showPassword)}
                        className="field-icon field-icon-right"
                    >
                        {showPassword ? <EyeClosedIcon size={20} /> : <EyeIcon size={20} />}
                    </div>
                </div>
            );
            break;

        case "string":
        default:
            FieldComponent = (
                <div className="field-container">
                    {icon && <div className="field-icon field-icon-left">{icon}</div>}
                    <input
                        type="text"
                        id={id}
                        {...register(id)}
                        className="input-field"
                        readOnly={readOnly}
                        defaultValue={defaultValue}
                        required={!optional}
                        placeholder={t(`placeholder.${id}`)}
                    />
                </div>
            );
    }

    return (
        <div className={className}>
            <style>{fieldStyles}</style>
            {FieldComponent}
            {errors && errors[id] && (
                <p className="field-error">{String(errors[id].message)}</p>
            )}
        </div>
    );
};
