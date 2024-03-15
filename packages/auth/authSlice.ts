import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "app/store";

import { authApi } from "./services";
import { parseToken } from "./token";

export interface User {
  userId: string;
  username: string;
  email?: string;
}

export interface AuthState {
  currentUser: User | null;
  users: User[];
  isLoggedIn: boolean;
  currentToken: string | null;
}

const initialState: AuthState = {
  currentUser: null,
  users: [],
  isLoggedIn: false,
  currentToken: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
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
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      authApi.endpoints.login.matchFulfilled,
      (state, { payload }) => {
        console.log("payload", payload);
        const user = parseToken(payload.token);
        state.currentUser = user;
        state.currentToken = payload.token;
        state.isLoggedIn = true;
        state.users = [user, ...state.users];
      },
    );
  },
});

export const { changeCurrentUser, userRegister, restoreSession, userLogout } =
  authSlice.actions;

export default authSlice.reducer;
export const selectCurrentUser = (state: RootState) => state.auth.currentUser;
