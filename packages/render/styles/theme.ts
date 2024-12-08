// theme.ts (亮色主题)
export const colors = {
  primary: {
    light: "rgba(76, 217, 100, 0.06)",
    lighter: "rgba(76, 217, 100, 0.03)",
    default: "rgba(63, 186, 84, 1)",
    hover: "rgba(63, 186, 84, 0.92)",
    bg: "rgba(76, 217, 100, 0.05)",
    bgHover: "rgba(76, 217, 100, 0.09)",
    shadow: "rgba(76, 217, 100, 0.15)",
  },
  danger: {
    light: "rgba(255, 77, 79, 0.06)",
    hover: "rgba(255, 77, 79, 0.09)",
    text: "rgba(255, 77, 79, 0.95)",
    shadow: "rgba(255, 77, 79, 0.15)",
  },
  background: {
    light: "rgba(242, 243, 244, 0.75)",
    lighter: "rgba(242, 243, 244, 0.45)",
    hover: "rgba(242, 243, 244, 0.92)",
    active: "rgba(236, 237, 238, 0.95)",
  },
  text: {
    primary: "rgba(26, 26, 26, 0.9)",
    secondary: "rgba(102, 102, 102, 0.9)",
  },
};

export const shadows = {
  subtle: {
    default: `
        0 0 0 1px rgba(0, 0, 0, 0.04),
        0 2px 4px rgba(0, 0, 0, 0.04),
        0 2px 6px rgba(0, 0, 0, 0.04)
      `,
    hover: `
        0 0 0 1px rgba(0, 0, 0, 0.04),
        0 4px 8px rgba(0, 0, 0, 0.06),
        0 4px 12px rgba(0, 0, 0, 0.05)
      `,
  },
  primary: {
    default: `
        0 0 0 1px rgba(76, 217, 100, 0.1),
        0 2px 4px rgba(76, 217, 100, 0.08),
        0 2px 6px rgba(76, 217, 100, 0.06)
      `,
    hover: `
        0 0 0 1px rgba(76, 217, 100, 0.15),
        0 4px 8px rgba(76, 217, 100, 0.12),
        0 4px 12px rgba(76, 217, 100, 0.08)
      `,
  },
  danger: {
    default: `
        0 0 0 1px rgba(255, 77, 79, 0.1),
        0 2px 4px rgba(255, 77, 79, 0.08),
        0 2px 6px rgba(255, 77, 79, 0.06)
      `,
    hover: `
        0 0 0 1px rgba(255, 77, 79, 0.15),
        0 4px 8px rgba(255, 77, 79, 0.12),
        0 4px 12px rgba(255, 77, 79, 0.08)
      `,
  },
};
