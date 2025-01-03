import { Base64 } from "js-base64";

export function base64UrlEncode(inputStr: string): string {
  return Base64.btoa(String.fromCharCode(...new TextEncoder().encode(inputStr)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/[=]+$/, "");
}

export function base64UrlDecode(base64Url: string | undefined): string | null {
  console.log("Input base64Url:", base64Url);

  if (!base64Url) {
    console.log("base64Url is empty");
    return null;
  }

  try {
    let paddedBase64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    console.log("After replace:", paddedBase64);

    while (paddedBase64.length % 4) {
      paddedBase64 += "=";
    }
    console.log("After padding:", paddedBase64);

    const decodedString = Base64.atob(paddedBase64);
    console.log("After atob:", decodedString);

    // 直接返回decodedString，因为atob已经解码成可读字符串了
    return decodedString;
  } catch (error) {
    console.error("Error in base64UrlDecode:", error);
    throw error;
  }
}

export const base64UrlToUint8Array = (base64Url: string) => {
  const regex = /^[0-9a-zA-Z-_]*$/;

  if (!regex.test(base64Url)) {
    throw new Error("Invalid character in input base64Url string");
  }

  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }

  const binaryString = Base64.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const uint8ArrayToBase64Url = (array) => {
  const base64 = Base64.btoa(String.fromCharCode.apply(null, array));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/[=]+$/, "");
};
