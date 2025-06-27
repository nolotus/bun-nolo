import { RootState } from "app/store";
import { SpaceMemberWithSpaceInfo } from "app/types";
import i18n from "app/i18n";

import { read } from "database/dbSlice";
import { setSettings } from "setting/settingSlice";

import { addSpace, changeSpace } from "./spaceSlice";
import { DataType } from "../types";
import { createSpaceKey } from "./spaceKeys";

const handleEmptyMembership = async (dispatch: any) => {
  try {
    const defaultSpaceName = i18n.t("default_space", {
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
  state: RootState
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
  const state = thunkAPI.getState() as RootState;

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
