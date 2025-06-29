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
    return result;
  } catch (error) {
    return null;
  }
};

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
        }
      })
      .catch(() => {
        clearTimeout(timeoutId);
      });
  });
};

export const signUpAction = async (user, thunkAPI) => {
  const { username, locale, password, email, inviterId } = user;
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
    inviterId,
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
  const localUserId = generateUserIdV1(publicKey, username, locale);

  const isValid =
    remoteData.publicKey === publicKey &&
    remoteData.username === username &&
    remoteData.userId === localUserId;

  if (!isValid) {
    throw new Error("Server data does not match local data");
  }

  const backupServers = [SERVERS.MAIN, SERVERS.US].filter(
    (server) => server !== currentServer
  );

  if (backupServers.length > 0) {
    Promise.resolve().then(() => {
      signUpToBackupServers(backupServers, sendData, nolotusPubKey);
    });
  }

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
