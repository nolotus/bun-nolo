// src/setting/settingSlice.ts

import type { RootState } from "app/store";
import { buildCreateSlice, asyncThunkCreator } from "@reduxjs/toolkit";
import { isProduction } from "utils/env";
// Import read and the NEW upsert action
import { read, upsert } from "database/dbSlice"; // Changed: Imported upsert instead of write
import { createUserKey } from "database/keys";
import { selectCurrentUserId } from "auth/authSlice";
import { DataType } from "create/types"; // Ensure DataType is imported if used in args type checking

interface SettingState {
  isAutoSync: boolean;
  currentServer: string;
  defaultSpaceId?: string | null; // Allow null if it can be unset
  syncServers: string[];
  showThinking: boolean; // 新增：是否显示思考过程，默认为true
  // Add other settings fields as needed
  [key: string]: any; // Allow other potential settings fields
}

const initialState: SettingState = {
  isAutoSync: false,
  currentServer: isProduction ? "https://cybot.one" : "https://cybot.run",
  defaultSpaceId: undefined, // Start with undefined or null
  syncServers: ["https://nolotus.com", "https://us.nolotus.com"],
  showThinking: true, // 新增：默认显示思考过程
};

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

const settingSlice = createSliceWithThunks({
  name: "settings",
  initialState,
  reducers: (create) => ({
    // getSettings remains the same
    getSettings: create.asyncThunk(
      async (userId: string, thunkAPI) => {
        const dispatch = thunkAPI.dispatch;
        const id = createUserKey.settings(userId);
        try {
          // Attempt to read settings
          const settings = await dispatch(read(id)).unwrap();
          if (settings) {
            // Ensure type field is handled if necessary upon read
            // For example, if settings read from DB don't have 'type'
            // but the state needs it, add it here or in fulfilled reducer.
            return settings;
          }
          // Return null or initial state part if not found? Or handle in fulfilled?
          return null; // Indicate not found
        } catch (error) {
          console.warn(
            `Settings for user ${userId} not found or error reading:`,
            error
          );
          // Depending on logic, you might return initial state, null, or rethrow
          return null; // Indicate not found or error
        }
      },
      {
        // Update state based on what getSettings returns
        fulfilled: (state, action) => {
          const loadedSettings = action.payload;
          if (loadedSettings) {
            // Merge fetched settings into state, potentially overwriting defaults
            // Be specific about which fields to update to avoid unexpected state changes
            state.defaultSpaceId =
              loadedSettings.defaultSpaceId ?? state.defaultSpaceId; // Use nullish coalescing
            state.isAutoSync = loadedSettings.isAutoSync ?? state.isAutoSync;
            state.syncServers = loadedSettings.syncServers ?? state.syncServers;
            state.showThinking =
              loadedSettings.showThinking ?? state.showThinking; // 新增：处理思考设置
            // Add any other settings fields here
          } else {
            // Handle case where settings were not found (e.g., keep initial state)
            console.log(
              "No existing settings found, keeping initial/current state."
            );
          }
        },
        // Optional: Add rejected handler
        rejected: (state, action) => {
          console.error("Failed to get settings:", action.error);
          // Optionally reset state or show error
        },
      }
    ),

    // addHostToCurrentServer remains the same
    addHostToCurrentServer: (state, action) => {
      const hostname = action.payload;
      // Basic validation might be needed here
      if (typeof hostname !== "string" || hostname.trim() === "") {
        console.warn("Invalid hostname provided to addHostToCurrentServer");
        return;
      }
      const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
      // Consider refining localhost/local check
      const isLocal =
        ["nolotus.local", "localhost"].includes(hostname) || isIpAddress;
      const protocol = isLocal ? "http" : "https";
      // Default ports might not always be correct, but okay for now
      const port = isLocal ? ":80" : ""; // Often standard ports are implicit
      state.currentServer = `${protocol}://${hostname}${port}`;
    },

    // 新增：快速切换思考显示的reducer
    toggleShowThinking: (state) => {
      state.showThinking = !state.showThinking;
    },

    // --- Modified setSettings Thunk ---
    setSettings: create.asyncThunk(
      // 'args' should contain only the settings fields to be updated
      async (args: Partial<SettingState> & { type?: DataType }, thunkAPI) => {
        const { dispatch, getState } = thunkAPI;
        const state = getState() as RootState; // Get root state
        const userId = selectCurrentUserId(state); // Get current user ID

        if (!userId) {
          console.error("Cannot set settings: User ID not found.");
          throw new Error("User ID not found"); // Reject the thunk
        }

        // We need the dbKey for the settings document
        const customKey = createUserKey.settings(userId);

        // Prepare the data payload for upsert:
        // Include the changes from 'args' and ensure 'type' is present if required by DB/sync logic.
        // The 'type' might be required by write/patch logic on the server or for local filtering.
        const dataToUpsert = {
          ...args,
          type: args.type || DataType.SETTING, // Ensure type is set, default to SETTING
        };

        try {
          // Dispatch upsert with the key and only the changes/new data
          // upsertAction will handle merging if the record exists locally,
          // or creating it if it doesn't.
          const result = await dispatch(
            upsert({
              dbKey: customKey,
              data: dataToUpsert, // Pass only the data to be set/updated
            })
          ).unwrap(); // unwrap to handle potential rejection

          console.log("Settings upsert result:", result);
          return result; // Return the result (usually the upserted data)
        } catch (error) {
          console.error("Failed to upsert settings:", error);
          // Re-throw the error so the 'rejected' case can be handled if needed
          throw error;
        }
      },
      {
        // Optional: Add fulfilled/rejected handlers for setSettings if needed
        // Fulfilled might not need to do anything if upsert's fulfilled handler updates the db slice
        // and components select directly from db slice or re-fetch settings.
        // However, updating the settings slice state directly might be desired for immediate UI feedback.
        fulfilled: (state, action) => {
          console.log("setSettings fulfilled. Payload:", action.payload);
          // action.payload here is the data returned by upsertAction
          // Update the settings slice state directly for immediate reflection
          if (action.payload) {
            // Iterate over the keys in the returned payload (which are the upserted settings)
            // and update the corresponding keys in the settings slice state.
            Object.keys(action.payload).forEach((key) => {
              // Avoid overwriting unrelated parts of the state if payload is partial
              if (key in state) {
                // Check if the key exists in the SettingState interface
                state[key] = action.payload[key];
              }
            });
          }
        },
        rejected: (state, action) => {
          console.error("setSettings rejected:", action.error);
          // Handle potential errors, e.g., show a notification
        },
      }
    ),
  }),
});

// Export actions
export const {
  addHostToCurrentServer,
  getSettings,
  setSettings,
  toggleShowThinking,
} = settingSlice.actions;

// Export selectors
export const selectCurrentServer = (state: RootState): string =>
  state.settings.currentServer;

// Make sure selectSyncServers selector exists if needed elsewhere
export const selectSyncServers = (state: RootState): string[] =>
  state.settings.syncServers; // Return type should be string[]

// Selector for defaultSpaceId
export const selectDefaultSpaceId = (
  state: RootState
): string | null | undefined => state.settings.defaultSpaceId;

// 新增：思考显示设置的selector
export const selectShowThinking = (state: RootState): boolean =>
  state.settings.showThinking;

// Export reducer
export default settingSlice.reducer;
