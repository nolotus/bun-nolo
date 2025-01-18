// auth/types.ts

export interface User {
  userId: string;
  username?: string;
  email?: string;
}
export interface TokenManager {
  getTokens(): Promise<string[]>;
  storeToken(token: string): Promise<void>;
  removeToken(token: string): Promise<void>;
  initTokens(): Promise<string[]>;
}

export const safelyParseJSON = (jsonString: string) => {
  try {
    const parsed = JSON.parse(jsonString);
    return typeof parsed === "string" ? [parsed] : parsed;
  } catch {
    return [jsonString];
  }
};
