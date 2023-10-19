import { SHA3 } from "crypto-js";
import Base64url from "crypto-js/enc-base64url";
import { getPinyin } from "utils/pinyin";

import { setKeyPrefix } from "./prefix";

export const toObjectStringWithType = (object) => {
  const str = Object.entries(object).reduce((acc, cur, index, array) => {
    const isLastIndex = index === array.length - 1;
    const key = getPinyin(cur[0]);
    const valueType = typeof cur[1];
    return isLastIndex
      ? acc + `${key}:${valueType}`
      : acc + `${key}:${valueType}` + ",";
  }, "");
  return str;
};
//some time need handle chinese
export const toTypeNoloData = (object) => {
  const displayKeys = Object.keys(object);
  const saveContent = toObjectStringWithType(object);
  const keyPrefix = setKeyPrefix({ isHash: true, isObject: true });
  const id = `${keyPrefix}-${Base64url.stringify(SHA3(saveContent))}`;
  return { id, displayKeys, saveContent };
};

export const toObjectString = (object) => {
  const str = Object.entries(object).reduce((acc, cur, index, array) => {
    const isLastIndex = index === array.length - 1;
    const key = getPinyin(cur[0]);
    let value = cur[1];
    if (typeof value === "string") {
      value = `'${value}'`;
    }
    return isLastIndex
      ? acc + `${key}:${value}`
      : acc + `${key}:${value}` + ",";
  }, "");
  return str;
};
