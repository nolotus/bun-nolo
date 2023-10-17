export interface SignupData {
  username: string;
  publicKey: string;
  userId: string;
  remoteRecoveryPassword: string | null;
  encryptedEncryptionKey: string | null;
  language: string;
}
