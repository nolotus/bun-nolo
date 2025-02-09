import nacl from "tweetnacl";

export const generateUserIdV1 = (
  publicKey: string,
  username: string,
  language: string,
  extra: string = ""
) => {
  const text = publicKey + username + language + extra;
  const encodedText = new TextEncoder().encode(text);
  const hash = nacl.hash(encodedText);

  // 方案1：使用Array.from和map
  const hexString = Array.from(hash)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // 方案2：更简洁的写法，用Uint8Array直接转
  // const hexString = [...hash].map(x => x.toString(16).padStart(2,'0')).join('');

  return hexString.slice(0, 10);
};
