import path from "path";

import { t } from "i18next";
import { verifyToken } from "auth/token";
import serverDb, { DB_PREFIX } from "database/server/db.js";
import { serverGetData } from "database/server/read";
import { DATABASE_DIR, DEFAULT_INDEX_FILE } from "database/init";

export async function handleLogin(req, res) {
  const { userId, token, version } = req.body;

  if (version === "v1") {
    try {
      const user = await serverDb.get(DB_PREFIX.USER + userId);
      if (!user) {
        return res
          .status(404)
          .json({ message: t("errors.dataNotFound", { id: userId }) });
      }
      console.log("user", user);
      const storedPublicKey = user.publicKey;
      console.log("storedPublicKey", storedPublicKey);
      const verification = await verifyToken(token, storedPublicKey);
      if (verification) {
        return res.status(200).json({ message: t("User logged in"), token });
      }
      return res.status(403).json({ message: t("errors.wrongPassword") });
    } catch (err) {
      if (err.code === "LEVEL_NOT_FOUND") {
        return res
          .status(404)
          .json({ message: t("errors.dataNotFound", { id: userId }) });
      }
      return res.status(500).json({ error: err.message });
    }
  }

  // 原来的代码保持不变
  const userDirPath = path.join(DATABASE_DIR, userId, DEFAULT_INDEX_FILE);
  const file = Bun.file(userDirPath);
  const isExist = await file.exists();
  if (!isExist) {
    return res
      .status(404)
      .json({ message: t("errors.dataNotFound", { id: userId }) });
  }
  const publicKeyId = `0-${userId}-publicKey`;
  const storedPublicKey = await serverGetData(publicKeyId);
  const verification = await verifyToken(token, storedPublicKey);
  if (verification) {
    return res.status(200).json({ message: t("User logged in"), token });
  }
  return res.status(403).json({ message: t("errors.wrongPassword") });
}
