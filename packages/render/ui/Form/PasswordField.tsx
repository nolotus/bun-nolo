// PasswordField.tsx
import React, { useState } from "react";
import { EyeIcon, EyeClosedIcon } from "@primer/octicons-react";
import { FieldProps } from "./type";
import {
  baseStyles,
  baseInputStyle,
  iconBaseStyle,
  containerStyle,
} from "render/styles/input";

export const PasswordField: React.FC<FieldProps> = ({
  id,
  register,
  icon,
  placeholder = "Enter password",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={containerStyle}>
      <style>{baseStyles}</style>

      {icon && <div style={{ ...iconBaseStyle, left: "12px" }}>{icon}</div>}

      <input
        type={showPassword ? "text" : "password"}
        id={id}
        className="input-field"
        placeholder={placeholder}
        {...register(id)}
        style={{
          ...baseInputStyle,
          padding: `0 ${icon ? "42px" : "12px"}`,
        }}
        required
      />

      <div
        onClick={() => setShowPassword(!showPassword)}
        style={{
          ...iconBaseStyle,
          right: "12px",
          cursor: "pointer",
          padding: "8px",
        }}
      >
        {showPassword ? <EyeClosedIcon size={20} /> : <EyeIcon size={20} />}
      </div>
    </div>
  );
};
