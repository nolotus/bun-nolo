import React, { createContext, useEffect, useReducer } from "react";

import { handleLogin } from "./client/login";
import {
  removeToken,
  storeTokens,
  retrieveFirstToken,
  getTokensFromLocalStorage,
} from "auth/client/token";
import { parseToken } from "auth/token";
import { initialState, userReducer, User, State, UserAction } from "./reducer";

export const UserContext = createContext(null);

export const UserProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer<React.Reducer<State, UserAction>>(
    userReducer,
    initialState
  );

  const changeCurrentUser = (user: User): void => {
    dispatch({
      type: "CHANGE_CURRENT_USER",
      payload: { user },
    });
    const tokens = getTokensFromLocalStorage();
    const updatedToken = tokens.find(
      (t) => parseToken(t).userId === user.userId
    );

    if (updatedToken) {
      const newTokens = [
        updatedToken,
        ...tokens.filter((t) => t !== updatedToken),
      ];
      window.localStorage.setItem("tokens", JSON.stringify(newTokens));
    }
  };

  useEffect(() => {
    // 尝试从存储中获取token
    const tokens = getTokensFromLocalStorage();
    if (tokens) {
      const parsedUsers = tokens.map((token) => parseToken(token));

      // 设置第一个用户为当前用户
      parsedUsers.length > 0 &&
        dispatch({
          type: "RESTORE_SESSION",
          payload: { user: parsedUsers[0], users: parsedUsers },
        });
      // 更新用户列表
    }
  }, []);

  const login = async (input): Promise<void> => {
    const newToken = await handleLogin(input);
    storeTokens(newToken);
    const user = parseToken(newToken);
    dispatch({
      type: "USER_LOGIN",
      payload: { user },
    });
  };

  const signup = (token: string) => {
    storeTokens(token);
    const user = parseToken(token);
    dispatch({
      type: "USER_REGISTER",
      payload: user,
    });
  };

  const logout = () => {
    const token = retrieveFirstToken();
    removeToken(token);
    dispatch({
      type: "LOGOUT_CURRENT_USER",
    });
  };

  const contextValue = {
    currentUser: state.currentUser,
    isLoggedIn: state.isLoggedIn,
    signup,
    login,
    logout,
    users: state.users,
    changeCurrentUser,
  };
  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
