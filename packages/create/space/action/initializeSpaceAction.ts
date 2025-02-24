// create/space/action/initializeSpaceAction.ts

import { NoloRootState } from "app/store";
import { getSettings } from "setting/settingSlice";
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
    try {
      const settings = await dispatch(getSettings(userId)).unwrap();
      const defaultSpaceId = settings?.userSetting?.defaultSpaceId;
      if (defaultSpaceId) {
        console.log("Using space ID from settings");
        return defaultSpaceId;
      }
    } catch (error) {
      console.warn("Failed to load settings:", error);
    }

    // 2. 从用户的空间成员资格中获取
    try {
      const memberships = await dispatch(
        fetchUserSpaceMemberships(userId)
      ).unwrap();
      if (memberships && memberships.length > 0) {
        return memberships[0].spaceId;
      }
    } catch (error) {
      console.warn("Failed to fetch memberships:", error);
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
