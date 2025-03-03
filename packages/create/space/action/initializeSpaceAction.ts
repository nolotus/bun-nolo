import { NoloRootState } from "app/store";
import { addSpace, changeSpace } from "../spaceSlice";
import { fetchUserSpaceMemberships } from "../spaceSlice";
import { setSettings } from "setting/settingSlice";
import { DataType } from "../../types";
import { read } from "database/dbSlice";
import { createSpaceKey } from "../spaceKeys";
import i18next from "i18next"; // 直接导入 i18next 实例

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

      // 处理空成员的情况
      if (memberships.length === 0) {
        try {
          // 使用 i18next.t，指定 "space" 命名空间
          const defaultSpaceName = i18next.t("default_space", {
            ns: "space", // 指定命名空间，与组件中一致
            defaultValue: "Default Space", // 默认值
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
      }

      // 处理有成员的情况
      if (memberships && memberships.length > 0) {
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
      }

      return null;
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
