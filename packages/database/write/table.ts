import path from "path";
import { DATABASE_DIR } from "../init";
import { appendDataToFile, checkFileExists } from "utils/file";

export const serverCreateTable = async (userId: string, tableName: string) => {
  const userDirPath = path.join(DATABASE_DIR, userId);
  const tablePath = path.join(userDirPath, `${tableName}.nolo`);
  await checkFileExists(tablePath);
  await Bun.write(tablePath, `header placeholder maxid min id /n`);
};
export const serverWriteDataInTable = async (
  userId: string,
  tableName: string,
  dataKey: string,
  data: string,
) => {
  const userDirPath = path.join(DATABASE_DIR, userId);
  const tablePath = path.join(userDirPath, `${tableName}.nolo`);
  // await Bun.write(tablePath, `${dataKey} ${data}/n`);
  appendDataToFile(tablePath, dataKey, data);
};
