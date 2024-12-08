// theme.dark.ts (暗色主题)
export const colors = {
  primary: {
    light: "rgba(76, 217, 100, 0.15)",
    lighter: "rgba(76, 217, 100, 0.08)",
    default: "rgba(63, 186, 84, 1)",
    hover: "rgba(63, 186, 84, 0.92)",
    bg: "rgba(76, 217, 100, 0.12)",
    bgHover: "rgba(76, 217, 100, 0.18)",
    shadow: "rgba(76, 217, 100, 0.25)",
  },
  danger: {
    light: "rgba(255, 77, 79, 0.15)",
    hover: "rgba(255, 77, 79, 0.18)",
    text: "rgba(255, 77, 79, 0.95)",
    shadow: "rgba(255, 77, 79, 0.25)",
  },
  background: {
    light: "rgba(38, 38, 38, 0.75)",
    lighter: "rgba(38, 38, 38, 0.45)",
    hover: "rgba(48, 48, 48, 0.92)",
    active: "rgba(28, 28, 28, 0.95)",
  },
  text: {
    primary: "rgba(255, 255, 255, 0.9)",
    secondary: "rgba(255, 255, 255, 0.65)",
  },
};

export const animations = {
  spring: "cubic-bezier(0.2, 0.8, 0.2, 1)",
  bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  duration: {
    fast: "0.15s",
    normal: "0.2s",
  },
};

export const shadows = {
  subtle: {
    default: `
        0 0 0 1px rgba(255, 255, 255, 0.06),
        0 2px 4px rgba(0, 0, 0, 0.2),
        0 2px 6px rgba(0, 0, 0, 0.2)
      `,
    hover: `
        0 0 0 1px rgba(255, 255, 255, 0.08),
        0 4px 8px rgba(0, 0, 0, 0.25),
        0 4px 12px rgba(0, 0, 0, 0.25)
      `,
  },
  primary: {
    default: `
        0 0 0 1px rgba(76, 217, 100, 0.2),
        0 2px 4px rgba(76, 217, 100, 0.15),
        0 2px 6px rgba(76, 217, 100, 0.12)
      `,
    hover: `
        0 0 0 1px rgba(76, 217, 100, 0.25),
        0 4px 8px rgba(76, 217, 100, 0.2),
        0 4px 12px rgba(76, 217, 100, 0.15)
      `,
  },
  danger: {
    default: `
        0 0 0 1px rgba(255, 77, 79, 0.2),
        0 2px 4px rgba(255, 77, 79, 0.15),
        0 2px 6px rgba(255, 77, 79, 0.12)
      `,
    hover: `
        0 0 0 1px rgba(255, 77, 79, 0.25),
        0 4px 8px rgba(255, 77, 79, 0.2),
        0 4px 12px rgba(255, 77, 79, 0.15)
      `,
  },
};
