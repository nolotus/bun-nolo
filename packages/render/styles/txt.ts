export const txt = {
  ellipsis: {
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  center: { textAlign: "center" as const },
  left: { textAlign: "left" as const },
  semiBold: { fontWeight: 600 },
  weight500: { fontWeight: 500 },
  weight600: { fontWeight: 600 },
  size14: { fontSize: "14px" },
  size16: { fontSize: "16px" },
  decorationNone: { textDecoration: "none" },
  colorInherit: { color: "inherit" },
} as const;
