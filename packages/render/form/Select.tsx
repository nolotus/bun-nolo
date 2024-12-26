import React from "react";
import { defaultTheme } from "render/styles/colors";

const selectStyles = {
  width: "100%",
  padding: "10px 12px",
  border: `1px solid ${defaultTheme.border}`,
  borderRadius: "8px",
  backgroundColor: defaultTheme.background,
  color: defaultTheme.text,
  fontSize: "14px",
  transition: "all 0.2s ease",
  cursor: "pointer",
  outline: "none",
};

export const Select = (props) => {
  return (
    <>
      <style>
        {`
          select:hover {
            border-color: ${defaultTheme.borderHover};
          }
          select:focus {
            border-color: ${defaultTheme.primary};
            box-shadow: 0 0 0 2px ${defaultTheme.primaryGhost};
          }
        `}
      </style>
      <select {...props} style={selectStyles} />
    </>
  );
};
