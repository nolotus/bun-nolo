import { BASE_COLORS } from "./colors";

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
		color: BASE_COLORS.light.text,
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
		color: BASE_COLORS.light.icon,
		fontWeight: 500,
	},
	error: {
		marginTop: "8px",
		marginBottom: "8px",
		color: BASE_COLORS.light.error,
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
		backgroundColor: BASE_COLORS.light.primary,
		color: BASE_COLORS.light.background,
		border: "none",
		cursor: "pointer",
		width: "100%",
		transition: "background-color 0.2s",
	},
	linkText: {
		color: BASE_COLORS.light.textSecondary,
		fontSize: "14px",
	},
	link: {
		color: BASE_COLORS.light.primary,
		textDecoration: "none",
		fontSize: "14px",
		marginLeft: "4px",
	},
};
