import { useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
// PasswordInput.tsx
import React, { useState } from "react";
import { GoEye, GoEyeClosed } from "react-icons/go";

interface PasswordInputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	error?: boolean;
}

const usePasswordInputStyles = () => {
	const theme = useAppSelector(selectTheme);
	return {
		container: {
			position: "relative" as const,
			width: "100%",
		},
		input: {
			width: "100%",
			padding: "8px",
			paddingRight: "35px",
			border: `1px solid ${theme.surface3}`,
			borderRadius: "4px",
			backgroundColor: theme.surface2,
			color: theme.text1,
		},
		inputError: {
			borderColor: theme.brand,
		},
		toggleButton: {
			position: "absolute" as const,
			right: "8px",
			top: "50%",
			transform: "translateY(-50%)",
			cursor: "pointer",
			color: theme.text2,
			background: "none",
			border: "none",
			padding: "4px",
			display: "flex",
			alignItems: "center",
		},
		icon: {
			width: "16px",
			height: "16px",
		},
	};
};

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
	({ error, style, ...props }, ref) => {
		const [showPassword, setShowPassword] = useState(false);
		const styles = usePasswordInputStyles();

		return (
			<div style={styles.container}>
				<input
					{...props}
					ref={ref}
					type={showPassword ? "text" : "password"}
					style={{
						...styles.input,
						...(error && styles.inputError),
						...style,
					}}
				/>
				<button
					type="button"
					onClick={() => setShowPassword(!showPassword)}
					style={styles.toggleButton}
					tabIndex={-1}
					aria-label={showPassword ? "Hide password" : "Show password"}
				>
					{showPassword ? (
						<GoEye style={styles.icon} />
					) : (
						<GoEyeClosed style={styles.icon} />
					)}
				</button>
			</div>
		);
	},
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
