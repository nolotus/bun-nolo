// app/theme/lightTheme.ts

import OpenProps from "open-props";

//为了整体和谐 ，采用统一的字体颜色 text1  text2 text3中选择，组件不要另外选择文字颜色
export const lightTheme = {
  link: "#4263eb",
  linkVisited: OpenProps.purple7,
  text1: "#343a40",
  text2: "#495057",
  surface1: "#f8f9fa",
  surface2: "#f1f3f5",
  surface3: "#e9ecef",
  surface4: "#dee2e6",
  brand: "#4263eb",
  backgroundColor: "#f8f9fa",
  surfaceShadow: OpenProps.gray8Hsl,
  shadowStrength: "2%",
  table: {
    borderColor: "#e2e8f0",
    background: "#ffffff",
    color: "#1a202c",
  },
  row: {
    borderColor: "#e2e8f0",
    background: "#ffffff",
    hoverBackground: "#f7fafc",
  },
  cell: {
    borderColor: "#e2e8f0",
    padding: "12px",
  },
  header: {
    background: "#f1f5f9",
    color: "#334155",
    borderColor: "#e2e8f0",
  },
  codeBlock: {
    // 使用更亮的背景色以提高代码块的可读性
    headerBackground: "#e0e0e0",
    // 按钮文字颜色与背景色形成对比
    buttonColor: "#525252",
    // 悬停时按钮背景颜色
    buttonHoverBackground: "#d3d3d3",
    buttonHoverColor: "#333",
    // 图标颜色
    iconColor: "#666",
    // 复制按钮的背景色
    copiedButtonBackground: "#4CAF50",
    copiedButtonColor: "white",
    copiedButtonHoverBackground: "#45a049",
    // 语言标签颜色
    languageLabelColor: "#777",
  },
};
