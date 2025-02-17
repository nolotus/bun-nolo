import { PayloadAction } from "@reduxjs/toolkit";
import { NoloRootState } from "app/store";
import { buildCreateSlice, asyncThunkCreator } from "@reduxjs/toolkit";
import { generateUserIdV1 } from "core/generateMainKey";
import { signToken } from "auth/token";
import { selectCurrentServer } from "setting/settingSlice";
import { generateKeyPairFromSeedV1 } from "core/generateKeyPairFromSeedV1";
import { parseToken } from "./token";
import { User } from "./types";
import { loginRequest } from "./client/loginRequest";
import { tokenManager } from "./tokenManager";
import { signUpAction } from "./action/signUpAction";
import { hashPasswordV1 } from "core/password";

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
          const { username, locale, password } = input;
          const encryptionKey = await hashPasswordV1(password);

          let userId;
          let token;
          const { publicKey, secretKey } = generateKeyPairFromSeedV1(
            username + encryptionKey + locale
          );
          userId = generateUserIdV1(publicKey, username, locale);
          token = signToken({ userId, publicKey, username }, secretKey);
          const currentServer = selectCurrentServer(state);
          const res = await loginRequest(currentServer, {
            userId,
            token,
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
    signUp: create.asyncThunk(signUpAction, {
      fulfilled: (state, action) => {
        const { user, token } = action.payload;
        state.currentUser = user;
        state.isLoggedIn = true;
        state.users = [user, ...state.users];
        state.currentToken = token;
      },
    }),
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
            const users = tokens.map(parseToken);
            console.log("users", users);
            state.users = users;
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
