import fs from "fs";
import path from "path";
import { baseDir } from "database/server/config";
import { reverse } from "rambda";

/**
 * 寻找日志文件，包括以 "wal" 和 "default" 开头的文件。
 */
export const findLogFiles = (): string[] => {
  console.log("开始查找日志文件...");

  const logFiles = fs
    .readdirSync(baseDir)
    .filter((file) => /^(wal|default)(_\d+_\d+|)\.log$/.test(file)) // 修改正则表达式
    .sort((a, b) => {
      const [aTimestamp, aSeq] = a.match(/\d+/g) || [];
      const [bTimestamp, bSeq] = b.match(/\d+/g) || [];
      if (aTimestamp === bTimestamp) {
        return parseInt(aSeq || "0", 10) - parseInt(bSeq || "0", 10);
      }
      return parseInt(aTimestamp || "0", 10) - parseInt(bTimestamp || "0", 10);
    });

  console.log(`找到 ${logFiles.length} 个日志文件`);

  return logFiles;
};

/**
 * 根据给定的日志文件名读取日志文件的内容，并返回行数据。
 *
 * @param logFile - 日志文件的名称
 * @returns 日志文件中的行数据
 */
export const getLogFileLines = (logFile: string): string[] => {
  const logPath = path.join(baseDir, logFile);
  const logContent = fs.readFileSync(logPath, "utf-8");
  fs.unlinkSync(logPath); // 删除这个文件
  const lines = reverse(logContent.split("\n").filter((line) => line.trim())); // 使用 rambda 的 reverse

  console.log(`读取文件内容 [${logFile}]:`);
  console.log(lines); // 输出反转后的行数据

  return lines;
};

export const writeMemoryLog = (key: string, value: string): void => {
  const logPath = path.resolve(baseDir, "default.log");

  // 确保目录存在
  const logDir = path.dirname(logPath);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logEntry = `${key} ${value}\n`;
  fs.appendFileSync(logPath, logEntry, "utf-8");
};
