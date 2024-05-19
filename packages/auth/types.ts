export interface SignupData {
  username: string;
  publicKey: string;
  userId: string;
  remoteRecoveryPassword: string | null;
  encryptedEncryptionKey: string | null;
  language: string;
}
export interface User {
  userId: string;
  username: string;
  email?: string;
}
export interface AuthState {
  currentUser: User | null;
  users: User[];
  isLoggedIn: boolean;
  currentToken: string | null;
  isLoading: boolean;
}
