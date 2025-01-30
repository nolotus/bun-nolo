// ai/cybot/hooks/useDeleteCybot.ts

import { useAppDispatch } from "app/hooks";
import { remove } from "database/dbSlice";
import { useAuth } from "auth/hooks/useAuth";
import { createCybotKey } from "database/keys";
import toast from "react-hot-toast";
import { pino } from "pino";

const logger = pino({ name: "useDeleteCybot" });

export const useDeleteCybot = () => {
  const dispatch = useAppDispatch();
  const auth = useAuth();

  const deleteCybot = async (cybotId: string, isPublic: boolean) => {
    if (!auth.user?.userId) {
      logger.warn("No user found when attempting to delete cybot");
      return;
    }

    try {
      // 删除私有版本
      const userCybotPath = createCybotKey.private(auth.user.userId, cybotId);
      await dispatch(remove(userCybotPath)).unwrap();

      // 如果是公开的,同时删除公开版本
      if (isPublic) {
        const publicCybotPath = createCybotKey.public(cybotId);
        await dispatch(remove(publicCybotPath)).unwrap();
      }

      toast.success("Cybot deleted successfully");
      logger.info({ cybotId }, "Cybot deleted successfully");
    } catch (error) {
      toast.error("Failed to delete Cybot");
      logger.error({ error, cybotId }, "Failed to delete Cybot");
    }
  };

  return {
    deleteCybot,
  };
};
