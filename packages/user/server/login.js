import path from "path";
import { t } from "i18next";
import { verifyToken } from "auth/token";
import { DATABASE_DIR } from "./init";

export async function logIn(req, res) {
  const { userId, token } = req.body;
  // 定义目录路径
  const userDirPath = path.join(DATABASE_DIR, userId);
  const file = Bun.file(userDirPath);
  const isExist = await file.exists();
  // 检查目录是否存在
  if (!isExist) {
    // 如果目录不存在，返回404状态和错误消息
    return res
      .status(404)
      .json({ message: t("errors.dataNotFound", { id: userId }) });
  } else {
    const storedPublicKey = await serverGetData(`0-${userId}-publicKey`);
    const verification = await verifyToken(token, storedPublicKey);
    if (verification) {
      return res.status(200).json({ message: t("User logged in"), token });
    } else {
      return res.status(403).json({ message: t("errors.wrongPassword") });
    }
  }
}
