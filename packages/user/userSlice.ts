import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  userId: number;
  username: string;
  email?: string;
}

interface UserState {
  currentUser: User | null;
  users: User[];
  isLoggedIn: boolean;
}

const initialState: UserState = {
  currentUser: null,
  users: [],
  isLoggedIn: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    changeCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
    },

    userLogin: (state, action: PayloadAction<User>) => {
      state.isLoggedIn = true;
      state.currentUser = action.payload;
      state.users = [action.payload, ...state.users];
    },
    logoutCurrentUser: (state) => {
      const updatedUsers = state.users.filter(
        (user) => user !== state.currentUser
      );
      const nextUser = updatedUsers.length > 0 ? updatedUsers[0] : null;
      state.isLoggedIn = nextUser ? true : false;
      state.currentUser = nextUser;
      state.users = updatedUsers;
    },
    userRegister: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.isLoggedIn = true;
      state.users = [action.payload, ...state.users];
    },
    restoreSession: (
      state,
      action: PayloadAction<{ user: User; users: User[] }>
    ) => {
      state.isLoggedIn = true;
      state.currentUser = action.payload.user;
      state.users = action.payload.users;
    },
    userLogout: (state) => {
      const updatedUsers = state.users.filter(
        (user) => user !== state.currentUser
      );
      const nextUser = updatedUsers.length > 0 ? updatedUsers[0] : null;
      state.isLoggedIn = false;
      state.currentUser = nextUser;
      state.users = updatedUsers;
    },
  },
});

export const {
  changeCurrentUser,
  userLogin,
  logoutCurrentUser,
  userRegister,
  restoreSession,
  userLogout,
} = userSlice.actions;

export default userSlice.reducer;
