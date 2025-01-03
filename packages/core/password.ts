import { Argon2, Argon2Mode } from "@sphereon/isomorphic-argon2";
import CryptoJS from "crypto-js";
import { SALT } from "core/config";

export const hashPassword = async (password: string) => {
  const hashedPassword = await Argon2.hash(password, SALT, {
    hashLength: 32,
    memory: 1024,
    parallelism: 1,
    mode: Argon2Mode.Argon2id,
    iterations: 1,
  });
  return hashedPassword.encoded;
};

export const generateAndSplitRecoveryPassword = (
  securityAnswer: string,
  localLength: number = 3
): [string, string] => {
  // 生成基于安全问题答案的恢复密码
  const hashedAnswer = CryptoJS.SHA256(securityAnswer).toString(
    CryptoJS.enc.Base64
  );

  // 拆分为本地和远程恢复密码
  const localRecoveryPassword = hashedAnswer.substring(0, localLength);
  const remoteRecoveryPassword = hashedAnswer.substring(localLength);

  return [localRecoveryPassword, remoteRecoveryPassword];
};

export const encryptWithPassword = (data: string, password: string): string => {
  const ciphertext = CryptoJS.AES.encrypt(data, password).toString();
  return ciphertext;
};
