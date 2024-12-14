// TextField.tsx
import React from "react";
import {
  baseStyles,
  baseInputStyle,
  iconBaseStyle,
  containerStyle,
} from "render/styles/input";

import { COLORS } from "render/styles/colors";

const getInputStyle = (hasIcon: boolean) => ({
  ...baseInputStyle,
  padding: `0 ${hasIcon ? "42px" : "12px"}`,
});

export const TextField: React.FC = ({
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
      <div
        style={{
          height: "42px",
          lineHeight: "42px",
          padding: "0 12px",
          color: COLORS.text,
        }}
      >
        <p style={{ margin: 0 }}>{defaultValue}</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <style>{baseStyles}</style>
      {icon && <div style={{ ...iconBaseStyle, left: "12px" }}>{icon}</div>}
      <input
        type="text"
        placeholder={placeholder}
        id={id}
        className="input-field"
        {...(register && register(id, { required: !optional }))}
        style={getInputStyle(!!icon)}
        readOnly={readOnly}
        defaultValue={defaultValue}
      />
    </div>
  );
};
