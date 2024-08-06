import React from "react";
import { getInputClassName } from "render/styles/form";

import { FieldProps } from "./type";

export const PasswordField: React.FC<FieldProps> = ({ id, register, icon }) => (
  <div className="relative">
    {icon && (
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        {icon}
      </div>
    )}
    <input
      type="password"
      id={id}
      {...register(id)}
      className={getInputClassName(!!icon)}
      required
    />
  </div>
);
