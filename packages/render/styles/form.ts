import { defaultTheme } from "./colors";

export const formStyles = {
	container: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		minHeight: "calc(100dvh - 60px)",
		padding: "20px",
	},
	form: {
		width: "100%",
		maxWidth: "380px",
	},
	title: {
		fontSize: "28px",
		fontWeight: 600,
		color: defaultTheme.text,
		marginBottom: "36px",
		textAlign: "center" as const,
	},
	fieldWrapper: {
		marginBottom: "20px",
	},
	label: {
		display: "block",
		marginBottom: "8px",
		fontSize: "14px",
		color: defaultTheme.textSecondary,
		fontWeight: 500,
	},
	error: {
		marginTop: "8px",
		marginBottom: "8px",
		color: defaultTheme.error,
		fontSize: "14px",
	},
	footer: {
		marginTop: "32px",
		display: "flex",
		flexDirection: "column" as const,
		gap: "20px",
		alignItems: "center",
	},
	button: {
		height: "44px",
		fontSize: "16px",
		borderRadius: "8px",
		backgroundColor: defaultTheme.primary,
		color: defaultTheme.background,
		border: "none",
		cursor: "pointer",
		width: "100%",
		transition: "background-color 0.2s",
	},
	linkText: {
		color: defaultTheme.textSecondary,
		fontSize: "14px",
	},
	link: {
		color: defaultTheme.primary,
		textDecoration: "none",
		fontSize: "14px",
		marginLeft: "4px",
	},
};
