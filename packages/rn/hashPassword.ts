import QuickCrypto from "react-native-quick-crypto";
import { AUTH_VERSION } from "core/config";

export const rnHashpasswordV1 = (password) => {
  const buf = QuickCrypto.pbkdf2Sync(
    password,
    AUTH_VERSION[1].salt,
    AUTH_VERSION[1].iterations,
    AUTH_VERSION[1].keylen,
    "SHA-512"
  );

  const result = buf.toString("base64");
  return result;
};
