import { defaultTheme } from "./colors";
import { createShadow } from "./createShadow";

export const shadows = {
  subtle: createShadow('#000000', {
    border: 0.04,
    blur1: 0.04,
    blur2: 0.04,
    borderHover: 0.04,
    blur1Hover: 0.06,
    blur2Hover: 0.05
  }),
  primary: createShadow(defaultTheme.primary, {
    border: 0.1,
    blur1: 0.08,
    blur2: 0.06,
    borderHover: 0.15,
    blur1Hover: 0.12,
    blur2Hover: 0.08
  }),
  danger: createShadow(defaultTheme.error, {
    border: 0.1,
    blur1: 0.08,
    blur2: 0.06,
    borderHover: 0.15,
    blur1Hover: 0.12,
    blur2Hover: 0.08
  })
};