import { selectCurrentServer } from "setting/settingSlice";
import { addDays, formatISO } from "date-fns";
import pino from "pino";
import { verifySignedMessage } from "core/crypto";
import { generateUserIdV1 } from "core/generateMainKey";
import { signToken, parseToken } from "auth/token";
import { API_VERSION } from "database/config";
import { hashPasswordV1 } from "core/password";
import { generateKeyPairFromSeedV1 } from "core/generateKeyPairFromSeedV1";
import { SERVERS } from "database/requests";
const logger = pino({
  level: "info",
  transport: {
    target: "pino-pretty",
  },
});

const TIMEOUT = 5000;

// 单个服务器注册请求
const signUpToServer = async (
  server: string,
  sendData: any,
  nolotusPubKey: string,
  signal?: AbortSignal
) => {
  try {
    const response = await fetch(`${server}${API_VERSION}/users/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sendData),
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { encryptedData } = await response.json();
    const decryptedData = await verifySignedMessage(
      encryptedData,
      nolotusPubKey
    );
    const result = JSON.parse(decryptedData);
    console.log("result", result);
    return result;
  } catch (error) {
    logger.error({ error, server }, "SignUp request failed");
    return null;
  }
};

// 后台注册到其他服务器
const signUpToBackupServers = (
  servers: string[],
  sendData: any,
  nolotusPubKey: string
) => {
  servers.forEach((server) => {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), TIMEOUT);

    signUpToServer(server, sendData, nolotusPubKey, abortController.signal)
      .then((result) => {
        clearTimeout(timeoutId);
        if (!result) {
          logger.warn({ server }, "Backup server registration failed");
        }
      })
      .catch(() => {
        clearTimeout(timeoutId);
      });
  });
};

export const signUpAction = async (user, thunkAPI) => {
  const { username, locale, password, email } = user;
  const state = thunkAPI.getState();
  const tokenManager = state.auth.tokenManager;
  const encryptionKey = await hashPasswordV1(password);
  const { publicKey, secretKey } = generateKeyPairFromSeedV1(
    username + encryptionKey + locale
  );

  const sendData = {
    username,
    publicKey,
    locale,
    email,
  };

  const nolotusPubKey = "pqjbGua2Rp-wkh3Vip1EBV6p4ggZWtWvGyNC37kKPus";

  const currentServer = selectCurrentServer(state);

  // 首先在当前服务器注册
  const remoteData = await signUpToServer(
    currentServer,
    sendData,
    nolotusPubKey
  );
  console.log("remoteData", remoteData);

  if (!remoteData) {
    throw new Error("Failed to register on current server");
  }
  const localUserId = generateUserIdV1(publicKey, username, locale);

  // 验证返回数据
  const isValid =
    remoteData.publicKey === publicKey &&
    remoteData.username === username &&
    remoteData.userId === localUserId;

  if (!isValid) {
    throw new Error("Server data does not match local data");
  }

  // 后台注册到其他服务器
  const backupServers = [SERVERS.MAIN, SERVERS.US].filter(
    (server) => server !== currentServer
  );

  if (backupServers.length > 0) {
    Promise.resolve().then(() => {
      signUpToBackupServers(backupServers, sendData, nolotusPubKey);
    });
  }

  // 生成token
  const now = new Date();
  const exp = formatISO(addDays(now, 7));
  const iat = formatISO(now);
  const nbf = formatISO(now);

  const token = signToken(
    { userId: localUserId, username, exp, iat, nbf },
    secretKey
  );
  tokenManager.storeToken(token);
  const parsedUser = parseToken(token);
  logger.info({ username }, "Signup successful");

  return { user: parsedUser, token };
};
