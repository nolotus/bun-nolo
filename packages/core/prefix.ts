import { FLAGS_MAP } from "./flagsMap";

// 添加一个缓存对象
const decodeCache = {};

// 使用 TypeScript 定义类型
export interface Flags {
  isString?: boolean;
  isJSON?: boolean;
}

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

export const isString = (prefix: string): boolean =>
  getDecodedFlag(prefix, "isString");

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
