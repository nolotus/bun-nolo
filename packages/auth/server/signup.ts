import fs from "fs";
import path from "path";

import { signMessage } from "core/crypto";
import { generateUserId } from "core/generateMainKey";
import { t } from "i18next";
import { getLogger } from "utils/logger";

import {
  DATABASE_DIR,
  DEFAULT_INDEX_FILE,
  DEFAULT_HASH_FILE,
} from "database/init";

const signUpLogger = getLogger("signUp");

// 生成文件内容
const generateFileContent = (
  publicKey,
  username,
  encryptedEncryptionKey,
  remoteRecoveryPassword,
  userId,
) => {
  const publicKeyId = `0-${userId}-publicKey`;
  const usernameId = `0-${userId}-username`;
  const encryptedEncryptionKeyId = `0-${userId}-encryptedEncryptionKey`;
  const remoteRecoveryPasswordId = `0-${userId}-remoteRecoveryPassword`;

  return [
    `${publicKeyId} ${publicKey}`,
    `${usernameId} ${username}`,
    `${encryptedEncryptionKeyId} ${encryptedEncryptionKey}`,
    `${remoteRecoveryPasswordId} ${remoteRecoveryPassword}`,
    "", // 添加一个空行，相当于在文件末尾添加一个换行符
  ].join("\n");
};

export async function handleSignUp(req, res) {
  const {
    username,
    publicKey,
    encryptedEncryptionKey,
    remoteRecoveryPassword,
    language,
  } = req.body;
  const userId = generateUserId(publicKey, username, language);
  signUpLogger.info({ userId }, "userId");

  const userDirPath = path.join(DATABASE_DIR, userId);
  const isExists = fs.existsSync(userDirPath);
  if (isExists) {
    return res
      .status(409)
      .json({ message: t("errors.dataExists", { id: userId }) });
  }
  signUpLogger.info({ isExists }, "isExists");

  const indexPath = path.join(userDirPath, DEFAULT_INDEX_FILE);
  const hashPath = path.join(userDirPath, DEFAULT_HASH_FILE);

  const fileContent = generateFileContent(
    publicKey,
    username,
    encryptedEncryptionKey,
    remoteRecoveryPassword,
    userId,
  );
  signUpLogger.info({ fileContent }, "fileContent");
  signUpLogger.info({ username, userId, publicKey }, "get message");

  const message = JSON.stringify({
    username,
    userId,
    publicKey,
  });
  const secretKey = process.env.SECRET_KEY;
  signUpLogger.info({ message, secretKey }, "message,secretKey");

  const encryptedData = signMessage(message, secretKey);
  signUpLogger.info({ encryptedData }, "encryptedData");

  fs.mkdirSync(userDirPath, { recursive: true });
  fs.writeFileSync(indexPath, fileContent);
  fs.writeFileSync(hashPath, "");

  signUpLogger.info({ userId, username }, "User data successfully saved.");

  return res.status(200).json({ encryptedData });
}
