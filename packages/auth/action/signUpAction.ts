import { selectCurrentServer } from "setting/settingSlice";
import { addDays, formatISO } from "date-fns";
import pino from "pino";
import { verifySignedMessage, generateKeyPairFromSeedV1 } from "core/crypto";
import { generateUserIdV1 } from "core/generateMainKey";
import { signToken, parseToken } from "auth/token";
import { API_VERSION } from "database/config";

const logger = pino({
  level: "info",
  transport: {
    target: "pino-pretty",
  },
});

const CYBOT_SERVERS = {
  ONE: "https://cybot.one",
  RUN: "https://cybot.run",
};

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
    return JSON.parse(decryptedData);
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
  const { username, locale, encryptionKey, email } = user;
  logger.info({ username, locale }, "Starting signup process");

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
  const state = thunkAPI.getState();
  const currentServer = selectCurrentServer(state);

  // 首先在当前服务器注册
  const remoteData = await signUpToServer(
    currentServer,
    sendData,
    nolotusPubKey
  );

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
  const backupServers = [CYBOT_SERVERS.ONE, CYBOT_SERVERS.RUN].filter(
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

  const parsedUser = parseToken(token);
  logger.info({ username }, "Signup successful");

  return { user: parsedUser, token };
};
