import { useAppSelector } from "app/hooks";
import { extractUserId } from "core/prefix";
import { selectCurrentUserId } from "../authSlice";

export const useCouldEdit = (id?: string) => {
  // 如果 id 不存在或为空字符串，直接返回 false
  if (!id) {
    return false;
  }

  const dataUserId = extractUserId(id);
  const currentUserId = useAppSelector(selectCurrentUserId);

  // 如果无法提取用户 ID 或当前用户 ID 不存在，返回 false
  if (!dataUserId || !currentUserId) {
    return false;
  }

  return dataUserId === currentUserId;
};
