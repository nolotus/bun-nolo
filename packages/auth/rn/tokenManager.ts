// auth/rn/tokenManager.ts
import * as Keychain from "react-native-keychain";
import type { TokenManager } from "../types";
import { safelyParseJSON } from "../types";

const STORAGE_KEY = "app_tokens";

export const rnTokenManager: TokenManager = {
  async getTokens() {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: STORAGE_KEY,
      });
      if (!credentials) return [];
      const tokens = safelyParseJSON(credentials.password);
      return Array.isArray(tokens) ? tokens : [tokens];
    } catch (error) {
      console.error("Failed to get tokens:", error);
      return [];
    }
  },

  async storeToken(newToken: string) {
    if (!newToken) return;
    try {
      const tokens = await this.getTokens();
      const filtered = tokens.filter((token) => token !== newToken);
      filtered.unshift(newToken);
      await Keychain.setGenericPassword(STORAGE_KEY, JSON.stringify(filtered), {
        service: STORAGE_KEY,
      });
    } catch (error) {
      console.error("Failed to store tokens:", error);
    }
  },

  async removeToken(tokenToRemove: string) {
    if (!tokenToRemove) return;
    try {
      const tokens = await this.getTokens();
      const filtered = tokens.filter((token) => token !== tokenToRemove);
      await Keychain.setGenericPassword(STORAGE_KEY, JSON.stringify(filtered), {
        service: STORAGE_KEY,
      });
    } catch (error) {
      console.error("Failed to remove token:", error);
    }
  },

  async initTokens() {
    return this.getTokens();
  },
};

// 可选: 如果需要清除所有token的功能
export const clearAllTokens = async () => {
  try {
    await Keychain.resetGenericPassword({ service: STORAGE_KEY });
  } catch (error) {
    console.error("Failed to clear tokens:", error);
  }
};
