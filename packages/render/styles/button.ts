// button.ts
import { colors, animations, shadows } from "./theme"; // 或 "./theme.dark"

export const iconStyle = {
  marginRight: "8px",
  display: "inline-flex",
  alignItems: "center",
  transition: `transform ${animations.duration.fast} ${animations.spring}`,
};

export const createButtonStyle = (
  type: "default" | "primary" | "danger" | "chat",
  isActive = false,
) => {
  const baseStyle = {
    padding: "0 16px",
    fontSize: "14px",
    fontWeight: 500,
    borderRadius: "8px",
    cursor: "pointer",
    border: "none",
    height: "36px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "12px",
    position: "relative" as const,
    isolation: "isolate" as const,
    backdropFilter: "blur(8px)",
    userSelect: "none" as const,
    transition: `all ${animations.duration.fast} ${animations.spring}`,
    boxShadow:
      type === "primary"
        ? shadows.primary.default
        : type === "danger"
          ? shadows.danger.default
          : shadows.subtle.default,
  };

  const styles = {
    default: {
      backgroundColor: colors.background.light,
      color: colors.text.primary,
    },
    primary: {
      backgroundColor: colors.primary.default,
      color: "#fff",
    },
    danger: {
      backgroundColor: colors.danger.light,
      color: colors.danger.text,
    },
    chat: {
      backgroundColor: isActive ? colors.primary.bg : colors.background.light,
      color: isActive ? colors.primary.default : colors.text.primary,
    },
  };

  return {
    ...baseStyle,
    ...styles[type],
  };
};

export const getHoverStyles = (type: string) => ({
  transform: "translateY(-1px)",
  boxShadow:
    type === "primary"
      ? shadows.primary.hover
      : type === "danger"
        ? shadows.danger.hover
        : shadows.subtle.hover,
});
