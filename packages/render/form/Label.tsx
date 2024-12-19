import type React from "react";
import { BASE_COLORS } from "render/styles/colors";

const labelStyles = {
	display: "block",
	marginBottom: "8px",
	color: BASE_COLORS.textSecondary,
	fontSize: "14px",
	fontWeight: 500,
};

export const Label = (props: React.LabelHTMLAttributes<HTMLLabelElement>) => (
	<label {...props} style={labelStyles} />
);
