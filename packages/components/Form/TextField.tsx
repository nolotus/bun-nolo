import React from "react";

import { FieldProps } from "./type";
import { getInputClassName } from "app/styles/form";
export const TextField: React.FC<FieldProps> = ({
  id,
  register,
  optional,
  readOnly,
  defaultValue,
  icon,
}) => (
  <div className="relative">
    {icon && (
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        {icon}
      </div>
    )}
    <input
      type="text"
      id={id}
      {...register(id, {
        required: !optional,
      })}
      className={getInputClassName(!!icon)}
      readOnly={readOnly}
      defaultValue={defaultValue}
    />
  </div>
);
