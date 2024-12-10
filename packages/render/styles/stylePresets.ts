import { sizes } from "./sizes";

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

export const stylePresets = {
  flex: { display: "flex" },
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

  w100: { width: "100%" },
  h100: { height: "100%" },
  h100vh: { height: "100vh" },

  positionFixed: { position: "fixed" as const },

  overflowYAuto: { overflowY: "auto" as const },
  overflowHidden: { overflow: "hidden" as const },

  clickable: {
    cursor: "pointer",
    userSelect: "none" as const,
  },
  transition: { transition: "all 0.2s ease-in-out" },

  textCenter: { textAlign: "center" as const },

  textAlignLeft: { textAlign: "left" as const },

  bgNone: { background: "none" },
  borderNone: { border: "none" },
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
