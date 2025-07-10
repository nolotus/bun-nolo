// 文件路径: auth/authSlice.ts

import { buildCreateSlice, asyncThunkCreator } from "@reduxjs/toolkit";
import { AppThunkApi, RootState } from "app/store";
import { selectCurrentServer } from "app/settings/settingSlice";
import { loadDefaultSpace } from "create/space/spaceSlice";
import { generateUserIdV1 } from "core/generateMainKey";
import { generateKeyPairFromSeedV1 } from "core/generateKeyPairFromSeedV1";
import { hashPasswordV1 } from "core/password";
import { signUpAction } from "./action/signUpAction";
import { loginRequest } from "./client/loginRequest";
import { parseToken, signToken } from "./token";
import type { User } from "./types";

interface AuthState {
  currentUser: User | null;
  users: User[];
  isLoggedIn: boolean;
  currentToken: string | null;
  isLoading: boolean;
}

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
        const { tokenManager } = thunkAPI.extra;
        const state: RootState = thunkAPI.getState();
        try {
          const { username, locale, password } = input;
          const encryptionKey = await hashPasswordV1(password);
          const { publicKey, secretKey } = generateKeyPairFromSeedV1(
            username + encryptionKey + locale
          );
          const userId = generateUserIdV1(publicKey, username, locale);
          const token = signToken({ userId, publicKey, username }, secretKey);
          const currentServer = selectCurrentServer(state);
          const res = await loginRequest(currentServer, { userId, token });

          if (res.status !== 200) {
            const errorMessage = `服务器响应状态码：${res.status}`;
            return thunkAPI.rejectWithValue(errorMessage);
          }

          const result = await res.json();
          await tokenManager!.storeToken(result.token);
          return { token: result.token };
        } catch (error) {
          return thunkAPI.rejectWithValue(error);
        }
      },
      {
        pending: (state) => {
          state.isLoading = true;
        },
        rejected: (state) => {
          state.isLoading = false;
        },
        fulfilled: (state, action) => {
          const { token } = action.payload;
          const user = parseToken(token);
          state.currentUser = user;
          state.currentToken = token;
          state.isLoggedIn = true;
          state.users.unshift(user);
          state.isLoading = false;
        },
      }
    ),

    signUp: create.asyncThunk(signUpAction, {
      fulfilled: (state, action) => {
        const { user, token } = action.payload;
        state.currentUser = user;
        state.isLoggedIn = true;
        state.users.unshift(user);
        state.currentToken = token;
      },
    }),

    inviteSignUp: create.asyncThunk(() => {
      console.log("inviteSignUp - 该功能暂未实现");
    }, {}),

    initializeAuth: create.asyncThunk(
      async (_, thunkAPI) => {
        const { tokenManager } = thunkAPI.extra;
        const tokens = await tokenManager!.initTokens();
        if (tokens && tokens.length > 0) {
          const user = parseToken(tokens[0]);
          return { tokens, user };
        }
        return { tokens: [], user: null };
      },
      {
        fulfilled: (state, action) => {
          const { tokens, user } = action.payload;
          if (user) {
            state.currentUser = user;
            state.isLoggedIn = true;
          }
          if (tokens && tokens.length > 0) {
            state.currentToken = tokens[0];
            state.users = tokens.map(parseToken);
          }
        },
      }
    ),

    signOut: create.asyncThunk(
      async (_, thunkAPI) => {
        const { tokenManager } = thunkAPI.extra;
        const state: RootState = thunkAPI.getState();
        const token = selectCurrentToken(state);
        if (token) {
          await tokenManager!.removeToken(token);
        }
        const remainingTokens = await tokenManager!.getTokens();
        return { tokens: remainingTokens };
      },
      {
        fulfilled: (state, action) => {
          const { tokens } = action.payload;
          const otherUsers = state.users.filter(
            (user) => user.userId !== state.currentUser?.userId
          );

          if (otherUsers.length > 0) {
            const nextUser = otherUsers[0];
            const nextToken =
              tokens.find((t) => parseToken(t).userId === nextUser.userId) ||
              null;
            state.currentUser = nextUser;
            state.users = otherUsers;
            state.currentToken = nextToken;
          } else {
            state.isLoggedIn = false;
            state.currentUser = null;
            state.users = [];
            state.currentToken = null;
          }
        },
      }
    ),

    changeUser: create.asyncThunk(
      async (user: User, thunkAPI) => {
        const { tokenManager } = thunkAPI.extra;
        const { dispatch } = thunkAPI;
        try {
          await dispatch(loadDefaultSpace(user.userId)).unwrap();
        } catch (error) {
          console.warn("Failed to initialize user settings:", error);
        }

        const tokens = await tokenManager!.getTokens();
        const updatedToken = tokens.find(
          (t) => parseToken(t).userId === user.userId
        );

        if (!updatedToken) {
          return thunkAPI.rejectWithValue("Token not found for user");
        }

        await tokenManager!.removeToken(updatedToken);
        await tokenManager!.storeToken(updatedToken);

        return { user, token: updatedToken };
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
  signIn,
  signUp,
  inviteSignUp,
  signOut,
  changeUser,
  initializeAuth,
} = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: RootState) => state.auth.currentUser;
export const selectUsers = (state: RootState) => state.auth.users;
export const selectUserId = (state: RootState) =>
  state.auth.currentUser?.userId;
export const selectIsLoggedIn = (state: RootState) => state.auth.isLoggedIn;
export const selectCurrentToken = (state: RootState) => state.auth.currentToken;
