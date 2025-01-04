export interface SignupData {
  username: string;
  publicKey: string;
  userId: string;
  locale: string;
}
export interface User {
  userId: string;
  username: string;
  email?: string;
}
