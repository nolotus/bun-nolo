// authSlice.ts

import { selectCurrentServer } from "app/settings/settingSlice";
import { addDays, formatISO } from "date-fns";
import { verifySignedMessage } from "core/crypto";
import { generateUserIdV1 } from "core/generateMainKey";
import { signToken, parseToken } from "auth/token";
import { API_VERSION } from "database/config";
import { hashPasswordV1 } from "core/password";
import { generateKeyPairFromSeedV1 } from "core/generateKeyPairFromSeedV1";
import { SERVERS } from "database/requests";

const TIMEOUT = 5000;

type SignUpSendData = {
  username: string;
  publicKey: string;
  locale: string;
  email?: string;
  inviterId?: string;
  clientIp?: string | null; // 新增：客户端公网 IP（可选）
};

// 获取客户端公网 IP（失败时返回 null，不阻塞注册流程）
const getPublicIp = async (): Promise<string | null> => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1500); // 1.5s 超时
    const res = await fetch("https://api.ipify.org?format=json", {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.ip || null;
  } catch {
    return null;
  }
};

const signUpToServer = async (
  server: string,
  sendData: SignUpSendData,
  nolotusPubKey: string,
  signal?: AbortSignal
) => {
  try {
    const response = await fetch(`${server}${API_VERSION}/users/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 可选：把客户端 IP 放到头部，方便后端记录/比对
        ...(sendData?.clientIp
          ? { "X-Client-IP": String(sendData.clientIp) }
          : {}),
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
    return result;
  } catch (error) {
    return null;
  }
};

const signUpToBackupServers = (
  servers: string[],
  sendData: SignUpSendData,
  nolotusPubKey: string
) => {
  servers.forEach((server) => {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), TIMEOUT);

    signUpToServer(server, sendData, nolotusPubKey, abortController.signal)
      .then((result) => {
        clearTimeout(timeoutId);
        if (!result) {
          // 备份注册失败时，此处可按需记录日志或上报
        }
      })
      .catch(() => {
        clearTimeout(timeoutId);
      });
  });
};

export const signUpAction = async (user: any, thunkAPI: any) => {
  const { username, locale, password, email, inviterId } = user;
  const state = thunkAPI.getState();
  const tokenManager = thunkAPI.extra.tokenManager;

  // 本地生成密钥对
  const encryptionKey = await hashPasswordV1(password);
  const { publicKey, secretKey } = generateKeyPairFromSeedV1(
    username + encryptionKey + locale
  );

  // 新增：获取客户端公网 IP（失败则为 null）
  const clientIp = await getPublicIp();

  const sendData: SignUpSendData = {
    username,
    publicKey,
    locale,
    email,
    inviterId,
    clientIp, // 新增字段：传给后端
  };

  const nolotusPubKey = "pqjbGua2Rp-wkh3Vip1EBV6p4ggZWtWvGyNC37kKPus";

  const currentServer = selectCurrentServer(state);

  const remoteData = await signUpToServer(
    currentServer,
    sendData,
    nolotusPubKey
  );

  if (!remoteData) {
    throw new Error("Failed to register on current server");
  }

  // 本地重新计算 userId，校验服务端回包一致性
  const localUserId = generateUserIdV1(publicKey, username, locale);
  const isValid =
    remoteData.publicKey === publicKey &&
    remoteData.username === username &&
    remoteData.userId === localUserId;

  if (!isValid) {
    throw new Error("Server data does not match local data");
  }

  // 异步向备份服务器同步注册
  const backupServers = [SERVERS.MAIN, SERVERS.US].filter(
    (server) => server !== currentServer
  );
  if (backupServers.length > 0) {
    Promise.resolve().then(() => {
      signUpToBackupServers(backupServers, sendData, nolotusPubKey);
    });
  }

  // 生成本地登录 token
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

  return { user: parsedUser, token };
};
