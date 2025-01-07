import { Flags } from "./prefix";

function listToTrans(arr) {
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

export const formatData = (data: any, flags: Flags): string => {
  let formattedData = data;
  if (flags?.isList) {
    formattedData = listToTrans(data);
  } else {
    formattedData = JSON.stringify(data);
  }

  return formattedData;
};
