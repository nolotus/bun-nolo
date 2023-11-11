export const FLAGS_MAP = {
  0: [],
  1: ['isInit'],
  5: ['isHash', 'isVersion', 'isToList', 'isObject', 'isString'],
  7: [
    'isHash',
    'isVersion',
    'isList',
    'isObject',
    'isString',
    'isBase64',
    'isJSON',
  ],
  8: [
    'isHash',
    'isVersion',
    'isList',
    'isObject',
    'isString',
    'isBase64',
    'isJSON',
    'isUrlSafe', // 新增的标志
  ],
  9: [
    'isHash',
    'isVersion',
    'isList',
    'isObject',
    'isString',
    'isBase64',
    'isJSON',
    'isUrlSafe',
    'isOthersWritable', // 新增的标志
  ],
  10: [
    'isHash',
    'isVersion',
    'isList',
    'isObject',
    'isString',
    'isBase64',
    'isJSON',
    'isUrlSafe',
    'isOthersWritable',
    'isReadableByOthers', // 新增的标志
  ],
  12: [
    'isHash',
    'isVersion',
    'isList',
    'isObject',
    'isString',
    'isBase64',
    'isJSON',
    'isUrlSafe',
    'isIndex',
    'isVersion', // 新增的标志
  ],
};
