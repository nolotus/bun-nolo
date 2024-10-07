import OpenProps from "open-props";

export const styles = {
  // Flex 相关样式
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

  // 间距相关
  gap1: { gap: OpenProps.size1 },
  gap2: { gap: OpenProps.size2 },
  p1: { padding: OpenProps.size1 },
  p2: { padding: OpenProps.size2 },
  p3: { padding: OpenProps.size3 },
  py1: { paddingTop: OpenProps.size1, paddingBottom: OpenProps.size1 },
  py2: { paddingTop: OpenProps.size2, paddingBottom: OpenProps.size2 },
  px1: { paddingLeft: OpenProps.size1, paddingRight: OpenProps.size1 },
  px2: { paddingLeft: OpenProps.size2, paddingRight: OpenProps.size2 },
  m1: { margin: OpenProps.size1 },
  m2: { margin: OpenProps.size2 },
  mb1: { marginBottom: OpenProps.size1 },
  mb2: { marginBottom: OpenProps.size2 },
  mr1: { marginRight: OpenProps.size1 },
  mr2: { marginRight: OpenProps.size2 },

  // 其他常用样式
  w100: { width: "100%" },
  h100vh: { height: "100vh" },
  flexGrow1: { flexGrow: 1 },

  // 定位
  positionFixed: { position: "fixed" },

  // 溢出处理
  overflowYAuto: { overflowY: "auto" },
  overflowXHidden: { overflowX: "hidden" },

  // 交互样式
  clickable: {
    cursor: "pointer",
    userSelect: "none",
  },
  transition: { transition: "all 0.2s ease-in-out" },

  // 文本样式
  textCenter: { textAlign: "center" },
  textEllipsis: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  fontSemiBold: { fontWeight: OpenProps.fontWeight6 },
  fontWeight600: { fontWeight: "600" },

  // 圆角
  roundedSm: { borderRadius: OpenProps.radius1 },
  roundedMd: { borderRadius: OpenProps.radius2 },
  roundedLg: { borderRadius: OpenProps.radius3 },
  rounded: { borderRadius: OpenProps.radius2 },
  roundedFull: { borderRadius: "9999px" },

  // z-index
  zIndex1: { zIndex: 1 },
  zIndex2: { zIndex: 2 },

  // 新添加的样式
  width160: { width: "160px" },
  fontSize14: { fontSize: "14px" },
  fontSize16: { fontSize: "16px" },
  fontWeight500: { fontWeight: "500" },
  textAlignLeft: { textAlign: "left" },
  bgNone: { background: "none" },
  borderNone: { border: "none" },
  colorInherit: { color: "inherit" },
  textDecorationNone: { textDecoration: "none" },
};

export const themeStyles = {
  bgColor1: (theme) => ({ backgroundColor: theme.surface1 }),
  textColor1: (theme) => ({ color: theme.text1 }),
};
