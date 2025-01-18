import { PayloadAction } from "@reduxjs/toolkit";
import { NoloRootState } from "app/store";
import { buildCreateSlice, asyncThunkCreator } from "@reduxjs/toolkit";
import { generateUserIdV0, generateUserIdV1 } from "core/generateMainKey";
import { verifySignedMessage } from "core/crypto";
import { signToken } from "auth/token";
import { API_VERSION } from "database/config";
import { noloRequest } from "database/requests/noloRequest";
import { formatISO, addDays } from "date-fns";
import { selectCurrentServer } from "setting/settingSlice";
import { generateKeyPairFromSeedV0 } from "core/generateKeyPairFromSeedV0";
import { generateKeyPairFromSeedV1 } from "core/crypto";
import { parseToken } from "./token";
import { User } from "./types";
import { loginRequest } from "./client/loginRequest";
import { tokenManager } from "./tokenManager";

interface AuthState {
  currentUser: User;
  users: User[];
  isLoggedIn: boolean;
  currentToken: string | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  currentUser: { userId: "local" },
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
          //todo  change to auto version check
          const { username, encryptionKey, locale, version = "v1" } = input;

          let userId;
          let token;
          if (version === "v0") {
            const { publicKey, secretKey } = generateKeyPairFromSeedV0(
              username + encryptionKey + locale
            );
            userId = generateUserIdV0(publicKey, username, locale);
            token = signToken({ userId, publicKey, username }, secretKey);
          } else if (version === "v1") {
            const { publicKey, secretKey } = generateKeyPairFromSeedV1(
              username + encryptionKey + locale
            );
            userId = generateUserIdV1(publicKey, username, locale);
            token = signToken({ userId, publicKey, username }, secretKey);
          }
          const currentServer = selectCurrentServer(state);
          const res = await loginRequest(currentServer, {
            userId,
            token,
            version,
          });
          if (res.status === 200) {
            const result = await res.json();
            return { token: result.token };
          }
          return { status: res.status };
        } catch (error) {
          return thunkAPI.rejectWithValue(error);
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
      }
    ),
    signUp: create.asyncThunk(
      async (user, thunkAPI) => {
        const { username, locale, encryptionKey, email } = user;
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

        const res = await noloRequest(state, {
          url: `${API_VERSION}/users/signup`,
          body: JSON.stringify(sendData),
          method: "POST",
        });

        const { encryptedData } = await res.json();
        console.log("encryptedData", encryptedData);
        const decryptedData = await verifySignedMessage(
          encryptedData,
          nolotusPubKey
        );

        const remoteData = JSON.parse(decryptedData);
        const localUserId = generateUserIdV1(publicKey, username, locale);
        const isPublicKeyRight = remoteData.publicKey === publicKey;
        const isUsernameRight = remoteData.username === username;

        const isUserIdRight = remoteData.userId === localUserId;

        const isRemoteRight =
          isPublicKeyRight && isUsernameRight && isUserIdRight;

        if (isRemoteRight) {
          const now = new Date();
          // 计算7天后的时间
          const expirationDate = addDays(now, 7);
          const iat = formatISO(now); // 签发时间
          const nbf = formatISO(now); // 生效时间
          const exp = formatISO(expirationDate); // 过期时间
          const token = signToken(
            { userId: localUserId, username, exp, iat, nbf },
            secretKey
          );

          const user = parseToken(token);
          console.log("user", user);
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
      }
    ),
    inviteSignUp: create.asyncThunk(() => {
      console.log("inviteSignUp");
    }, {}),

    initializeAuth: create.asyncThunk(
      async (_, thunkAPI) => {
        const tokens = await tokenManager.initTokens();
        return { tokens };
      },
      {
        fulfilled: (state, action) => {
          const { tokens } = action.payload;
          if (tokens.length > 0) {
            const user = parseToken(tokens[0]);
            state.currentUser = user;
            state.currentToken = tokens[0];
            state.isLoggedIn = true;
            state.users = tokens.map(parseToken);
          }
        },
      }
    ),

    restoreSession: (
      state,
      action: PayloadAction<{ user: User; users: User[]; token: string }>
    ) => {
      state.isLoggedIn = true;
      state.currentUser = action.payload.user;
      state.users = action.payload.users;
      state.currentToken = action.payload.token;
    },
    signOut: create.asyncThunk(
      async (_, thunkAPI) => {
        const state = thunkAPI.getState().auth;

        if (state.currentToken) {
          await tokenManager.removeToken(state.currentToken);
        }

        const otherUsers = state.users.filter(
          (user) => user.userId !== state.currentUser.userId
        );

        if (otherUsers.length > 0) {
          const tokens = await tokenManager.getTokens();
          return {
            otherUsers,
            nextToken: tokens[0] || null,
          };
        }

        return { otherUsers: [] };
      },
      {
        fulfilled: (state, action) => {
          const { otherUsers, nextToken } = action.payload;

          if (otherUsers.length > 0) {
            state.currentUser = otherUsers[0];
            state.users = otherUsers;
            state.currentToken = nextToken;
          } else {
            state.isLoggedIn = false;
            state.currentUser = { userId: "local" };
            state.users = [];
            state.currentToken = null;
          }
        },
      }
    ),
    changeUser: create.asyncThunk(
      async (user: User, thunkAPI) => {
        const tokens = await tokenManager.getTokens();
        const updatedToken = tokens.find(
          (t) => parseToken(t).userId === user.userId
        );

        if (!updatedToken) {
          return thunkAPI.rejectWithValue("Token not found for user");
        }

        // 更新 token 顺序
        await tokenManager.removeToken(updatedToken);
        await tokenManager.storeToken(updatedToken);

        return {
          user,
          token: updatedToken,
        };
      },
      {
        fulfilled: (state, action) => {
          const { user, token } = action.payload;
          state.currentUser = user;
          state.currentToken = token;
        },
      }
    ),
  }),
});

export const {
  restoreSession,
  signIn,
  signUp,
  inviteSignUp,
  signOut,
  changeUser,
  initializeAuth,
} = authSlice.actions;

export default authSlice.reducer;
export const selectCurrentUser = (state: NoloRootState) =>
  state.auth.currentUser;

export const selectUsers = (state: NoloRootState) => state.auth.users;

export const selectCurrentUserId = (state: NoloRootState) =>
  state.auth.currentUser?.userId || "local";

export const selectIsLoggedIn = (state: NoloRootState) => state.auth.isLoggedIn;

export const selectCurrentToken = (state: NoloRootState) =>
  state.auth.currentToken;
