import React from "react";
import { COLORS } from "render/styles/colors";

const labelStyles = {
  display: "block",
  marginBottom: "8px",
  color: COLORS.textSecondary,
  fontSize: "14px",
  fontWeight: 500,
};

export const Label = (props: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label {...props} style={labelStyles} />
);
