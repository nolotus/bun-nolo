import { hash } from "tweetnacl";

export const generateFileID = (buffer) => {
  const hash_result = hash(buffer);
  return Buffer.from(hash_result).toString("hex");
};
