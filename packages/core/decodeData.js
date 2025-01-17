import { getHeadTail } from "./getHeadTail";
import { extractAndDecodePrefix } from "./prefix";

const listToArray = (data) => {
  if (!data) return [];
  const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
  return data.split(regex).map((item) => {
    return item.replace(/^"|"$/g, "");
  });
};


 const decodeData = (data, flags, id) => {
  let decodedData = data;

  const decodeOperations = {

    isJSON: (data) => {
      try {
        return JSON.parse(data);
      } catch (error) {
        return data; // 返回原始数据，如果 JSON 解析失败
      }
    },
    isList: (data) => {
      return listToArray(data);
    },
  };

  for (const flag in flags) {
    if (decodeOperations[flag] && flags[flag]) {
      decodedData = decodeOperations[flag](decodedData);
    }
  }
  return decodedData;
};

export const parseValue = (value) => {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  // 使用正则表达式，考虑科学计数法等极端情况
  // ^-? 表示可能的负号
  // \d*\.?\d+ 匹配整数或小数
  // (?:[eE][-+]?\d+)? 匹配科学计数法的指数部分
  const isNumericRegex = /^-?\d*\.?\d+(?:[eE][-+]?\d+)?$/;
  if (isNumericRegex.test(value)) {
    return parseFloat(value);
  }
  return value;
};

export function processLine(line) {
  if (line.trim() === "") {
    return [];
  }
  const { key: id, value } = getHeadTail(line, " ");
  const parsedValue = parseValue(value);
  const flags = extractAndDecodePrefix(id);

  //add id for test
  const decodedValue = decodeData(parsedValue, flags, id);

  return [id.trim(), decodedValue];
}
