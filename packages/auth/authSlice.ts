import { PayloadAction } from "@reduxjs/toolkit";
import { NoloRootState } from "app/store";
import { buildCreateSlice, asyncThunkCreator } from "@reduxjs/toolkit";
import { generateUserId } from "core/generateMainKey";
import { hashPassword } from "core/password";
import { generateKeyPairFromSeed } from "core/crypto";
import { signToken } from "auth/token";
import { storeTokens } from "auth/client/token";

import { parseToken } from "./token";
import { AuthState, User } from "./types";
import { loginRequest } from "./client/loginRequest";

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
        const { username, password, locale } = input;
        const encryptionKey = await hashPassword(password);
        const { publicKey, secretKey } = generateKeyPairFromSeed(
          username + encryptionKey + locale,
        );
        const userId = generateUserId(publicKey, username, locale);
        const token = signToken({ userId, publicKey, username }, secretKey);
        const state = thunkAPI.getState();
        const res = await loginRequest(state, { userId, token });
        // console.log("newToken", newToken);
        const result = await res.json();
        console.log("result", result);
        storeTokens(result.token);
        return result;
      },
      {
        pending: (state) => {
          state.isLoading = true;
        },
        rejected: (state, error) => {
          console.log("error", error);
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
    changeCurrentUser: (
      state,
      action: PayloadAction<{ user: User; token: string }>,
    ) => {
      (state.currentUser = action.payload.user),
        (state.currentToken = action.payload.token);
    },

    userRegister: (
      state,
      action: PayloadAction<{ user: User; token: string }>,
    ) => {
      state.currentUser = action.payload.user;
      state.isLoggedIn = true;
      state.users = [action.payload.user, ...state.users];
      state.currentToken = action.payload.token;
    },
    restoreSession: (
      state,
      action: PayloadAction<{ user: User; users: User[]; token: string }>,
    ) => {
      state.isLoggedIn = true;
      state.currentUser = action.payload.user;
      state.users = action.payload.users;
      state.currentToken = action.payload.token;
    },
    userLogout: (state) => {
      const updatedUsers = state.users.filter(
        (user) => user !== state.currentUser,
      );
      const nextUser = updatedUsers.length > 0 ? updatedUsers[0] : null;
      state.isLoggedIn = false;
      state.currentUser = nextUser;
      state.users = updatedUsers;
      state.currentToken = null;
    },
  }),
});

export const {
  changeCurrentUser,
  userRegister,
  restoreSession,
  userLogout,
  signIn,
} = authSlice.actions;

export default authSlice.reducer;
export const selectCurrentUser = (state: NoloRootState) =>
  state.auth.currentUser;
