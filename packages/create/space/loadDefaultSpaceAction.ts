import { NoloRootState } from "app/store";
import { addSpace, changeSpace } from "./spaceSlice";
import { setSettings } from "setting/settingSlice";
import { DataType, SpaceMemberWithSpaceInfo } from "../types";
import { read } from "database/dbSlice";
import { createSpaceKey } from "./spaceKeys";
import i18next from "i18next";

const handleEmptyMembership = async (dispatch: any) => {
  try {
    const defaultSpaceName = i18next.t("default_space", {
      ns: "space",
      defaultValue: "Default Space",
    });

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
    throw new Error("Failed to create default space");
  }
};

const handleNonEmptyMembership = async (
  dispatch: any,
  memberships: SpaceMemberWithSpaceInfo[],
  state: NoloRootState
): Promise<string | null> => {
  try {
    const defaultSpaceId = state.settings.defaultSpaceId;
    let candidateSpaceId: string | null = null;

    if (defaultSpaceId) {
      const defaultSpaceExistsInMemberships = memberships.some(
        (m) => m.spaceId === defaultSpaceId
      );

      if (defaultSpaceExistsInMemberships) {
        try {
          const result = await dispatch(
            read(createSpaceKey.space(defaultSpaceId))
          ).unwrap();
          if (result) {
            candidateSpaceId = defaultSpaceId;
          }
        } catch (error) {
          // Fallback logic
        }
      }
    }

    if (!candidateSpaceId && memberships.length > 0) {
      candidateSpaceId = memberships[0].spaceId;
    }

    return candidateSpaceId;
  } catch (error) {
    throw error;
  }
};

export const loadDefaultSpaceAction = async (
  userId: string | undefined,
  thunkAPI
): Promise<string | null> => {
  const dispatch = thunkAPI.dispatch;
  const state = thunkAPI.getState() as NoloRootState;

  if (state.space.currentSpaceId) {
    return null;
  }

  const memberSpaces = state.space.memberSpaces;

  if (memberSpaces === null) {
    return null;
  }

  let spaceIdToLoad: string | null = null;
  try {
    if (memberSpaces.length === 0) {
      spaceIdToLoad = await handleEmptyMembership(dispatch);
    } else {
      spaceIdToLoad = await handleNonEmptyMembership(
        dispatch,
        memberSpaces,
        state
      );
    }

    if (spaceIdToLoad) {
      await dispatch(changeSpace(spaceIdToLoad)).unwrap();
      return spaceIdToLoad;
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
};
