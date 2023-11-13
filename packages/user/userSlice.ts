import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from 'app/store';
export interface User {
  userId: string;
  username: string;
  email?: string;
}

interface UserState {
  currentUser: User | null;
  users: User[];
  isLoggedIn: boolean;
  currentToken: string | null;
}

const initialState: UserState = {
  currentUser: null,
  users: [],
  isLoggedIn: false,
  currentToken: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    changeCurrentUser: (
      state,
      action: PayloadAction<{ user: User, token: string }>,
    ) => {
      (state.currentUser = action.payload.user),
        (state.currentToken = action.payload.token);
    },

    userLogin: (
      state,
      action: PayloadAction<{ user: User, token: string }>,
    ) => {
      state.isLoggedIn = true;
      state.currentUser = action.payload.user;
      state.users = [action.payload.user, ...state.users];
      state.currentToken = action.payload.token;
    },

    userRegister: (
      state,
      action: PayloadAction<{ user: User, token: string }>,
    ) => {
      state.currentUser = action.payload.user;
      state.isLoggedIn = true;
      state.users = [action.payload.user, ...state.users];
      state.currentToken = action.payload.token;
    },
    restoreSession: (
      state,
      action: PayloadAction<{ user: User, users: User[], token: string }>,
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
});

export const {
  changeCurrentUser,
  userLogin,
  userRegister,
  restoreSession,
  userLogout,
} = userSlice.actions;

export default userSlice.reducer;
export const selectCurrentUser = (state: RootState) => state.user.currentUser;
