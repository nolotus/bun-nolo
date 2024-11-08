export const FLAGS_MAP = {
  0: [],
  1: ["isInit"],
  5: ["isHash", "isVersion", "isToList", "isObject", "isString"],
  7: [
    "isHash",
    "isVersion",
    "isList",
    "isObject",
    "isString",
    "isBase64",
    "isJSON",
  ],
  8: [
    "isHash",
    "isVersion",
    "isList",
    "isObject",
    "isString",
    "isBase64",
    "isJSON",
    "isUrlSafe",
  ],
  9: [
    "isHash",
    "isVersion",
    "isList",
    "isObject",
    "isString",
    "isBase64",
    "isJSON",
    "isUrlSafe",
    "isOthersWritable",
  ],
  10: [
    "isHash",
    "isVersion",
    "isList",
    "isObject",
    "isString",
    "isBase64",
    "isJSON",
    "isUrlSafe",
    "isOthersWritable",
    "isReadableByOthers",
  ],
  12: [
    "isHash",
    "isFile",
    "isVersion",
    "isList",
    "isObject",
    "isString",
    "isJSON",
    "isUrlSafe",
    "isOthersWritable",
    "isReadableByOthers",
    "isIndex",
    "isPrivate",
  ],
};
//already use ishash isjson isList
//isHash use for nerver change
//isJSON is for most of use
//isList use for merge .add ,remove something

//isObject maybe could merge or search
