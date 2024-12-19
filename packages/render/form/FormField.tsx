// FormField.tsx
import type React from "react";
import type { ReactNode } from "react";

const formFieldStyles = {
	formField: {
		marginBottom: "15px",
	},
};

interface FormFieldProps {
	children: ReactNode;
	className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
	children,
	className,
}) => {
	return (
		<div style={formFieldStyles.formField} className={className}>
			{children}
		</div>
	);
};
