// auth/web/tokenManager.ts
import type { TokenManager } from "../types";
import { safelyParseJSON } from "../types";

export const webTokenManager: TokenManager = {
  async getTokens() {
    const stored = localStorage.getItem("tokens");
    if (!stored) return [];
    return safelyParseJSON(stored);
  },

  async storeToken(newToken: string) {
    const tokens = await this.getTokens();
    const filtered = tokens.filter((t) => t !== newToken);
    filtered.unshift(newToken);
    localStorage.setItem("tokens", JSON.stringify(filtered));
  },

  async removeToken(tokenToRemove: string) {
    const tokens = await this.getTokens();
    const filtered = tokens.filter((t) => t !== tokenToRemove);
    localStorage.setItem("tokens", JSON.stringify(filtered));
  },

  async initTokens() {
    return this.getTokens();
  },
};
