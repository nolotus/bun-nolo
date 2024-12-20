import type React from "react";
import { defaultTheme } from "render/styles/colors";

const labelStyles = {
	display: "block",
	marginBottom: "8px",
	color: defaultTheme.textSecondary,
	fontSize: "14px",
	fontWeight: 500,
};

export const Label = (props: React.LabelHTMLAttributes<HTMLLabelElement>) => (
	<label {...props} style={labelStyles} />
);
