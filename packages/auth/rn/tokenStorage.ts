import * as Keychain from "react-native-keychain";

const STORAGE_KEY = "app_tokens";

const safelyParseJSON = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);
    // 和web端保持一致的处理逻辑
    return typeof parsed === "string" ? [parsed] : parsed;
  } catch {
    return [jsonString]; // 解析失败时,把原值作为单个token返回
  }
};

export const getTokensFromStorage = async () => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: STORAGE_KEY,
    });
    console.log("credentials", credentials);
    if (!credentials) return [];

    const tokens = safelyParseJSON(credentials.password);
    console.log("getTokensFromStorage tokens", tokens);

    return Array.isArray(tokens) ? tokens : [tokens]; // 和web端保持一致
  } catch (error) {
    console.error("Failed to get tokens:", error);
    return [];
  }
};

export const storeTokens = async (newToken) => {
  if (!newToken) return;

  try {
    let tokens = await getTokensFromStorage();
    tokens = tokens.filter((token) => token !== newToken);
    tokens.unshift(newToken);

    await Keychain.setGenericPassword(STORAGE_KEY, JSON.stringify(tokens), {
      service: STORAGE_KEY,
    });
  } catch (error) {
    console.error("Failed to store tokens:", error);
  }
};

export const removeToken = async (tokenToRemove) => {
  if (!tokenToRemove) return;

  try {
    const tokens = (await getTokensFromStorage()).filter(
      (token) => token !== tokenToRemove
    );

    await Keychain.setGenericPassword(STORAGE_KEY, JSON.stringify(tokens), {
      service: STORAGE_KEY,
    });
  } catch (error) {
    console.error("Failed to remove token:", error);
  }
};

export const retrieveFirstToken = async () => {
  try {
    const tokens = await getTokensFromStorage();
    return tokens.length > 0 ? tokens[0] : null;
  } catch (error) {
    console.error("Failed to get first token:", error);
    return null;
  }
};

export const clearTokens = async () => {
  try {
    await Keychain.resetGenericPassword({ service: STORAGE_KEY });
  } catch (error) {
    console.error("Failed to clear tokens:", error);
  }
};
