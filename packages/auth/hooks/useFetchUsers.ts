// hooks/useFetchUsers.ts
import { useCallback } from "react";
import { useAppSelector } from "app/hooks";
import { selectCurrentServer } from "app/settings/settingSlice";
import { selectCurrentToken } from "auth/authSlice";
import pino from "pino";
import { authRoutes } from "auth/routes";

const logger = pino({ name: "useFetchUsers" });
const PAGE_SIZE = 10;

interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
}

interface FetchUsersResult {
  list: User[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

export function useFetchUsers() {
  const serverUrl = useAppSelector(selectCurrentServer);
  const token = useAppSelector(selectCurrentToken);

  return useCallback(
    async (page: number): Promise<FetchUsersResult | null> => {
      if (!serverUrl || !token) {
        logger.error("No server URL or token available");
        return null;
      }

      const path = authRoutes.users.list.createPath();
      const url = new URL(`${serverUrl}${path}`);
      url.searchParams.append("page", page.toString());
      url.searchParams.append("pageSize", PAGE_SIZE.toString());

      logger.debug(
        {
          requestUrl: url.toString(),
          page,
          pageSize: PAGE_SIZE,
        },
        "Fetching users"
      );

      try {
        const response = await fetch(url.toString(), {
          method: authRoutes.users.list.method,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorMessage = `HTTP error! status: ${response.status}`;
          logger.error(
            {
              status: response.status,
              error: errorMessage,
            },
            "Failed to fetch users"
          );
          throw new Error(errorMessage);
        }

        const data = await response.json();
        logger.info(
          {
            recordsReceived: data.list.length,
            total: data.total,
            page: data.currentPage,
            totalPages: data.totalPages,
          },
          "Users fetched successfully"
        );

        return data;
      } catch (err) {
        logger.error(
          {
            error: err instanceof Error ? err.message : String(err),
            page,
          },
          "Failed to fetch users"
        );
        throw err;
      }
    },
    [serverUrl, token]
  );
}
