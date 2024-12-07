import { sizes } from "./sizes";

export const sp = {
  // padding all
  p1: { padding: sizes.size1 },
  p2: { padding: sizes.size2 },
  p3: { padding: sizes.size3 },
  p4: { padding: sizes.size4 },

  // padding vertical
  py1: { paddingTop: sizes.size1, paddingBottom: sizes.size1 },
  py2: { paddingTop: sizes.size2, paddingBottom: sizes.size2 },
  py3: { paddingTop: sizes.size3, paddingBottom: sizes.size3 },
  py4: { paddingTop: sizes.size4, paddingBottom: sizes.size4 },

  // padding horizontal
  px1: { paddingLeft: sizes.size1, paddingRight: sizes.size1 },
  px2: { paddingLeft: sizes.size2, paddingRight: sizes.size2 },
  px3: { paddingLeft: sizes.size3, paddingRight: sizes.size3 },
  px4: { paddingLeft: sizes.size4, paddingRight: sizes.size4 },

  // padding top
  pt1: { paddingTop: sizes.size1 },
  pt2: { paddingTop: sizes.size2 },
  pt3: { paddingTop: sizes.size3 },
  pt4: { paddingTop: sizes.size4 },

  // padding bottom
  pb1: { paddingBottom: sizes.size1 },
  pb2: { paddingBottom: sizes.size2 },
  pb3: { paddingBottom: sizes.size3 },
  pb4: { paddingBottom: sizes.size4 },

  // padding left
  pl1: { paddingLeft: sizes.size1 },
  pl2: { paddingLeft: sizes.size2 },
  pl3: { paddingLeft: sizes.size3 },
  pl4: { paddingLeft: sizes.size4 },

  // padding right
  pr1: { paddingRight: sizes.size1 },
  pr2: { paddingRight: sizes.size2 },
  pr3: { paddingRight: sizes.size3 },
  pr4: { paddingRight: sizes.size4 },

  // margin all
  m1: { margin: sizes.size1 },
  m2: { margin: sizes.size2 },
  m3: { margin: sizes.size3 },
  m4: { margin: sizes.size4 },

  // margin vertical
  my1: { marginTop: sizes.size1, marginBottom: sizes.size1 },
  my2: { marginTop: sizes.size2, marginBottom: sizes.size2 },
  my3: { marginTop: sizes.size3, marginBottom: sizes.size3 },
  my4: { marginTop: sizes.size4, marginBottom: sizes.size4 },

  // margin horizontal
  mx1: { marginLeft: sizes.size1, marginRight: sizes.size1 },
  mx2: { marginLeft: sizes.size2, marginRight: sizes.size2 },
  mx3: { marginLeft: sizes.size3, marginRight: sizes.size3 },
  mx4: { marginLeft: sizes.size4, marginRight: sizes.size4 },

  // margin top
  mt1: { marginTop: sizes.size1 },
  mt2: { marginTop: sizes.size2 },
  mt3: { marginTop: sizes.size3 },
  mt4: { marginTop: sizes.size4 },

  // margin bottom
  mb1: { marginBottom: sizes.size1 },
  mb2: { marginBottom: sizes.size2 },
  mb3: { marginBottom: sizes.size3 },
  mb4: { marginBottom: sizes.size4 },

  // margin left
  ml1: { marginLeft: sizes.size1 },
  ml2: { marginLeft: sizes.size2 },
  ml3: { marginLeft: sizes.size3 },
  ml4: { marginLeft: sizes.size4 },

  // margin right
  mr1: { marginRight: sizes.size1 },
  mr2: { marginRight: sizes.size2 },
  mr3: { marginRight: sizes.size3 },
  mr4: { marginRight: sizes.size4 },

  // gap
  gap1: { gap: sizes.size1 },
  gap2: { gap: sizes.size2 },
  gap3: { gap: sizes.size3 },
  gap4: { gap: sizes.size4 },
} as const;
