import fs from "fs";
import path from "path";
import { getLogger } from "utils/logger";
import { DATABASE_DIR } from "./init";

const deleteLogger = getLogger("delete");

export async function handleDeleteUser(req, res) {
  const segments = req.url.pathname.split("/");
  const userId = segments.pop();
  const userDirPath = path.join(DATABASE_DIR, userId);
  const isExists = fs.existsSync(userDirPath);

  if (!isExists) {
    return res.status(404).json({ message: "User not found" });
  }

  try {
    // 删除用户目录及其下所有文件
    deleteRecursive(userDirPath);
    deleteLogger.info({ userId }, "User data successfully deleted.");
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    deleteLogger.error(err);
    return res.status(500).json({ message: "Failed to delete user" });
  }
}

// 递归删除目录及其下所有文件
function deleteRecursive(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // 如果是目录,递归删除
        deleteRecursive(curPath);
      } else {
        // 如果是文件,删除文件
        fs.unlinkSync(curPath);
      }
    });
    // 删除当前目录
    fs.rmdirSync(dirPath);
  }
}
