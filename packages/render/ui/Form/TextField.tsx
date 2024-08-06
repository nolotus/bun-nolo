import React from "react";
import { getInputClassName } from "render/styles/form";

import { FieldProps } from "./type";

type Props = Partial<FieldProps & { placeholder?: string }>;
export const TextField: React.FC<Props> = ({
  id,
  register,
  optional,
  readOnly,
  defaultValue,
  icon,
  placeholder,
}) => {
  if (readOnly) {
    return (
      <div>
        <p>{defaultValue}</p>
      </div>
    );
  }
  return (
    <div className="relative">
      {icon && (
        <div className="focus:none pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          {icon}
        </div>
      )}
      <input
        type="text"
        placeholder={placeholder}
        id={id}
        {...(register &&
          register(id, {
            required: !optional,
          }))}
        className={getInputClassName(!!icon)}
        readOnly={readOnly}
        defaultValue={defaultValue}
      />
    </div>
  );
};
