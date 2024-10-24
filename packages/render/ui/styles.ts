// render/ui/styles.ts

import OpenProps from "open-props";

export type Theme = {
  surface1: string;
  surface2: string;
  surface3: string;
  surface4: string;
  text1: string;
  text2: string;
  link: string;
  linkVisited: string;
  scrollthumbColor: string;
  brand: string;
  backgroundColor: string;
  surfaceShadow: string;
  shadowStrength: string;
};

export const styles = {
  // Flex 相关样式
  flex: { display: "flex" },
  flexColumn: { display: "flex", flexDirection: "column" as const },
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
  flexCenterColumn: {
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
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

  // 尺寸相关
  w100: { width: "100%" },
  h100: { height: "100%" },
  h100vh: { height: "100vh" },
  flexGrow1: { flexGrow: 1 },
  width160: { width: "160px" },

  // 定位
  positionFixed: { position: "fixed" as const },

  // 溢出处理
  overflowYAuto: { overflowY: "auto" as const },
  overflowXHidden: { overflowX: "hidden" as const },
  overflowHidden: { overflow: "hidden" as const },

  // 交互样式
  clickable: {
    cursor: "pointer",
    userSelect: "none" as const,
  },
  transition: { transition: "all 0.2s ease-in-out" },

  // 文本样式
  textCenter: { textAlign: "center" as const },
  textEllipsis: {
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  fontSemiBold: { fontWeight: OpenProps.fontWeight6 },
  fontWeight500: { fontWeight: 500 },
  fontWeight600: { fontWeight: 600 },
  fontSize14: { fontSize: "14px" },
  fontSize16: { fontSize: "16px" },
  textAlignLeft: { textAlign: "left" as const },

  // 圆角
  roundedSm: { borderRadius: OpenProps.radius1 },
  roundedMd: { borderRadius: OpenProps.radius2 },
  roundedLg: { borderRadius: OpenProps.radius3 },
  rounded: { borderRadius: OpenProps.radius2 },
  roundedFull: { borderRadius: "9999px" },

  // z-index
  zIndex1: { zIndex: 1 },
  zIndex2: { zIndex: 2 },
  zIndex3: { zIndex: 3 },

  // 其他样式
  bgNone: { background: "none" },
  borderNone: { border: "none" },
  colorInherit: { color: "inherit" },
  textDecorationNone: { textDecoration: "none" },

  // 按钮基础样式
  buttonBase: {
    padding: OpenProps.size2,
    borderRadius: OpenProps.radius2,
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
  },

  // 新添加的 radShadow 样式
  radShadow: {
    border: "1px solid",
    boxShadow: `
      0 1rem .5rem -.5rem,
      0 2.8px 2.2px,
      0 6.7px 5.3px,
      0 12.5px 10px,
      0 22.3px 17.9px,
      0 41.8px 33.4px,
      0 100px 80px
    `,
  },
} as const;

export const themeStyles = {
  surface1: (theme: Theme) => ({
    backgroundColor: theme.surface1,
    color: theme.text2,
  }),
  surface2: (theme: Theme) => ({
    backgroundColor: theme.surface2,
    color: theme.text2,
  }),
  surface3: (theme: Theme) => ({
    backgroundColor: theme.surface3,
    color: theme.text1,
  }),
  surface4: (theme: Theme) => ({
    backgroundColor: theme.surface4,
    color: theme.text1,
  }),
  textColor1: (theme: Theme) => ({ color: theme.text1 }),
  textColor2: (theme: Theme) => ({ color: theme.text2 }),
  link: (theme: Theme) => ({ color: theme.link }),
  linkVisited: (theme: Theme) => ({ color: theme.linkVisited }),
  scrollThumb: (theme: Theme) => ({ backgroundColor: theme.scrollthumbColor }),
  brand: (theme: Theme) => ({ color: theme.brand }),

  // 新添加的 radShadow 主题样式
  radShadow: (theme: Theme) => ({
    borderColor: `${theme.brand}26`, // 使用 theme.brand 并设置透明度为 15% (26 in hex)
    boxShadow: `
      0 1rem .5rem -.5rem hsl(${theme.surfaceShadow} / calc(${theme.shadowStrength} + 3%)),
      0 2.8px 2.2px hsl(${theme.surfaceShadow} / calc(${theme.shadowStrength} + 3%)),
      0 6.7px 5.3px hsl(${theme.surfaceShadow} / calc(${theme.shadowStrength} + 1%)),
      0 12.5px 10px hsl(${theme.surfaceShadow} / calc(${theme.shadowStrength} + 2%)),
      0 22.3px 17.9px hsl(${theme.surfaceShadow} / calc(${theme.shadowStrength} + 2%)),
      0 41.8px 33.4px hsl(${theme.surfaceShadow} / calc(${theme.shadowStrength} + 3%)),
      0 100px 80px hsl(${theme.surfaceShadow} / ${theme.shadowStrength})
    `,
  }),
};

export type Styles = typeof styles;
export type ThemeStyles = {
  [K in keyof typeof themeStyles]: ReturnType<(typeof themeStyles)[K]>;
};

export const glassOverlayStyle = {
  backdropFilter: "blur(5px)",
  backgroundColor: "rgba(0, 0, 0, 0.3)",
};
