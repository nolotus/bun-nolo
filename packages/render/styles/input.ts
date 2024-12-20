import { defaultTheme } from "./colors";

export const baseStyles = `
  .input-field {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen;
    color: ${defaultTheme.text};
  }

  .input-field:focus {
    border-color: ${defaultTheme.primary};
    box-shadow: 0 0 0 3px ${defaultTheme.primaryGhost};
    outline: none;
  }
  
  .input-field::placeholder {
    color: ${defaultTheme.placeholder};
    font-size: 15px;
  }
`;

export const baseInputStyle = {
	width: "100%",
	height: "42px",
	fontSize: "15px",
	border: `1px solid ${defaultTheme.border}`,
	borderRadius: "8px",
	backgroundColor: defaultTheme.background,
	transition: "all 0.2s",
};

export const iconBaseStyle = {
	position: "absolute" as const,
	top: "50%",
	transform: "translateY(-50%)",
	color: defaultTheme.textSecondary,
	display: "flex",
	alignItems: "center",
};

export const containerStyle = {
	position: "relative" as const,
	maxWidth: "420px",
	margin: "10px auto",
};
