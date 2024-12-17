import React from "react";
import { COLORS } from "render/styles/colors";

const selectStyles = {
  width: "100%",
  padding: "10px 12px",
  border: `1px solid ${COLORS.border}`,
  borderRadius: "8px",
  backgroundColor: COLORS.background,
  color: COLORS.text,
  fontSize: "14px",
  transition: "all 0.2s ease",
  cursor: "pointer",
  outline: "none",
};

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>((props, ref) => (
  <>
    <style>
      {`
        select:hover {
          border-color: ${COLORS.borderHover};
        }
        select:focus {
          border-color: ${COLORS.primary};
          box-shadow: 0 0 0 2px ${COLORS.primaryGhost};
        }
      `}
    </style>
    <select {...props} ref={ref} style={selectStyles} />
  </>
));
