import { FLAGS_MAP } from "./flagsMap";

// 添加一个缓存对象
const decodeCache = {};
const DEFAULT_LENGTH = Math.max(...Object.keys(FLAGS_MAP).map(Number));

// 使用 TypeScript 定义类型
export interface Flags {
  isHash?: boolean;
  isFile?: boolean;
  isVersion?: boolean;
  isList?: boolean;
  isObject?: boolean;
  isString?: boolean;
  isJSON?: boolean;
  isUrlSafe?: boolean;
  isOthersWritable?: boolean;
  isReadableByOthers?: boolean;
}
export const setKeyPrefix = (flags: Flags = {}): string => {
  const lengthFlags = FLAGS_MAP[DEFAULT_LENGTH];
  if (!lengthFlags) {
    throw new Error(`No flags defined for prefix of length ${DEFAULT_LENGTH}`);
  }
  return lengthFlags.map((flag) => Number(flags[flag] || false)).join("");
};

export const decodeKeyPrefix = (prefix: string): Flags => {
  // 检查缓存
  if (decodeCache[prefix]) {
    return decodeCache[prefix];
  }

  const prefixArray = prefix.split("");
  const lengthFlags = FLAGS_MAP[prefix.length];

  if (!lengthFlags) {
    // console.warn(`No flags defined for prefix of length ${prefix.length}`);
    return {};
  }

  // 添加结果到缓存
  decodeCache[prefix] = prefixArray.reduce((acc, char, idx) => {
    const flagName = lengthFlags[idx];
    if (flagName) {
      acc[flagName] = Boolean(Number(char));
    }
    return acc;
  }, {});

  return decodeCache[prefix];
};

export const getDecodedFlag = (prefix: string, flag: keyof Flags): boolean => {
  const decoded = decodeKeyPrefix(prefix);
  return decoded[flag] || false;
};

export const isHash = (prefix: string): boolean =>
  getDecodedFlag(prefix, "isHash");
export const isString = (prefix: string): boolean =>
  getDecodedFlag(prefix, "isString");
export const isBase64 = (prefix: string): boolean =>
  getDecodedFlag(prefix, "isBase64");
export const isUrlSafe = (prefix: string): boolean =>
  getDecodedFlag(prefix, "isUrlSafe");
export const isFile = (prefix: string): boolean =>
  getDecodedFlag(prefix, "isFile");

const SEPARATOR = "-";

export const extractKeyPart = (key: string, index: number): string => {
  const parts = key.split(SEPARATOR);
  if (index < 2) {
    return parts[index];
  }
  return parts.slice(index).join(SEPARATOR);
};

export const extractUserId = (key: string): string => {
  const userId = extractKeyPart(key, 1);
  return userId;
};

const extractPrefix = (key: string): string => extractKeyPart(key, 0);

export const extractCustomId = (key: string): string => extractKeyPart(key, 2);

export const extractAndDecodePrefix = (id: string): Flags => {
  const prefix = extractPrefix(id);

  // 使用 decodeKeyPrefix 函数从 prefix 中解析出 flags
  const flags = decodeKeyPrefix(prefix);

  return flags;
};
