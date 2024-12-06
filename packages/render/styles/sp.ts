import { sizes } from "./stylePresets";
export const sp = {
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
  mt2: { marginTop: sizes.size2 },
  gap1: { gap: sizes.size1 },
  gap2: { gap: sizes.size2 },
} as const;
