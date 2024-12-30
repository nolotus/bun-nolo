import type React from "react";
import type { ReactNode } from "react";
import { Label } from "./Label";
import { useTheme } from "app/theme";


interface FormFieldProps {
	children: ReactNode;
	className?: string;
	label?: string;
	required?: boolean;
	error?: string;
}


export const FormField: React.FC<FormFieldProps> = ({
	children,
	className,
	label,
	required,
	error,
}) => {
	const theme = useTheme();


	return (
		<div
			style={{
				marginBottom: "24px",
			}}
			className={className}
		>
			{label && <Label required={required}>{label}</Label>}
			{children}
			{error && (
				<div
					style={{
						color: theme.error,
						fontSize: "12px",
						marginTop: "4px",
					}}
				>
					{error}
				</div>
			)}
		</div>
	);
};
