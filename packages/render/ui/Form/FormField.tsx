import React from "react";
import { useTranslation } from "react-i18next";
import { getLogger } from "utils/logger";
//new style
import { TextField } from "./TextField";
import { PasswordField } from "./PasswordField";

import { FormFieldProps } from "./type";

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const i18nLogger = getLogger("i18n");
//todos
//deps ,setValueAs,valueAsDate,valueAsNumber,validate,pattern,min,max,minLength,maxLength
export const FormField: React.FC<FormFieldProps> = ({
  id,
  type,
  register,
  errors,
  label,
  options,
  subtype,
  readOnly,
  optional,
  defaultValue,
  className,
  icon,
}) => {
  const { t } = useTranslation();
  const translatedLabel = capitalizeFirstLetter(t(label));
  i18nLogger.info({ label, translatedLabel }, "Translated label");

  let FieldComponent;
  switch (type) {
    case "string":
      FieldComponent = (
        <TextField
          id={id}
          optional={optional}
          register={register}
          label={translatedLabel}
          readOnly={readOnly}
          defaultValue={defaultValue}
          icon={icon}
        />
      );
      break;

    case "password":
      FieldComponent = (
        <PasswordField
          id={id}
          register={register}
          label={translatedLabel}
          icon={icon}
        />
      );
      break;

    default:
      FieldComponent = null;
  }

  return (
    <div className={className}>
      <div>{FieldComponent}</div>
      {errors && errors[id] && (
        <p className="mt-2 text-xs text-red-500">
          {String(errors[id].message)}
        </p>
      )}
    </div>
  );
};
// 考虑文本，数字  文件和媒体，地理信息，逻辑状态， 复杂类型
// map: 键值对。
// tuple: 元组。
// union: 联合类型。
// intersection: 交叉类型。
