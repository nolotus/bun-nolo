export interface SignupData {
  username: string;
  publicKey: string;
  userId: string;
  remoteRecoveryPassword: string | null;
  encryptedEncryptionKey: string | null;
  locale: string;
}
export interface User {
  userId: string;
  username: string;
  email?: string;
}
