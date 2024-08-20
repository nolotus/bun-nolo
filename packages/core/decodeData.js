import { listToArray, noloToObject } from "./noloToOther";
import { extractAndDecodePrefix } from "./prefix";
import { getLogger } from "utils/logger";

const exampleText = `
number1 100
number2 100.1
fakenumber3 100.2.2 
booleantest false
0010-object x:1,y:2,z:3
0010-complexObject asdsad:"aasd,:",zxczxc:asdsad,zxc233xzc:asdzxc
array 1,2,3,4,5
0001-complexArray "1,,asdfasd",sada2szx,asda3sd,"4asdas,asd"
0001-complexArray2 "p1,xxx,yyy,","p2sdasdsadxxx","p3asdaszvzxv,"p4asdasd ,asdasd. asdasdzxciahfqwf["
pureString 1234asdascxz
complexString "1234asdas, : cxz"`;
const isBase64 = (str) => {
  const regExp =
    /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  return regExp.test(str);
};
const decodeData = (data, flags, id) => {
  let decodedData = data;

  const decodeOperations = {
    isBase64: (data) => (isBase64(data) ? Base64.atob(data) : data),
    isObject: (data) => {
      const result = noloToObject(data);
      return result;
    },
    isJSON: (data) => {
      try {
        return JSON.parse(data);
      } catch (error) {
        return data; // 返回原始数据，如果 JSON 解析失败
      }
    },
    isUrlSafe: decodeURIComponent,
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

export const getHeadTail = (str, separtor = " ") => {
  const index = str.indexOf(separtor);
  const key = str.slice(0, index);
  const value = str.slice(index + 1);

  return { key, value };
};

const parseValue = (value) => {
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
export const parseStrWithId = (id, str) => {
  const flags = extractAndDecodePrefix(id);

  const parsedValue = parseValue(str);
  const decodedValue = decodeData(parsedValue, flags, id);
  return decodedValue;
};
