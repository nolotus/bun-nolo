import { NoloRootState } from "app/store";
import { addSpace, changeSpace } from "./spaceSlice";
// Removed: import { fetchUserSpaceMemberships } from "../spaceSlice";
import { setSettings } from "setting/settingSlice";
import { DataType, SpaceMemberWithSpaceInfo } from "../types"; // Assuming SpaceMemberWithSpaceInfo is here
import { read } from "database/dbSlice";
import { createSpaceKey } from "./spaceKeys";
import i18next from "i18next";

// --- handleEmptyMembership remains the same ---
const handleEmptyMembership = async (dispatch: any) => {
  try {
    const defaultSpaceName = i18next.t("default_space", {
      ns: "space",
      defaultValue: "Default Space",
    });
    console.log("Creating default space with name:", defaultSpaceName);

    const newSpace = await dispatch(
      addSpace({
        name: defaultSpaceName,
      })
    ).unwrap();

    // Also update user settings to make this the default
    await dispatch(
      setSettings({
        defaultSpaceId: newSpace.spaceId,
        type: DataType.SETTING,
      })
    );
    console.log("Default space created and set:", newSpace.spaceId);
    return newSpace.spaceId;
  } catch (error) {
    console.error("Failed to create default space:", error);
    throw new Error("Failed to create default space");
  }
};

// --- Modified handleNonEmptyMembership ---
const handleNonEmptyMembership = async (
  dispatch: any,
  memberships: SpaceMemberWithSpaceInfo[], // Accept memberships as argument
  state: NoloRootState
): Promise<string | null> => {
  // Added return type annotation
  try {
    const defaultSpaceId = state.settings.defaultSpaceId;
    let candidateSpaceId: string | null = null;

    // 1. Check if a defaultSpaceId is set in settings
    if (defaultSpaceId) {
      // 2. Verify if this default space exists in the user's current memberships
      const defaultSpaceExistsInMemberships = memberships.some(
        (m) => m.spaceId === defaultSpaceId
      );

      if (defaultSpaceExistsInMemberships) {
        // 3. Optional: Quickly check if it exists in DB (changeSpace will do a more thorough check later)
        try {
          const result = await dispatch(
            read(createSpaceKey.space(defaultSpaceId))
          ).unwrap();
          if (result) {
            console.log(`Using preferred default space: ${defaultSpaceId}`);
            candidateSpaceId = defaultSpaceId;
          } else {
            console.warn(
              `Preferred default space ${defaultSpaceId} not found in DB. Falling back.`
            );
          }
        } catch (error) {
          console.warn(
            `Error reading preferred default space ${defaultSpaceId}. Falling back:`,
            error
          );
        }
      } else {
        console.warn(
          `Preferred default space ${defaultSpaceId} is not in the current user memberships. Falling back.`
        );
        // Maybe clear the setting if the user is no longer a member? Consider this for future enhancement.
        // dispatch(setSettings({ defaultSpaceId: null, type: DataType.SETTING }));
      }
    }

    // 4. Fallback: If no valid preferred default found, use the first space
    // Assuming the list fetched by fetchUserSpaceMemberships is already sorted (e.g., by joinedAt descending)
    if (!candidateSpaceId && memberships.length > 0) {
      candidateSpaceId = memberships[0].spaceId;
      console.log(`Falling back to first available space: ${candidateSpaceId}`);
    }

    if (!candidateSpaceId) {
      console.error(
        "handleNonEmptyMembership: Could not determine a fallback space."
      );
    }

    return candidateSpaceId;
  } catch (error) {
    console.error("Failed to handle non-empty membership:", error);
    // Re-throw to be caught by loadDefaultSpaceAction
    throw error;
  }
};

// --- Modified loadDefaultSpaceAction ---
export const loadDefaultSpaceAction = async (
  userId: string | undefined, // userId might not be strictly needed if memberships are fetched separately, but keep for context/logging
  thunkAPI
): Promise<string | null> => {
  // Added return type annotation
  const dispatch = thunkAPI.dispatch;
  const state = thunkAPI.getState() as NoloRootState;

  // 1. Check if a space is ALREADY loaded (e.g., by PageLoader via changeSpace)
  if (state.space.currentSpaceId) {
    console.log(
      `loadDefaultSpaceAction: Skipping, currentSpaceId already set to ${state.space.currentSpaceId}`
    );
    // Return the existing ID, or null, consistency depends on reducer expectations. Let's return null as we didn't load anything *new*.
    return null;
  }

  // 2. Check if memberSpaces list is available in the state
  // This relies on fetchUserSpaceMemberships being dispatched *before* this action in App.tsx
  const memberSpaces = state.space.memberSpaces;

  if (memberSpaces === null) {
    // fetchUserSpaceMemberships likely hasn't finished, or failed.
    // We cannot determine the default space without the list.
    console.warn(
      "loadDefaultSpaceAction: Skipping, memberSpaces not available in state yet."
    );
    return null; // Cannot proceed
  }

  // --- Proceed with determination logic ---
  let spaceIdToLoad: string | null = null;
  try {
    if (memberSpaces.length === 0) {
      // 3. No existing memberships found for the user. Create a default one.
      console.log(
        "loadDefaultSpaceAction: No memberships found, attempting to create default space."
      );
      spaceIdToLoad = await handleEmptyMembership(dispatch);
    } else {
      // 4. Memberships exist. Determine which one to load as default.
      console.log(
        "loadDefaultSpaceAction: Memberships found, determining default space to load."
      );
      spaceIdToLoad = await handleNonEmptyMembership(
        dispatch,
        memberSpaces,
        state
      );
    }

    // 5. If a space ID was determined (either created or selected), dispatch changeSpace
    if (spaceIdToLoad) {
      console.log(
        `loadDefaultSpaceAction: Attempting to dispatch changeSpace for ${spaceIdToLoad}`
      );
      // We dispatch changeSpace which handles loading the actual space data and setting currentSpaceId/currentSpace
      await dispatch(changeSpace(spaceIdToLoad)).unwrap();
      console.log(
        `loadDefaultSpaceAction: Successfully dispatched changeSpace for ${spaceIdToLoad}`
      );
      return spaceIdToLoad; // Return the ID of the space we initiated loading for
    } else {
      console.log(
        "loadDefaultSpaceAction: No default space could be determined or created."
      );
      return null;
    }
  } catch (error) {
    // Catch errors from handleEmptyMembership, handleNonEmptyMembership, or changeSpace dispatch
    console.error(
      "loadDefaultSpaceAction: Failed during default space processing:",
      error
    );
    // Allow the error to propagate so the 'rejected' reducer for loadDefaultSpaceAction can handle it
    throw error;
  }
};
