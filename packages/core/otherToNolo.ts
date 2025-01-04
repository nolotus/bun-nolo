import { getPinyin } from "utils/pinyin";

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

export function listToTrans(arr) {
  // 将数组中的每个元素转换成字符串
  // 对于包含逗号或双引号的元素，将其包裹在双引号中，并将内部的双引号替换成两个双引号
  return arr
    .map((item) => {
      if (item.includes(",") || item.includes('"')) {
        return `"${item.replace(/"/g, '""')}"`;
      }
      return item;
    })
    .join(",");
}
