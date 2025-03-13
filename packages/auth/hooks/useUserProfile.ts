// hooks/useUserProfile.ts
import { useCallback } from "react";
import { useAppSelector } from "app/hooks";
import { selectCurrentServer } from "setting/settingSlice";
import { selectCurrentToken } from "auth/authSlice";
import pino from "pino";
import { authRoutes } from "auth/routes";

const logger = pino({ name: "useUserProfile" });

interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  createdAt: string;
}

interface ProfileError {
  message: string;
  statusCode?: number;
}

export function useUserProfile() {
  const serverUrl = useAppSelector(selectCurrentServer);
  const token = useAppSelector(selectCurrentToken);

  return useCallback(
    async (userId: string): Promise<User | null> => {
      if (!serverUrl || !token) {
        const error: ProfileError = {
          message: "身份验证失败：请重新登录",
        };
        logger.error("No server URL or token available");
        throw error;
      }
      const path = authRoutes.users.detail.createPath({ userId });
      const url = `${serverUrl}${path}`;

      logger.debug(
        {
          requestUrl: url,
          userId,
        },
        "Fetching user profile"
      );

      try {
        const response = await fetch(url, {
          method: authRoutes.users.detail.method,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 404) {
          logger.info({ userId }, "User not found");
          return null;
        }

        if (!response.ok) {
          const error: ProfileError = {
            message: `请求失败: ${response.statusText}`,
            statusCode: response.status,
          };
          throw error;
        }

        const data = await response.json();

        return data;
      } catch (err) {
        // 如果是我们自定义的错误，直接抛出
        if ((err as ProfileError).message) {
          throw err;
        }

        logger.error({ err, userId }, "Failed to fetch user profile");

        // 未知错误统一包装
        const error: ProfileError = {
          message: "获取用户信息失败，请稍后重试",
        };
        throw error;
      }
    },
    [serverUrl, token]
  );
}
