// render/styles/layout.ts
export const layout = {
  // Flex相关
  flex: { display: "flex" },
  flexColumn: { display: "flex", flexDirection: "column" },
  flexCenter: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  flexBetween: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  flexStart: { display: "flex", alignItems: "center" },
  flexEnd: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  flexWrap: { flexWrap: "wrap" },
  flexGrow1: { flexGrow: 1 },

  // 宽高
  w100: { width: "100%" },
  h100: { height: "100%" },
  h100vh: { height: "100vh" },

  // 常用尺寸和定位
  relative: { position: "relative" },
  absolute: { position: "absolute" },
  fullWidth: { width: "100%" },

  // Overflow
  overflowYAuto: { overflowY: "auto" },
  overflowXHidden: { overflowX: "hidden" },
  overflowHidden: { overflow: "hidden" },
} as const;
