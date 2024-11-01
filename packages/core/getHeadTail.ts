export const getHeadTail = (str, separtor = " ") => {
  const index = str.indexOf(separtor);
  if (index === -1) {
    // 当分隔符不存在时，考虑返回整个字符串作为键或抛出错误
    return { key: str, value: "" }; // 或根据需求抛出错误
  }
  const key = str.slice(0, index);
  const value = str.slice(index + 1);

  return { key, value };
};
