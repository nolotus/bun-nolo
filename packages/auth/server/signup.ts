import levelDb, { DB_PREFIX } from "database/server/db.js";
import { reject } from "rambda";

import { signMessage } from "core/crypto";
import { generateUserIdV1 } from "core/generateMainKey";
import { t } from "i18next";
import { getLogger } from "utils/logger";

const signUpLogger = getLogger("signUp");

export async function handleSignUp(req, res) {
  const { username, publicKey, locale } = req.body;
  const userId = generateUserIdV1(publicKey, username, locale);

  // 先检查用户是否存在
  try {
    const existingUser = await levelDb.get(DB_PREFIX.USER + userId);
    if (existingUser) {
      return res
        .status(409)
        .json({ message: t("errors.dataExists", { id: userId }) });
    }
  } catch (err) {
    if (err.code !== "LEVEL_NOT_FOUND") {
      return res.status(500).json({ error: err.message });
    }
  }

  const userData = reject((x) => x === null || x === undefined, {
    username,
    publicKey,
    locale,
    createdAt: Date.now(),
  });

  await levelDb.put(DB_PREFIX.USER + userId, JSON.stringify(userData));

  // 验证数据是否写入成功
  try {
    const savedUser = await levelDb.get(DB_PREFIX.USER + userId);
    console.log("Saved user data:", savedUser);
  } catch (err) {
    console.error("Failed to verify saved user:", err);
  }

  const message = JSON.stringify({
    username,
    userId,
    publicKey,
  });

  const secretKey = process.env.SECRET_KEY;
  if (!secretKey) {
    signUpLogger.error(
      "Secret key is not defined in the environment variables."
    );
    return res.status(500).json({ message: t("errors.secretKeyMissing") });
  }

  const encryptedData = signMessage(message, secretKey);
  return res.status(200).json({ encryptedData });
}
