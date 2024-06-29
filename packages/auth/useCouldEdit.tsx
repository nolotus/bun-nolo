import { useAppSelector } from "app/hooks";
import { extractUserId } from "core/prefix";
import { selectCurrentUserId } from "./authSlice";

export const useCouldEdit = (id: string) => {
  const dataUserId = extractUserId(id);
  const currentCurrentUserId = useAppSelector(selectCurrentUserId);
  return dataUserId === currentCurrentUserId;
};
