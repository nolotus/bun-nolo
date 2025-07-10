import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
// 从 auth/authSlice.ts 导入的是一个 slice 对象
import authReducer from "auth/authSlice";
import dbReducer from "database/dbSlice";

// 假设这是你的依赖项的类型，请根据你的实际情况进行调整
// 例如，你可以为 tokenManager 创建一个更具体的接口
export interface TokenManager {
  initTokens(): Promise<string[]>;
  storeToken(token: string): Promise<void>;
  getTokens(): Promise<string[]>;
  removeToken(token: string): Promise<void>;
}

export interface StoreDependencies {
  dbInstance: any; // 例如: PouchDB.Database or other db instance
  tokenManager: TokenManager; // 使用更具体的类型
}

// 1. 【核心修改】创建 store 的工厂函数
export const createAppStore = (dependencies: StoreDependencies) => {
  return configureStore({
    reducer: {
      // 【关键补充】将 authSlice 的 reducer 添加到 store 中
      // 这样 Redux 才知道如何处理 auth 相关的 state 和 actions
      auth: authReducer,
      db: dbReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        // 2. 【核心修改】将依赖注入到 thunk 中
        thunk: {
          extraArgument: dependencies,
        },
        // 序列化检查对于 Redux Persist 是必要的
        serializableCheck: {
          ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        },
      }),
    // 建议在生产环境中关闭 devTools
    devTools: process.env.NODE_ENV !== "production",
  });
};

// 3. 【核心修改】更新类型定义以适应动态创建的 store
// 我们通过 createAppStore 的返回值来推断 store 的类型
type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore["getState"]>;
// AppDispatch 类型现在包含了 thunk 的正确类型
export type AppDispatch = AppStore["dispatch"];

// 定义带有额外参数的 Thunk 类型
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  StoreDependencies, // <- 额外参数的类型
  Action<string>
>;

// 4. 更新导出的 hooks，供整个应用使用
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
