// create/space/action/initializeSpaceAction.ts

import { NoloRootState } from "app/store";
import { changeSpace } from "../spaceSlice";
import { fetchUserSpaceMemberships } from "../spaceSlice";

export const initializeSpaceAction = async (
  userId: string | undefined,
  thunkAPI
) => {
  const dispatch = thunkAPI.dispatch;
  const state = thunkAPI.getState() as NoloRootState;

  // 尝试按顺序从不同来源获取空间ID
  const getSpaceId = async (): Promise<string | null> => {
    // 1. 从用户设置中获取
    const memberships = await dispatch(
      fetchUserSpaceMemberships(userId)
    ).unwrap();
    try {
      const defaultSpaceId = state.settings.defaultSpaceId;
      if (defaultSpaceId) {
        return defaultSpaceId;
      }
      if (memberships && memberships.length > 0) {
        return memberships[0].spaceId;
      }
    } catch (error) {
      console.warn("Failed to load settings:", error);
    }
    return null;
  };

  try {
    const spaceId = await getSpaceId();

    if (spaceId) {
      await dispatch(changeSpace(spaceId)).unwrap();
      return spaceId;
    }

    console.log("No space available to initialize");
    return null;
  } catch (error) {
    console.error("Space initialization failed:", error);
    throw error;
  }
};
