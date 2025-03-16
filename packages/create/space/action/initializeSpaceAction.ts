import { NoloRootState } from "app/store";
import { addSpace, changeSpace } from "../spaceSlice";
import { fetchUserSpaceMemberships } from "../spaceSlice";
import { setSettings } from "setting/settingSlice";
import { DataType } from "../../types";
import { read } from "database/dbSlice";
import { createSpaceKey } from "../spaceKeys";
import i18next from "i18next";

// 处理空成员情况
const handleEmptyMembership = async (dispatch: any) => {
  try {
    const defaultSpaceName = i18next.t("default_space", {
      ns: "space",
      defaultValue: "Default Space",
    });
    console.log("defaultSpaceName", defaultSpaceName);

    const newSpace = await dispatch(
      addSpace({
        name: defaultSpaceName,
      })
    ).unwrap();

    await dispatch(
      setSettings({
        defaultSpaceId: newSpace.spaceId,
        type: DataType.SETTING,
      })
    );

    return newSpace.spaceId;
  } catch (error) {
    console.error("Failed to create default space:", error);
    throw new Error("Failed to create default space");
  }
};

// 处理有成员情况
const handleNonEmptyMembership = async (
  dispatch: any,
  memberships: any[],
  state: NoloRootState
) => {
  try {
    const defaultSpaceId = state.settings.defaultSpaceId;

    if (defaultSpaceId) {
      try {
        const result = await dispatch(
          read(createSpaceKey.space(defaultSpaceId))
        ).unwrap();

        if (result) {
          return defaultSpaceId;
        }
      } catch (error) {
        console.error("Failed to read default space:", error);
      }

      // 如果默认空间不存在,返回第一个成员空间
      return memberships[0].spaceId;
    }
    return memberships[0].spaceId; // 如果没有defaultSpaceId，直接返回第一个空间
  } catch (error) {
    console.error("Failed to handle non-empty membership:", error);
    throw error;
  }
};

export const initializeSpaceAction = async (
  userId: string | undefined,
  thunkAPI
) => {
  const dispatch = thunkAPI.dispatch;
  const state = thunkAPI.getState() as NoloRootState;

  const getSpaceId = async (): Promise<string | null> => {
    try {
      // 获取用户空间成员资格
      const memberships = await dispatch(
        fetchUserSpaceMemberships(userId)
      ).unwrap();

      // 根据成员情况选择处理方式
      if (memberships.length === 0) {
        return await handleEmptyMembership(dispatch);
      } else {
        return await handleNonEmptyMembership(dispatch, memberships, state);
      }
    } catch (error) {
      console.error("Failed to get space ID:", error);
      throw error;
    }
  };

  try {
    const spaceId = await getSpaceId();

    if (spaceId) {
      try {
        await dispatch(changeSpace(spaceId)).unwrap();
        return spaceId;
      } catch (error) {
        console.error("Failed to change space:", error);
        throw new Error("Failed to change space");
      }
    }

    console.log("No space available to initialize");
    return null;
  } catch (error) {
    console.error("Space initialization failed:", error);
    throw error;
  }
};
