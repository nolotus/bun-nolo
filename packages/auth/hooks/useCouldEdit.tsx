import { useAppSelector } from "app/hooks";
import { extractUserId } from "core/prefix";
import { selectCurrentUserId } from "../authSlice";
import { nolotusId } from "core/init";

export const useCouldEdit = (dbKey?: string) => {
  // 如果 id 不存在或为空字符串，直接返回 false
  if (!dbKey) {
    return false;
  }

  const dataUserId = extractUserId(dbKey);
  const currentUserId = useAppSelector(selectCurrentUserId);
  if (currentUserId === nolotusId) {
    return true;
  }
  // 如果无法提取用户 ID 或当前用户 ID 不存在，返回 false
  if (!dataUserId || !currentUserId) {
    return false;
  }

  return dataUserId === currentUserId;
};
