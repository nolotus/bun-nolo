import { useCallback } from "react";
import { API_ENDPOINTS } from "database/config";
import { useAppSelector } from "app/hooks";
import { selectCurrentServer } from "setting/settingSlice";
import { selectCurrentToken } from "auth/authSlice";
import pino from "pino";

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

      const url = new URL(`${serverUrl}${API_ENDPOINTS.USERS}`);
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
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
        logger.error({ err }, "Failed to fetch users");
        throw err;
      }
    },
    [serverUrl, token]
  );
}
