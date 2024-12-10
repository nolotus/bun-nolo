export type Theme = {
  surface1: string;
  surface2: string;
  surface3: string;
  text1: string;
  text2: string;
  link: string;
  brand: string;
  backgroundColor: string;
  surfaceShadow: string;
  shadowStrength: string;
};

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

export type ThemeStyles = {
  [K in keyof typeof themeStyles]: ReturnType<(typeof themeStyles)[K]>;
};

export const glassOverlayStyle = {
  backdropFilter: "blur(5px)",
  backgroundColor: "rgba(0, 0, 0, 0.3)",
};
