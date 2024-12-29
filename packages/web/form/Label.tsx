import type { FC, LabelHTMLAttributes } from "react";
import { useTheme } from "app/theme";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
	required?: boolean;
}

export const Label: FC<LabelProps> = ({ children, required, style, ...props }) => {
	const theme = useTheme();

	return (
		<label
			{...props}
			style={{
				display: "block",
				marginBottom: "8px",
				color: theme.textSecondary,
				fontSize: "14px",
				letterSpacing: "0.01em",
				fontWeight: 500,
				transition: "color 0.2s ease",
				cursor: "default",
				...style,
			}}
		>
			{children}
			{required && (
				<span
					style={{
						color: theme.error,
						marginLeft: "4px",
					}}
				>
					*
				</span>
			)}
		</label>
	);
};
