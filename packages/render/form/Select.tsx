import React from "react";
import { BASE_COLORS } from "render/styles/colors";

const selectStyles = {
	width: "100%",
	padding: "10px 12px",
	border: `1px solid ${BASE_COLORS.border}`,
	borderRadius: "8px",
	backgroundColor: BASE_COLORS.background,
	color: BASE_COLORS.text,
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
          border-color: ${BASE_COLORS.borderHover};
        }
        select:focus {
          border-color: ${BASE_COLORS.primary};
          box-shadow: 0 0 0 2px ${BASE_COLORS.primaryGhost};
        }
      `}
		</style>
		<select {...props} ref={ref} style={selectStyles} />
	</>
));
