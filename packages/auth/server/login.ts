import path from "path";
import { t } from "i18next";
import { verifyToken } from "auth/token";
import { serverGetData } from "database/server/read";
import { DATABASE_DIR, DEFAULT_INDEX_FILE } from "database/init";

export async function handleLogin(req, res) {
  const { userId, token } = req.body;
  const userDirPath = path.join(DATABASE_DIR, userId, DEFAULT_INDEX_FILE);
  const file = Bun.file(userDirPath);
  const isExist = await file.exists();
  if (!isExist) {
    return res
      .status(404)
      .json({ message: t("errors.dataNotFound", { id: userId }) });
  }
  console.log("userId", userId);
  const publicKeyId = `0-${userId}-publicKey`;
  const storedPublicKey = await serverGetData(publicKeyId);
  console.log("storedPublicKey", storedPublicKey);
  const verification = await verifyToken(token, storedPublicKey);
  if (verification) {
    return res.status(200).json({ message: t("User logged in"), token });
  }
  return res.status(403).json({ message: t("errors.wrongPassword") });
}
