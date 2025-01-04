import { Argon2, Argon2Mode } from "@sphereon/isomorphic-argon2";
import { SALT } from "./config";

export const hashedPasswordV0 = async (password: string) => {
  const hashedPassword = await Argon2.hash(password, SALT, {
    hashLength: 32,
    memory: 1024,
    parallelism: 1,
    mode: Argon2Mode.Argon2id,
    iterations: 1,
  });
  return hashedPassword.encoded;
};
