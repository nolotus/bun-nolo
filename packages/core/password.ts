import CryptoJS from "crypto-js";
import { SALT, AUTH_VERSION } from "core/config";

export const hashPasswordV1 = async (password: string): Promise<string> => {
  const hash = CryptoJS.PBKDF2(password, SALT, {
    keySize: 256 / AUTH_VERSION[1].keylen,
    iterations: AUTH_VERSION[1].iterations,
    hasher: CryptoJS.algo.SHA512,
  });

  // 将 salt 和 hash 组合存储
  return hash.toString(CryptoJS.enc.Base64);
};
