import { PayloadAction } from "@reduxjs/toolkit";
import { NoloRootState } from "app/store";
import { buildCreateSlice, asyncThunkCreator } from "@reduxjs/toolkit";
import { generateUserId } from "core/generateMainKey";
import { hashPassword } from "core/password";
import { generateKeyPairFromSeed, verifySignedMessage } from "core/crypto";
import { signToken } from "auth/token";
import { storeTokens } from "auth/client/token";

import { API_VERSION } from "database/config";

import { noloRequest } from "utils/noloRequest";
import { formatISO, addDays } from "date-fns";
import { initSyncSetting, selectCurrentServer } from "setting/settingSlice";

import { parseToken } from "./token";
import { AuthState, User } from "./types";
import { loginRequest } from "./client/loginRequest";
import { SignupData } from "./types";
const initialState: AuthState = {
  currentUser: null,
  users: [],
  isLoggedIn: false,
  currentToken: null,
  isLoading: false,
};
const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});
export const authSlice = createSliceWithThunks({
  name: "auth",
  initialState,
  reducers: (create) => ({
    signIn: create.asyncThunk(
      async (input, thunkAPI) => {
        const state = thunkAPI.getState();

        try {
          const { username, encryptionKey, locale } = input;
          const { publicKey, secretKey } = generateKeyPairFromSeed(
            username + encryptionKey + locale,
          );
          const userId = generateUserId(publicKey, username, locale);
          const token = signToken({ userId, publicKey, username }, secretKey);
          const currentServer = selectCurrentServer(state);
          const res = await loginRequest(currentServer, { userId, token });
          if (res.status === 200) {
            storeTokens(res.token);
            return res;
          } else {
            throw res;
          }
        } catch (error) {
          return thunkAPI.rejectWithValue(error); // 使用rejectWithValue返回错误信息
        }
      },
      {
        pending: (state) => {
          state.isLoading = true;
        },
        rejected: (state, error) => {
          state.isLoading = false;
        },
        fulfilled: (state, action) => {
          const { payload } = action;
          state.isLoggedIn = true;
          const token = payload.token;
          state.currentToken = token;
          const user = parseToken(payload.token);
          state.currentUser = user;
          state.isLoggedIn = true;
          state.users = [user, ...state.users];
          state.isLoading = false;
        },
      },
    ),
    signUp: create.asyncThunk(
      async (user, thunkAPI) => {
        const { username, password: brainPassword, answer, locale } = user;
        // Generate encryption key
        const encryptionKey = await hashPassword(brainPassword);

        // Generate public and private key pair based on the encryption key
        const { publicKey, secretKey } = generateKeyPairFromSeed(
          username + encryptionKey + locale,
        );

        const sendData: SignupData = {
          username,
          publicKey,
          encryptedEncryptionKey: null,
          remoteRecoveryPassword: null,
          locale,
        };
        console.log("sendData", sendData);
        console.log("sendData", sendData);

        // if (isStoreRecovery) {
        //   const recoveryPassword = generateAndSplitRecoveryPassword(answer, 3);
        //   const [localRecoveryPassword, remoteRecoveryPassword] =
        //     recoveryPassword;

        //   sendData.remoteRecoveryPassword = remoteRecoveryPassword;
        //   sendData.encryptedEncryptionKey = encryptWithPassword(
        //     encryptionKey,
        //     recoveryPassword.join(""),
        //   );
        // }

        const nolotusPubKey = "pqjbGua2Rp-wkh3Vip1EBV6p4ggZWtWvGyNC37kKPus";
        const state = thunkAPI.getState();
        const res = await noloRequest(state, {
          url: `${API_VERSION}/users/signup`,
          body: JSON.stringify(sendData),
          method: "POST",
        });

        const { encryptedData } = await res.json();
        console.log("encryptedData:", encryptedData);

        const decryptedData = await verifySignedMessage(
          encryptedData,
          nolotusPubKey,
        );

        const remoteData = JSON.parse(decryptedData);
        console.log("remoteData:", remoteData);
        const localUserId = generateUserId(publicKey, username, locale);
        console.log("userId", localUserId);
        if (
          remoteData.username === sendData.username &&
          remoteData.publicKey === sendData.publicKey &&
          remoteData.userId === localUserId
        ) {
          const now = new Date();
          // 计算7天后的时间
          const expirationDate = addDays(now, 7);
          const iat = formatISO(now); // 签发时间
          const nbf = formatISO(now); // 生效时间
          const exp = formatISO(expirationDate); // 过期时间
          const token = signToken(
            { userId: localUserId, username, exp, iat, nbf },
            secretKey,
          );
          const user = parseToken(token);
          const result = { user, token };
          return result;
        } else {
          throw new Error("Server data does not match local data.");
        }
      },
      {
        fulfilled: (state, action) => {
          const { user, token } = action.payload;
          state.currentUser = user;
          state.isLoggedIn = true;
          state.users = [user, ...state.users];
          state.currentToken = token;
        },
      },
    ),
    changeCurrentUser: (
      state,
      action: PayloadAction<{ user: User; token: string }>,
    ) => {
      (state.currentUser = action.payload.user),
        (state.currentToken = action.payload.token);
    },
    initAuth: create.asyncThunk(
      async (tokens, thunkAPI) => {
        const { dispatch } = thunkAPI;
        const parsedUsers = tokens.map((token) => parseToken(token));
        const exists = parsedUsers.length > 0;
        if (exists) {
          dispatch(
            restoreSession({
              user: parsedUsers[0],
              users: parsedUsers,
              token: tokens[0],
            }),
          );
          await dispatch(initSyncSetting());
        }
      },
      {
        fulfilled: () => {},
      },
    ),
    restoreSession: (
      state,
      action: PayloadAction<{ user: User; users: User[]; token: string }>,
    ) => {
      state.isLoggedIn = true;
      state.currentUser = action.payload.user;
      state.users = action.payload.users;
      state.currentToken = action.payload.token;
    },
    signOut: create.reducer((state) => {
      const updatedUsers = state.users.filter(
        (user) => user !== state.currentUser,
      );
      const nextUser = updatedUsers.length > 0 ? updatedUsers[0] : null;
      state.isLoggedIn = false;
      state.currentUser = nextUser;
      state.users = updatedUsers;
      state.currentToken = null;
    }),
  }),
});

export const {
  changeCurrentUser,
  initAuth,
  restoreSession,
  signIn,
  signUp,
  signOut,
} = authSlice.actions;

export default authSlice.reducer;
export const selectCurrentUser = (state: NoloRootState) =>
  state.auth.currentUser;
export const selectCurrentUserId = (state: NoloRootState) =>
  state.auth.currentUser.userId;
export const selectIsLoggedIn = (state: NoloRootState) => state.auth.isLoggedIn;
