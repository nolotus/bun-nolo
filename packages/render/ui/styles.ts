export const borders = {
  borderSize1: "1px",
  borderSize2: "2px",
  borderSize3: "5px",
  borderSize4: "10px",
  borderSize5: "25px",
} as const;

export const radii = {
  radius1: "2px",
  radius2: "5px",
  radius3: "1rem",
  radius4: "2rem",
  radius5: "4rem",
  radius6: "8rem",

  radiusDrawn1: "255px 15px 225px 15px / 15px 225px 15px 255px",
  radiusDrawn2: "125px 10px 20px 185px / 25px 205px 205px 25px",
  radiusDrawn3: "15px 255px 15px 225px / 225px 15px 255px 15px",
  radiusDrawn4: "15px 25px 155px 25px / 225px 150px 25px 115px",
  radiusDrawn5: "250px 25px 15px 20px / 15px 80px 105px 115px",
  radiusDrawn6: "28px 100px 20px 15px / 150px 30px 205px 225px",

  radiusRound: "1e5px",
  radiusBlob1: "30% 70% 70% 30% / 53% 30% 70% 47%",
  radiusBlob2: "53% 47% 34% 66% / 63% 46% 54% 37%",
  radiusBlob3: "37% 63% 56% 44% / 49% 56% 44% 51%",
  radiusBlob4: "63% 37% 37% 63% / 43% 37% 63% 57%",
  radiusBlob5: "49% 51% 48% 52% / 57% 44% 56% 43%",

  radiusConditional1: "clamp(0px, calc(100vw - 100%) * 1e5, var(--radius-1))",
  radiusConditional2: "clamp(0px, calc(100vw - 100%) * 1e5, var(--radius-2))",
  radiusConditional3: "clamp(0px, calc(100vw - 100%) * 1e5, var(--radius-3))",
  radiusConditional4: "clamp(0px, calc(100vw - 100%) * 1e5, var(--radius-4))",
  radiusConditional5: "clamp(0px, calc(100vw - 100%) * 1e5, var(--radius-5))",
  radiusConditional6: "clamp(0px, calc(100vw - 100%) * 1e5, var(--radius-6))",
} as const;
export const sizes = {
  size000: "-.5rem",
  size00: "-.25rem",
  size1: ".25rem",
  size2: ".5rem",
  size3: "1rem",
  size4: "1.25rem",
  size5: "1.5rem",
  size6: "1.75rem",
  size7: "2rem",
  size8: "3rem",
  size9: "4rem",
  size10: "5rem",
  size11: "7.5rem",
  size12: "10rem",
  size13: "15rem",
  size14: "20rem",
  size15: "30rem",
  sizePx000: "-8px",
  sizePx00: "-4px",
  sizePx1: "4px",
  sizePx2: "8px",
  sizePx3: "16px",
  sizePx4: "20px",
  sizePx5: "24px",
  sizePx6: "28px",
  sizePx7: "32px",
  sizePx8: "48px",
  sizePx9: "64px",
  sizePx10: "80px",
  sizePx11: "120px",
  sizePx12: "160px",
  sizePx13: "240px",
  sizePx14: "320px",
  sizePx15: "480px",
  sizeFluid1: "clamp(.5rem, 1vw, 1rem)",
  sizeFluid2: "clamp(1rem, 2vw, 1.5rem)",
  sizeFluid3: "clamp(1.5rem, 3vw, 2rem)",
  sizeFluid4: "clamp(2rem, 4vw, 3rem)",
  sizeFluid5: "clamp(4rem, 5vw, 5rem)",
  sizeFluid6: "clamp(5rem, 7vw, 7.5rem)",
  sizeFluid7: "clamp(7.5rem, 10vw, 10rem)",
  sizeFluid8: "clamp(10rem, 20vw, 15rem)",
  sizeFluid9: "clamp(15rem, 30vw, 20rem)",
  sizeFluid10: "clamp(20rem, 40vw, 30rem)",
  sizeContent1: "20ch",
  sizeContent2: "45ch",
  sizeContent3: "60ch",
  sizeHeader1: "20ch",
  sizeHeader2: "25ch",
  sizeHeader3: "35ch",
  sizeXxs: "240px",
  sizeXs: "360px",
  sizeSm: "480px",
  sizeMd: "768px",
  sizeLg: "1024px",
  sizeXl: "1440px",
  sizeXxl: "1920px",
  sizeRelative000: "-.5ch",
  sizeRelative00: "-.25ch",
  sizeRelative1: ".25ch",
  sizeRelative2: ".5ch",
  sizeRelative3: "1ch",
  sizeRelative4: "1.25ch",
  sizeRelative5: "1.5ch",
  sizeRelative6: "1.75ch",
  sizeRelative7: "2ch",
  sizeRelative8: "3ch",
  sizeRelative9: "4ch",
  sizeRelative10: "5ch",
  sizeRelative11: "7.5ch",
  sizeRelative12: "10ch",
  sizeRelative13: "15ch",
  sizeRelative14: "20ch",
  sizeRelative15: "30ch",
} as const;

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

  gap1: { gap: sizes.size1 },
  gap2: { gap: sizes.size2 },
  p1: { padding: sizes.size1 },
  p2: { padding: sizes.size2 },
  p3: { padding: sizes.size3 },
  py1: { paddingTop: sizes.size1, paddingBottom: sizes.size1 },
  py2: { paddingTop: sizes.size2, paddingBottom: sizes.size2 },
  px1: { paddingLeft: sizes.size1, paddingRight: sizes.size1 },
  px2: { paddingLeft: sizes.size2, paddingRight: sizes.size2 },
  m1: { margin: sizes.size1 },
  m2: { margin: sizes.size2 },
  mb1: { marginBottom: sizes.size1 },
  mb2: { marginBottom: sizes.size2 },
  mr1: { marginRight: sizes.size1 },
  mr2: { marginRight: sizes.size2 },

  w100: { width: "100%" },
  h100: { height: "100%" },
  h100vh: { height: "100vh" },
  flexGrow1: { flexGrow: 1 },
  width160: { width: "160px" },

  positionFixed: { position: "fixed" as const },

  overflowYAuto: { overflowY: "auto" as const },
  overflowXHidden: { overflowX: "hidden" as const },
  overflowHidden: { overflow: "hidden" as const },

  clickable: {
    cursor: "pointer",
    userSelect: "none" as const,
  },
  transition: { transition: "all 0.2s ease-in-out" },

  textCenter: { textAlign: "center" as const },
  textEllipsis: {
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  fontSemiBold: { fontWeight: 600 },
  fontWeight500: { fontWeight: 500 },
  fontWeight600: { fontWeight: 600 },
  fontSize14: { fontSize: "14px" },
  fontSize16: { fontSize: "16px" },
  textAlignLeft: { textAlign: "left" as const },

  roundedSm: { borderRadius: radii.radius1 },
  roundedMd: { borderRadius: radii.radius2 },
  roundedLg: { borderRadius: radii.radius3 },
  rounded: { borderRadius: radii.radius2 },
  roundedFull: { borderRadius: "9999px" },

  zIndex1: { zIndex: 1 },
  zIndex2: { zIndex: 2 },
  zIndex3: { zIndex: 3 },

  bgNone: { background: "none" },
  borderNone: { border: "none" },
  colorInherit: { color: "inherit" },
  textDecorationNone: { textDecoration: "none" },

  buttonBase: {
    padding: sizes.size2,
    borderRadius: radii.radius2,
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
  },

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

  radShadow: (theme: Theme) => ({
    borderColor: `${theme.brand}26`,
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
