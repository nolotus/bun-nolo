import fs from "fs";
import { sort, reverse } from "rambda";

export const getSortedFilteredFiles = (
  userDir: string,
  isDescending: boolean = true,
): string[] => {
  let files: string[] = [];

  try {
    files = fs.readdirSync(userDir);
  } catch (error) {
    console.error("无法读取目录:", error);
    return [];
  }

  const filteredFiles = files.filter((file) => {
    // 使用新的正则表达式能够兼容所有文件格式
    const isMatch = /^data_(\d+)(?:T\d+Z)?(?:_(\d+))?_layer(\d+)\.nolo$/.test(
      file,
    );
    return isMatch;
  });

  const sortedFiles = sort((a, b) => {
    // 使用新的正则表达式来匹配文件
    const amatch = a.match(
      /^data_(\d+)(?:T(\d+))?Z?(?:_(\d+))?_layer(\d+)\.nolo$/,
    );
    const bmatch = b.match(
      /^data_(\d+)(?:T(\d+))?Z?(?:_(\d+))?_layer(\d+)\.nolo$/,
    );

    if (!amatch || !bmatch) {
      console.warn(`文件 '${a}' 或 '${b}' 无法正确匹配，保持原序`);
      return 0;
    }

    // 当不包含 'T' 和 'Z' 时，只有一个数字部分，需要这样进行合并
    const atimeStr = amatch[1] + (amatch[2] || "");
    const btimeStr = bmatch[1] + (bmatch[2] || "");

    const atime = Number(atimeStr);
    const btime = Number(btimeStr);

    const aindex = amatch[3] ? Number(amatch[3]) : 0;
    const alayer = Number(amatch[4]);

    const bindex = bmatch[3] ? Number(bmatch[3]) : 0;
    const blayer = Number(bmatch[4]);

    // 比较层数
    if (alayer !== blayer) {
      return alayer - blayer;
    }

    // 比较时间戳
    if (atime !== btime) {
      return atime - btime;
    }

    // 比较序号
    return aindex - bindex;
  }, filteredFiles);

  const finalFiles = isDescending ? sortedFiles : reverse(sortedFiles);

  return finalFiles;
};
