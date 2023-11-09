import { signToken } from 'auth/token';
import { generateKeyPairFromSeed } from 'core/crypto';
import { generateUserId } from 'core/generateMainKey';
import { hashPassword } from 'core/password';
import { API_ENDPOINTS } from 'database/config';
import { getLogger } from 'utils/logger';

const authLogger = getLogger('auth');
interface LoginRequest {
  userId: string;
  password: string;
  username: string;
}

export const handleLogin = async (user: LoginRequest) => {
  const { username, password } = user;
  const encryptionKey = await hashPassword(password);
  const language = navigator.language;
  const { publicKey, secretKey } = generateKeyPairFromSeed(
    username + encryptionKey + language,
  );

  const userId = generateUserId(publicKey, username, language);
  const token = signToken({ userId, publicKey, username }, secretKey);

  const response = await fetch(API_ENDPOINTS.USERS + '/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, token }),
  });

  if (response.ok) {
    const { token: newToken } = await response.json();
    authLogger.info({ newToken }, 'Successfully logged in.');
    return newToken;
  } else {
    const statusCode = response.status;
    authLogger.error({ statusCode }, 'Login failed.');
    throw new Error(String(statusCode));
  }
};
