// hooks/useFetchUsers.ts
import { useCallback } from "react";
import { useAppSelector } from "app/store";
import { selectCurrentServer } from "app/settings/settingSlice";
import { selectCurrentToken } from "auth/authSlice";
import { authRoutes } from "auth/routes";

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
    async (page: number, search?: string): Promise<FetchUsersResult | null> => {
      if (!serverUrl || !token) {
        return null;
      }

      const path = authRoutes.users.list.createPath();
      const url = new URL(`${serverUrl}${path}`);
      url.searchParams.append("page", page.toString());
      url.searchParams.append("pageSize", PAGE_SIZE.toString());
      if (search) {
        // 新增：如果有搜索关键字，添加到 URL 参数
        url.searchParams.append("search", search);
      }

      try {
        const response = await fetch(url.toString(), {
          method: authRoutes.users.list.method,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorMessage = `HTTP error! status: ${response.status}`;
          throw new Error(errorMessage);
        }

        const data = await response.json();

        return data;
      } catch (err) {
        throw err;
      }
    },
    [serverUrl, token]
  );
}
