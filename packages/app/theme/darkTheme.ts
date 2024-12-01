// app/theme/darkTheme.ts

import OpenProps from "open-props";

export const darkTheme = {
  brand: OpenProps.indigo3,
  text1: "#dee2e6",
  text2: OpenProps.gray5,
  surface1: OpenProps.gray12,
  surface2: OpenProps.gray11,
  surface3: OpenProps.gray10,
  surface4: OpenProps.gray9,
  surfaceShadow: OpenProps.gray12Hsl,
  shadowStrength: "80%",
  table: {
    borderColor: "#334155",
    background: "#1a202c",
    color: "#e2e8f0",
  },
  row: {
    borderColor: "#334155",
    background: "#1a202c",
    hoverBackground: "#2d3748",
  },
  cell: {
    borderColor: "#334155",
    padding: "12px",
  },
  header: {
    background: "#2d3748",
    color: "#f1f5f9",
    borderColor: "#334155",
  },
  codeBlock: {
    headerBackground: "#1e1e1e",
    buttonColor: "#989898",
    buttonHoverBackground: "rgba(255,255,255,0.1)",
    buttonHoverColor: "#ffffff",
    iconColor: "#888",
    copiedButtonBackground: "#1a4721",
    copiedButtonColor: "white",
    copiedButtonHoverBackground: "#205828",
    languageLabelColor: "#989898",
  },
};
