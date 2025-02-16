// database/utils/getUserDataOnce.ts
import { DataType } from "create/types";
import { fetchUserData } from "../browser/fetchUserData";

interface BaseItem {
  id: string;
  type: DataType;
  updatedAt?: string | number;
  created?: string | number;
  userId: string;
  [key: string]: any;
}

interface GetUserDataOptions {
  types: DataType | DataType[];
  userId: string;
  limit: number;
  isLoggedIn?: boolean;
  currentUserId?: string;
}

export async function getUserDataOnce({
  types,
  userId,
  isLoggedIn = false,
  currentUserId,
}: GetUserDataOptions): Promise<{
  data: BaseItem[];
  error?: Error;
}> {
  try {
    const typeArray = Array.isArray(types) ? types : [types];

    // 确定有效的用户ID
    const effectiveUserId =
      userId === "local" && isLoggedIn && currentUserId
        ? currentUserId
        : userId;

    // 获取本地数据
    const localResults = await fetchUserData(typeArray, effectiveUserId);
    const localData = Object.values(localResults).flat();

    return { data: localData };
  } catch (err) {
    const error =
      err instanceof Error ? err : new Error("Unknown error occurred");
    return {
      data: [],
      error,
    };
  }
}
