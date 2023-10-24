import React, {
  createContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";

import { handleLogin } from "./client/login";
import {
  removeToken,
  storeTokens,
  retrieveFirstToken,
  getTokensFromLocalStorage,
} from "auth/client/token";
import { parseToken } from "auth/token";

export const UserContext = createContext();

interface User {
  userId: number;
  username: string;
  email?: string;
}
export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const isLogin = !!currentUser;

  const updateCurrentUser = useCallback((user) => {
    setCurrentUser(user);
    const tokens = getTokensFromLocalStorage();
    const updatedToken = tokens.find(
      (t) => parseToken(t).userId === user.userId
    );

    if (updatedToken) {
      const newTokens = [
        updatedToken,
        ...tokens.filter((t) => t !== updatedToken),
      ];
      window.localStorage.setItem("tokens", JSON.stringify(newTokens)); // 将新的 tokens 保存到 localStorage
    }
  }, []);

  useEffect(() => {
    // 尝试从存储中获取token
    const tokens = getTokensFromLocalStorage();
    if (tokens) {
      const parsedUsers = tokens.map((token) => parseToken(token));

      // 设置第一个用户为当前用户
      parsedUsers.length > 0 && setCurrentUser(parsedUsers[0]);
      // 更新用户列表
      setUsers(parsedUsers);
    }
  }, []);

  const login = useCallback(async (input) => {
    const newToken = await handleLogin(input);
    storeTokens(newToken);
    const result = parseToken(newToken);
    setCurrentUser(result);
    setUsers((prevUsers) => (prevUsers ? [...prevUsers, result] : [result])); // 更新用户列表
  }, []);

  const signup = useCallback((token) => {
    storeTokens(token);
    const result = parseToken(token);
    setCurrentUser(result);
    // navigate("/welcome");
  }, []);

  const logout = useCallback(() => {
    const token = retrieveFirstToken();
    removeToken(token);
    setUsers((prevUsers) => {
      if (prevUsers) {
        return prevUsers.filter((user) => user !== currentUser);
      } else {
        return [];
      }
    });
    const nextUser = users.find((u) => u !== currentUser);
    setCurrentUser(nextUser ? nextUser : null);
    // navigate("/");
  }, [currentUser, users]);

  const contextValue = useMemo(
    () => ({
      currentUser,
      isLogin,
      signup,
      login,
      logout,
      users,
      updateCurrentUser,
    }),
    [currentUser, users, isLogin, signup, login, logout, updateCurrentUser]
  );
  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
