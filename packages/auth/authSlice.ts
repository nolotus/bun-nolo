import { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "app/store";
import { buildCreateSlice, asyncThunkCreator } from "@reduxjs/toolkit";
import { generateUserIdV1 } from "core/generateMainKey";
import { signToken } from "auth/token";
import { selectCurrentServer } from "app/settings/settingSlice";
import { generateKeyPairFromSeedV1 } from "core/generateKeyPairFromSeedV1";
import { parseToken } from "./token";
import { User } from "./types";
import { loginRequest } from "./client/loginRequest";
import { signUpAction } from "./action/signUpAction";
import { hashPasswordV1 } from "core/password";
import { loadDefaultSpace } from "create/space/spaceSlice";

// 优化初始状态和类型定义
interface AuthState {
  tokenManager?: any;
  currentUser: User | null;
  users: User[];
  isLoggedIn: boolean;
  currentToken: string | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  tokenManager: undefined,
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
        const state: RootState = thunkAPI.getState();
        const tokenManager = state.auth.tokenManager;
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
          console.log("res", res);
          if (res.status !== 200) {
            const errorMessage = `服务器响应状态码：${res.status}`;
            return thunkAPI.rejectWithValue(errorMessage);
          }
          const result = await res.json();
          tokenManager.storeToken(result.token);
          return { token: result.token };
        } catch (error) {
          return thunkAPI.rejectWithValue(error);
        }
      },
      {
        pending: (state) => {
          state.isLoading = true;
        },
        rejected: (state, action) => {
          state.isLoading = false;
        },
        fulfilled: (state, action) => {
          const { token } = action.payload;
          const user = parseToken(token);
          state.currentUser = user;
          state.currentToken = token;
          state.isLoggedIn = true;
          // 使用 Immer 内置方法直接在原数组头部插入
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
      async (tokenManager, thunkAPI) => {
        const tokens = await tokenManager.initTokens();
        if (tokens) {
          const user = parseToken(tokens[0]);
          return { tokens, user, tokenManager };
        }
      },
      {
        fulfilled: (state, action) => {
          const { tokens, user, tokenManager } = action.payload;
          state.tokenManager = tokenManager;
          if (user) {
            state.currentUser = user;
            state.isLoggedIn = true;
          }
          if (tokens) {
            state.currentToken = tokens[0];
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
        const state: RootState = thunkAPI.getState();
        const tokenManager = state.auth.tokenManager;
        const tokens = await tokenManager.getTokens();
        const token = selectCurrentToken(state);
        if (token) {
          await tokenManager.removeToken(token);
        }
        return { tokens };
      },
      {
        fulfilled: (state, action) => {
          const { tokens } = action.payload;
          const otherUsers = state.users.filter(
            (user) => user.userId !== state.currentUser?.userId
          );
          if (otherUsers.length > 0) {
            state.currentUser = otherUsers[0];
            state.users = otherUsers;
            state.currentToken = tokens[0] || null;
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
        const dispatch = thunkAPI.dispatch;
        const state: RootState = thunkAPI.getState();
        const tokenManager = state.auth.tokenManager;

        // 尝试初始化新用户的 space，如果出错也不阻断流程
        try {
          await dispatch(loadDefaultSpace(user.userId)).unwrap();
        } catch (error) {
          console.warn("Failed to initialize user settings:", error);
        }

        const tokens = await tokenManager.getTokens();
        const updatedToken = tokens.find(
          (t) => parseToken(t).userId === user.userId
        );

        if (!updatedToken) {
          return thunkAPI.rejectWithValue("Token not found for user");
        }

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

// 选择器
export const selectCurrentUser = (state: RootState) => state.auth.currentUser;
export const selectUsers = (state: RootState) => state.auth.users;
export const selectUserId = (state: RootState) =>
  state.auth.currentUser?.userId;
export const selectIsLoggedIn = (state: RootState) => state.auth.isLoggedIn;
export const selectCurrentToken = (state: RootState) => state.auth.currentToken;
