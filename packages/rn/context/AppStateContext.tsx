import React, { createContext, useContext, useState, ReactNode } from "react";

// 页面类型定义
export type PageType = "home" | "chat" | "article";

// 应用状态接口
interface AppState {
  currentPage: PageType;
  selectedSpace: string;
}

// 应用状态上下文接口
interface AppStateContextType {
  appState: AppState;
  setCurrentPage: (page: PageType) => void;
  setSelectedSpace: (space: string) => void;
  updateAppState: (newState: Partial<AppState>) => void;
}

// 创建上下文
const AppStateContext = createContext<AppStateContextType | undefined>(
  undefined
);

// 应用状态提供者组件
interface AppStateProviderProps {
  children: ReactNode;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({
  children,
}) => {
  const [appState, setAppState] = useState<AppState>({
    currentPage: "home",
    selectedSpace: "个人空间",
  });

  const setCurrentPage = (page: PageType) => {
    setAppState((prev) => ({ ...prev, currentPage: page }));
  };

  const setSelectedSpace = (space: string) => {
    setAppState((prev) => ({ ...prev, selectedSpace: space }));
  };

  const updateAppState = (newState: Partial<AppState>) => {
    setAppState((prev) => ({ ...prev, ...newState }));
  };

  const contextValue: AppStateContextType = {
    appState,
    setCurrentPage,
    setSelectedSpace,
    updateAppState,
  };

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  );
};

// 使用应用状态的Hook
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};
