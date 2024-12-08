import { COLORS } from "./colors";

export const baseStyles = `
  .input-field {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen;
    color: ${COLORS.text};
  }

  .input-field:focus {
    border-color: ${COLORS.primary};
    box-shadow: 0 0 0 3px rgba(74,144,226,0.1);
    outline: none;
  }
  
  .input-field::placeholder {
    color: ${COLORS.placeholder};
    font-size: 15px;
  }
`;

export const baseInputStyle = {
  width: "100%",
  height: "42px",
  fontSize: "15px",
  border: `1px solid ${COLORS.border}`,
  borderRadius: "8px",
  backgroundColor: COLORS.background,
  transition: "all 0.2s",
};

export const iconBaseStyle = {
  position: "absolute" as const,
  top: "50%",
  transform: "translateY(-50%)",
  color: COLORS.icon,
  display: "flex",
  alignItems: "center",
};

export const containerStyle = {
  position: "relative" as const,
  maxWidth: "420px",
  margin: "10px auto",
};
