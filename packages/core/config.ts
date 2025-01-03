const providerName = "nolotus";

const slogonforYou =
  "The goodness or badness of this world concerns every individual.";

// be cart  CryptoJS.PBKDF2  keySize: 256 / AUTH_VERSION[1].keylen,
// even keylen same ,maybe error rn with web version
export const AUTH_VERSION = {
  "0": {
    salt: providerName + slogonforYou,
  },
  "1": {
    iterations: 10000,
    salt: providerName + slogonforYou,
    keylen: 32,
  },
};
export const SALT = AUTH_VERSION[0].salt;
